import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CreateSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(4000),
  goalAmount: z.number().positive().max(10_000_000),
  deadline: z.string().min(8).max(40), // ISO
  coverImageUrl: z.string().url().max(500).optional().nullable(),
  payoutPreference: z.enum(["crypto", "fiat"]).default("crypto"),
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
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const fetchCampaigns = createServerFn({ method: "POST" })
  .inputValidator((d: { userId?: string; limit?: number }) =>
    z
      .object({
        userId: z.string().uuid().optional(),
        limit: z.number().int().positive().max(100).optional(),
      })
      .parse(d ?? {})
  )
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("campaigns")
      .select("*, users:user_id(display_name,email,wallet_address)")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (data.userId) q = q.eq("user_id", data.userId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const fetchCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string }) =>
    z.object({ id: z.string().uuid() }).parse(d)
  )
  .handler(async ({ data }) => {
    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .select("*, users:user_id(display_name,email,wallet_address)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!campaign) return null;

    const { data: donations } = await supabaseAdmin
      .from("donations")
      .select("*")
      .eq("campaign_id", data.id)
      .order("created_at", { ascending: false })
      .limit(50);

    return { campaign, donations: donations ?? [] };
  });