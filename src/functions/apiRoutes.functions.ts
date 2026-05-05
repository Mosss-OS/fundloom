import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { authenticateRequest, hasScope, type ApiAuthContext } from "@/lib/apiAuth";

/**
 * API middleware helper - extracts auth from request
 */
async function getAuthFromRequest(request: Request): Promise<ApiAuthContext> {
  const auth = await authenticateRequest(request);
  if (!auth) throw new Error("Unauthorized");
  return auth;
}

/**
 * GET /api/campaigns
 * Query params: page, limit, category, status, sortBy, order
 */
export const handleGetCampaigns = createServerFn({ method: "POST" })
  .validator((d: { request: any }) =>
    z.object({
      request: z.any(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const auth = await getAuthFromRequest(data.request);
    if (!hasScope(auth, "read")) throw new Error("Insufficient permissions");

    const url = new URL(data.request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const sortBy = url.searchParams.get("sortBy") || "created_at";
    const order = (url.searchParams.get("order") || "desc") as "asc" | "desc";

    const offset = (page - 1) * limit;
    let query = supabaseAdmin
      .from("campaigns")
      .select("*, users:user_id(display_name)", { count: "exact" });

    if (category) query = query.eq("category", category);
    if (status) query = query.eq("status", status);

    const { data: campaigns, error, count } = await query
      .order(sortBy, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);

    return {
      data: campaigns || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  });

/**
 * GET /api/campaigns/:id
 */
export const handleGetCampaign = createServerFn({ method: "POST" })
  .validator((d: { request: any; id: string }) =>
    z.object({
      request: z.any(),
      id: z.string().uuid(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const auth = await getAuthFromRequest(data.request);
    if (!hasScope(auth, "read")) throw new Error("Insufficient permissions");

    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .select("*, users:user_id(display_name, email)")
      .eq("id", data.id)
      .single();

    if (error) throw new Error(error.message);
    if (!campaign) throw new Error("Campaign not found");

    return campaign;
  });

/**
 * POST /api/donations
 */
export const handleCreateDonation = createServerFn({ method: "POST" })
  .validator((d: { request: any; body: any }) =>
    z.object({
      request: z.any(),
      body: z.object({
        campaignId: z.string().uuid(),
        amount: z.number().positive(),
        anonymous: z.boolean().optional().default(false),
        message: z.string().max(500).optional(),
      }),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const auth = await getAuthFromRequest(data.request);
    if (!hasScope(auth, "write")) throw new Error("Insufficient permissions");

    const { data: donation, error } = await supabaseAdmin
      .from("donations")
      .insert({
        campaign_id: data.body.campaignId,
        donor_user_id: auth.userId,
        amount: data.body.amount,
        anonymous: data.body.anonymous,
        message: data.body.message,
        payment_method: "api",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return donation;
  });
