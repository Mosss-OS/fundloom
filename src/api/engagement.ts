import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const PostUpdateSchema = z.object({
  campaignId: z.string().uuid(),
  authorId: z.string().uuid(),
  title: z.string().trim().min(2).max(200),
  body: z.string().trim().min(2).max(5000),
});

export async function postCampaignUpdate(data: z.infer<typeof PostUpdateSchema>) {
  const validated = PostUpdateSchema.parse(data);
  
  const { data: campaign, error: cErr } = await supabase
    .from("campaigns")
    .select("user_id")
    .eq("id", validated.campaignId)
    .single();
  
  if (cErr) throw new Error(cErr.message);
  if (campaign.user_id !== validated.authorId) throw new Error("Only the creator can post updates.");

  const { data: row, error } = await supabase
    .from("campaign_updates")
    .insert({
      campaign_id: validated.campaignId,
      author_id: validated.authorId,
      title: validated.title,
      body: validated.body,
    })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return row;
}

const DeleteUpdateSchema = z.object({
  updateId: z.string().uuid(),
  actorUserId: z.string().uuid(),
});

export async function deleteCampaignUpdate(data: z.infer<typeof DeleteUpdateSchema>) {
  const validated = DeleteUpdateSchema.parse(data);
  
  const { data: row, error: selErr } = await supabase
    .from("campaign_updates")
    .select("author_id")
    .eq("id", validated.updateId)
    .single();
  
  if (selErr) throw new Error(selErr.message);
  if (row.author_id !== validated.actorUserId) throw new Error("Not your update.");
  
  const { error } = await supabase.from("campaign_updates").delete().eq("id", validated.updateId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

const PostCommentSchema = z.object({
  campaignId: z.string().uuid(),
  authorId: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export async function postCampaignComment(data: z.infer<typeof PostCommentSchema>) {
  const validated = PostCommentSchema.parse(data);
  
  const { data: row, error } = await supabase
    .from("campaign_comments")
    .insert({
      campaign_id: validated.campaignId,
      author_id: validated.authorId,
      body: validated.body,
    })
    .select("*, users:author_id(display_name,email,wallet_address)")
    .single();
  
  if (error) throw new Error(error.message);
  return row;
}

const DeleteCommentSchema = z.object({
  commentId: z.string().uuid(),
  actorUserId: z.string().uuid(),
});

export async function deleteCampaignComment(data: z.infer<typeof DeleteCommentSchema>) {
  const validated = DeleteCommentSchema.parse(data);
  
  const { data: row, error: selErr } = await supabase
    .from("campaign_comments")
    .select("author_id, campaign_id")
    .eq("id", validated.commentId)
    .single();
  
  if (selErr) throw new Error(selErr.message);

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("user_id")
    .eq("id", row.campaign_id)
    .single();

  const isAuthor = row.author_id === validated.actorUserId;
  const isOwner = campaign?.user_id === validated.actorUserId;
  if (!isAuthor && !isOwner) throw new Error("Not allowed.");

  const { error } = await supabase
    .from("campaign_comments")
    .delete()
    .eq("id", validated.commentId);
  
  if (error) throw new Error(error.message);
  return { ok: true };
}

const RequestRefundSchema = z.object({
  campaignId: z.string().uuid(),
  donorUserId: z.string().uuid(),
});

export async function requestRefund(data: z.infer<typeof RequestRefundSchema>) {
  try {
    await supabase.rpc("mark_expired_campaigns");
  } catch {
    /* non-fatal */
  }

  const { data: campaign, error: cErr } = await supabase
    .from("campaigns")
    .select("status, deadline, amount_raised, goal_amount")
    .eq("id", data.campaignId)
    .single();
  
  if (cErr) throw new Error(cErr.message);

  const past = new Date(campaign.deadline).getTime() < Date.now();
  const underGoal = Number(campaign.amount_raised) < Number(campaign.goal_amount);
  const isFailed = campaign.status === "failed" || (past && underGoal);
  
  if (!isFailed) throw new Error("Campaign is still active or fully funded.");

  const { data: donations, error: dErr } = await supabase
    .from("donations")
    .select("id, amount, donor_wallet")
    .eq("campaign_id", data.campaignId)
    .eq("donor_user_id", data.donorUserId);
  
  if (dErr) throw new Error(dErr.message);
  if (!donations || donations.length === 0) {
    throw new Error("No donations found for your account on this campaign.");
  }

  const { data: existing } = await supabase
    .from("refunds")
    .select("amount")
    .eq("campaign_id", data.campaignId)
    .eq("donor_user_id", data.donorUserId);
  
  const refunded = (existing ?? []).reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalDonated = donations.reduce((s, d) => s + Number(d.amount || 0), 0);
  const owed = Math.max(0, totalDonated - refunded);
  
  if (owed <= 0) throw new Error("Refund already processed.");

  const txHash = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const { data: refund, error } = await supabase
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
}
