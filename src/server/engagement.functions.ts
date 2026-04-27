import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/* ----------------------------- Updates -------------------------------- */

const PostUpdateSchema = z.object({
  campaignId: z.string().uuid(),
  authorId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(5000),
});

export const postCampaignUpdate = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof PostUpdateSchema>) => PostUpdateSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: campaign, error: cErr } = await supabaseAdmin
      .from("campaigns")
      .select("user_id")
      .eq("id", data.campaignId)
      .single();
    if (cErr) throw new Error(cErr.message);
    if (campaign.user_id !== data.authorId)
      throw new Error("Only the creator can post updates.");

    const { data: row, error } = await supabaseAdmin
      .from("campaign_updates")
      .insert({
        campaign_id: data.campaignId,
        author_id: data.authorId,
        title: data.title,
        body: data.body,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const DeleteUpdateSchema = z.object({
  updateId: z.string().uuid(),
  actorUserId: z.string().uuid(),
});

export const deleteCampaignUpdate = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof DeleteUpdateSchema>) => DeleteUpdateSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: row, error: selErr } = await supabaseAdmin
      .from("campaign_updates")
      .select("author_id")
      .eq("id", data.updateId)
      .single();
    if (selErr) throw new Error(selErr.message);
    if (row.author_id !== data.actorUserId) throw new Error("Not your update.");
    const { error } = await supabaseAdmin
      .from("campaign_updates")
      .delete()
      .eq("id", data.updateId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ----------------------------- Comments ------------------------------- */

const PostCommentSchema = z.object({
  campaignId: z.string().uuid(),
  authorId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export const postCampaignComment = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof PostCommentSchema>) => PostCommentSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("campaign_comments")
      .insert({
        campaign_id: data.campaignId,
        author_id: data.authorId,
        body: data.body,
      })
      .select("*, users:author_id(display_name,email,wallet_address)")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const DeleteCommentSchema = z.object({
  commentId: z.string().uuid(),
  actorUserId: z.string().uuid(),
});

export const deleteCampaignComment = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof DeleteCommentSchema>) => DeleteCommentSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: row, error: selErr } = await supabaseAdmin
      .from("campaign_comments")
      .select("author_id, campaign_id")
      .eq("id", data.commentId)
      .single();
    if (selErr) throw new Error(selErr.message);

    const { data: campaign } = await supabaseAdmin
      .from("campaigns")
      .select("user_id")
      .eq("id", row.campaign_id)
      .single();

    const isAuthor = row.author_id === data.actorUserId;
    const isOwner = campaign?.user_id === data.actorUserId;
    if (!isAuthor && !isOwner) throw new Error("Not allowed.");

    const { error } = await supabaseAdmin
      .from("campaign_comments")
      .delete()
      .eq("id", data.commentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ----------------------------- Refunds -------------------------------- */

const RequestRefundSchema = z.object({
  campaignId: z.string().uuid(),
  donorUserId: z.string().uuid(),
});

export const requestRefund = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof RequestRefundSchema>) => RequestRefundSchema.parse(d))
  .handler(async ({ data }) => {
    try {
      await supabaseAdmin.rpc("mark_expired_campaigns");
    } catch {
      /* non-fatal */
    }

    const { data: campaign, error: cErr } = await supabaseAdmin
      .from("campaigns")
      .select("status, deadline, amount_raised, goal_amount")
      .eq("id", data.campaignId)
      .single();
    if (cErr) throw new Error(cErr.message);

    const past = new Date(campaign.deadline).getTime() < Date.now();
    const underGoal = Number(campaign.amount_raised) < Number(campaign.goal_amount);
    const isFailed = campaign.status === "failed" || (past && underGoal);
    if (!isFailed) throw new Error("Campaign is still active or fully funded.");

    const { data: donations, error: dErr } = await supabaseAdmin
      .from("donations")
      .select("id, amount, donor_wallet")
      .eq("campaign_id", data.campaignId)
      .eq("donor_user_id", data.donorUserId);
    if (dErr) throw new Error(dErr.message);
    if (!donations || donations.length === 0) {
      throw new Error("No donations found for your account on this campaign.");
    }

    const { data: existing } = await supabaseAdmin
      .from("refunds")
      .select("amount")
      .eq("campaign_id", data.campaignId)
      .eq("donor_user_id", data.donorUserId);
    const refunded = (existing ?? []).reduce((s, r) => s + Number(r.amount || 0), 0);
    const totalDonated = donations.reduce((s, d) => s + Number(d.amount || 0), 0);
    const owed = Math.max(0, totalDonated - refunded);
    if (owed <= 0) throw new Error("Refund already processed.");

    const txHash =
      "0x" +
      Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const { data: refund, error } = await supabaseAdmin
      .from("refunds")
      .insert({
        campaign_id: data.campaignId,
        donor_user_id: data.donorUserId,
        donor_wallet: donations[0].donor_wallet,
        amount: owed,
        tx_hash: txHash,
        status: "confirmed",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return refund;
  });

export const sweepFailedCampaigns = createServerFn({ method: "POST" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("mark_expired_campaigns");
  if (error) throw new Error(error.message);
  return { affected: Number(data ?? 0) };
});
