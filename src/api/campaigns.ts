import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const CATEGORIES = [
  "art", "tech", "community", "education", "health",
  "environment", "music", "food", "gaming", "other",
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

export async function createCampaign(data: z.infer<typeof CreateSchema>) {
  const validated = CreateSchema.parse(data);
  const { data: row, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: validated.userId,
      title: validated.title,
      description: validated.description,
      goal_amount: validated.goalAmount,
      deadline: validated.deadline,
      cover_image_url: validated.coverImageUrl ?? null,
      payout_preference: validated.payoutPreference,
      category: validated.category,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function fetchCampaigns(params?: { userId?: string; limit?: number; category?: CampaignCategory }) {
  try {
    await supabase.rpc("mark_expired_campaigns");
  } catch {
    /* non-fatal */
  }

  let q = supabase
    .from("campaigns")
    .select("*, users:user_id(display_name,email,wallet_address)")
    .order("created_at", { ascending: false })
    .limit(params?.limit ?? 50);
  
  if (params?.userId) q = q.eq("user_id", params.userId);
  if (params?.category) q = q.eq("category", params.category);
  
  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
}

export async function fetchCampaign(params: { id: string; viewerUserId?: string | null }) {
  try {
    await supabase.rpc("mark_expired_campaigns");
  } catch {
    /* non-fatal */
  }

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*, users:user_id(display_name,email,wallet_address)")
    .eq("id", params.id)
    .maybeSingle();
  
  if (error) throw new Error(error.message);
  if (!campaign) return null;

  const [donationsR, updatesR, commentsR] = await Promise.all([
    supabase
      .from("donations")
      .select("*")
      .eq("campaign_id", params.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("campaign_updates")
      .select("*")
      .eq("campaign_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("campaign_comments")
      .select("*, users:author_id(display_name,email,wallet_address)")
      .eq("campaign_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  // Refund eligibility for the viewer
  let refundEligible = false;
  let refundedAmount = 0;
  let viewerDonatedTotal = 0;
  
  if (params.viewerUserId) {
    const past = new Date(campaign.deadline).getTime() < Date.now();
    const underGoal = Number(campaign.amount_raised) < Number(campaign.goal_amount);
    const isFailed = campaign.status === "failed" || (past && underGoal);
    
    if (isFailed) {
      const { data: myDons } = await supabase
        .from("donations")
        .select("amount")
        .eq("campaign_id", params.id)
        .eq("donor_user_id", params.viewerUserId);
      viewerDonatedTotal = (myDons ?? []).reduce((s, d) => s + Number(d.amount || 0), 0);
      
      const { data: myRefs } = await supabase
        .from("refunds")
        .select("amount")
        .eq("campaign_id", params.id)
        .eq("donor_user_id", params.viewerUserId);
      refundedAmount = (myRefs ?? []).reduce((s, r) => s + Number(r.amount || 0), 0);
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
}

export async function uploadCampaignCover(data: {
  userId: string;
  fileName: string;
  contentType: string;
  fileBase64: string;
}) {
  const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
  if (!allowed.includes(data.contentType.toLowerCase())) {
    throw new Error("Unsupported image type.");
  }
  
  const bytes = Uint8Array.from(atob(data.fileBase64), (c) => c.charCodeAt(0));
  if (bytes.length > 4 * 1024 * 1024) throw new Error("Max 4 MB.");

  const ext = data.fileName
    .split(".")
    .pop()
    ?.toLowerCase()
    .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${data.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("campaign-covers")
    .upload(path, bytes, {
      contentType: data.contentType,
      upsert: false,
    });
  
  if (upErr) throw new Error(upErr.message);

  const { data: pub } = supabase.storage.from("campaign-covers").getPublicUrl(path);
  return { url: pub.publicUrl, path };
}
