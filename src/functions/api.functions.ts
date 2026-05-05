import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { authenticateRequest, hasScope, type ApiAuthContext } from "@/lib/apiAuth";

/**
 * GET /api/campaigns - List campaigns
 * Supports: pagination, filtering, sorting
 */
export const apiListCampaigns = createServerFn({ method: "POST" })
  .validator((d: {
    auth: { userId: string; scopes: string[] };
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    sortBy?: string;
    order?: "asc" | "desc";
  }) =>
    z.object({
      auth: z.object({
        userId: z.string().uuid(),
        scopes: z.array(z.string()),
      }),
      page: z.number().int().positive().optional().default(1),
      limit: z.number().int().min(1).max(100).optional().default(20),
      category: z.string().optional(),
      status: z.string().optional(),
      sortBy: z.string().optional().default("created_at"),
      order: z.enum(["asc", "desc"]).optional().default("desc"),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    if (!hasScope(data.auth, "read")) {
      throw new Error("Insufficient permissions");
    }

    const offset = (data.page - 1) * data.limit;

    let query = supabaseAdmin
      .from("campaigns")
      .select("*, users:user_id(display_name)", { count: "exact" });

    if (data.category) query = query.eq("category", data.category);
    if (data.status) query = query.eq("status", data.status);

    const { data: campaigns, error, count } = await query
      .order(data.sortBy, { ascending: data.order === "asc" })
      .range(offset, offset + data.limit - 1);

    if (error) throw new Error(error.message);

    return {
      data: campaigns || [],
      pagination: {
        page: data.page,
        limit: data.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / data.limit),
      },
    };
  });

/**
 * GET /api/campaigns/:id - Get single campaign
 */
export const apiGetCampaign = createServerFn({ method: "POST" })
  .validator((d: { auth: ApiAuthContext; id: string }) =>
    z.object({
      auth: z.object({
        userId: z.string().uuid(),
        scopes: z.array(z.string()),
      }),
      id: z.string().uuid(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    if (!hasScope(data.auth, "read")) {
      throw new Error("Insufficient permissions");
    }

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
 * POST /api/donations - Create donation
 */
export const apiCreateDonation = createServerFn({ method: "POST" })
  .validator((d: {
    auth: ApiAuthContext;
    campaignId: string;
    amount: number;
    anonymous?: boolean;
    message?: string;
  }) =>
    z.object({
      auth: z.object({
        userId: z.string().uuid(),
        scopes: z.array(z.string()),
      }),
      campaignId: z.string().uuid(),
      amount: z.number().positive(),
      anonymous: z.boolean().optional().default(false),
      message: z.string().max(500).optional(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    if (!hasScope(data.auth, "write")) {
      throw new Error("Insufficient permissions");
    }

    const { data: donation, error } = await supabaseAdmin
      .from("donations")
      .insert({
        campaign_id: data.campaignId,
        donor_user_id: data.auth.userId,
        amount: data.amount,
        anonymous: data.anonymous,
        message: data.message,
        payment_method: "api",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return donation;
  });

/**
 * GET /api/users/:id - Get user profile
 */
export const apiGetUser = createServerFn({ method: "POST" })
  .validator((d: { auth: ApiAuthContext; userId: string }) =>
    z.object({
      auth: z.object({
        userId: z.string().uuid(),
        scopes: z.array(z.string()),
      }),
      userId: z.string().uuid(),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    if (!hasScope(data.auth, "read")) {
      throw new Error("Insufficient permissions");
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("id, display_name, avatar_url, created_at")
      .eq("id", data.userId)
      .single();

    if (error) throw new Error(error.message);

    return user;
  });
