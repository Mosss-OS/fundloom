import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CATEGORIES = [
  "art",
  "tech",
  "community",
  "education",
  "health",
  "environment",
  "music",
  "food",
  "gaming",
  "other",
] as const;
export type CampaignCategory = (typeof CATEGORIES)[number];

const CreateSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(4000),
  goalAmount: z.number().positive().max(10_000_000),
  deadline: z.string().min(8).max(40),
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  payoutPreference: z.enum(["crypto", "fiat"]).default("crypto"),
  category: z.enum(CATEGORIES).default("other"),
});

export const createCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof CreateSchema>) => CreateSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("campaigns")
      .insert({
        user_id: data.userId,
        title: data.title,
        description: data.description,
        goal_amount: data.goalAmount,
        deadline: data.deadline,
        cover_image_url: data.coverImageUrl ?? null,
        payout_preference: data.payoutPreference,
        category: data.category,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const fetchCampaigns = createServerFn({ method: "POST" })
  .inputValidator((d: { userId?: string; limit?: number; category?: CampaignCategory }) =>
    z
      .object({
        userId: z.string().uuid().optional(),
        limit: z.number().int().positive().max(100).optional(),
        category: z.enum(CATEGORIES).optional(),
      })
      .parse(d ?? {})
  )
  .handler(async ({ data }) => {
    // Background sweep so failed-campaign UI is fresh.
    try {
      await supabaseAdmin.rpc("mark_expired_campaigns");
    } catch {
      /* non-fatal */
    }

    let q = supabaseAdmin
      .from("campaigns")
      .select("*, users:user_id(display_name,email,wallet_address)")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (data.userId) q = q.eq("user_id", data.userId);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const fetchCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; viewerUserId?: string | null }) =>
    z
      .object({
        id: z.string().uuid(),
        viewerUserId: z.string().uuid().nullable().optional(),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    try {
      await supabaseAdmin.rpc("mark_expired_campaigns");
    } catch {
      /* non-fatal */
    }

    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .select("*, users:user_id(display_name,email,wallet_address)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!campaign) return null;

    const [donationsR, updatesR, commentsR] = await Promise.all([
      supabaseAdmin
        .from("donations")
        .select("*")
        .eq("campaign_id", data.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("campaign_updates")
        .select("*")
        .eq("campaign_id", data.id)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("campaign_comments")
        .select("*, users:author_id(display_name,email,wallet_address)")
        .eq("campaign_id", data.id)
        .order("created_at", { ascending: false }),
    ]);

    // Refund eligibility for the viewer
    let refundEligible = false;
    let refundedAmount = 0;
    let viewerDonatedTotal = 0;
    if (data.viewerUserId) {
      const past = new Date(campaign.deadline).getTime() < Date.now();
      const underGoal =
        Number(campaign.amount_raised) < Number(campaign.goal_amount);
      const isFailed = campaign.status === "failed" || (past && underGoal);
      if (isFailed) {
        const { data: myDons } = await supabaseAdmin
          .from("donations")
          .select("amount")
          .eq("campaign_id", data.id)
          .eq("donor_user_id", data.viewerUserId);
        viewerDonatedTotal = (myDons ?? []).reduce(
          (s, d) => s + Number(d.amount || 0),
          0
        );
        const { data: myRefs } = await supabaseAdmin
          .from("refunds")
          .select("amount")
          .eq("campaign_id", data.id)
          .eq("donor_user_id", data.viewerUserId);
        refundedAmount = (myRefs ?? []).reduce(
          (s, r) => s + Number(r.amount || 0),
          0
        );
        refundEligible = viewerDonatedTotal - refundedAmount > 0;
      }
    }

    return {
      campaign,
      donations: donationsR.data ?? [],
      updates: updatesR.data ?? [],
      comments: commentsR.data ?? [],
      viewer: {
        refundEligible,
        refundedAmount,
        donatedTotal: viewerDonatedTotal,
      },
    };
  });

/* ------------------------- Cover image upload ------------------------- */

const UploadCoverSchema = z.object({
  userId: z.string().uuid(),
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(120),
  // base64 (no data: prefix)
  fileBase64: z.string().min(8),
});

export const uploadCampaignCover = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof UploadCoverSchema>) => UploadCoverSchema.parse(d))
  .handler(async ({ data }) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowed.includes(data.contentType.toLowerCase())) {
      throw new Error("Unsupported image type.");
    }
    const bytes = Uint8Array.from(atob(data.fileBase64), (c) => c.charCodeAt(0));
    if (bytes.length > 4 * 1024 * 1024) throw new Error("Max 4 MB.");

    const ext =
      data.fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "jpg";
    const path = `${data.userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}.${ext}`;

    const { error: upErr } = await supabaseAdmin.storage
      .from("campaign-covers")
      .upload(path, bytes, {
        contentType: data.contentType,
        upsert: false,
      });
    if (upErr) throw new Error(upErr.message);

    const { data: pub } = supabaseAdmin.storage
      .from("campaign-covers")
      .getPublicUrl(path);
    return { url: pub.publicUrl, path };
  });

/* ------------------------- Verification (admin) ----------------------- */

const VerifySchema = z.object({
  campaignId: z.string().uuid(),
  actorUserId: z.string().uuid(),
  isVerified: z.boolean(),
});

export const setCampaignVerified = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof VerifySchema>) => VerifySchema.parse(d))
  .handler(async ({ data }) => {
    const { data: ok } = await supabaseAdmin.rpc("is_admin_user", {
      _user_id: data.actorUserId,
    });
    if (!ok) throw new Error("Admins only.");
    const { data: row, error } = await supabaseAdmin
      .from("campaigns")
      .update({ is_verified: data.isVerified })
      .eq("id", data.campaignId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
