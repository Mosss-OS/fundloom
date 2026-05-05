import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SyncSchema = z.object({
  privyId: z.string().min(1).max(200),
  email: z.string().email().max(255),
  walletAddress: z.string().min(10).max(80).nullable().optional(),
  displayName: z.string().min(1).max(80).nullable().optional(),
});

export const syncUser = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof SyncSchema>) => SyncSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("privy_id", data.privyId)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);

    if (existing) {
      const { data: updated, error } = await supabaseAdmin
        .from("users")
        .update({
          email: data.email,
          wallet_address: data.walletAddress ?? existing.wallet_address,
          display_name: data.displayName ?? existing.display_name,
        })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("users")
      .insert({
        privy_id: data.privyId,
        email: data.email,
        wallet_address: data.walletAddress ?? null,
        display_name: data.displayName ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });

export const getUserStats = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string }) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: campaigns } = await supabaseAdmin
      .from("campaigns")
      .select("id,amount_raised,status")
      .eq("user_id", data.userId);

    const totalRaised = (campaigns ?? []).reduce((s, c) => s + Number(c.amount_raised || 0), 0);
    const activeCount = (campaigns ?? []).filter((c) => c.status === "active").length;

    return {
      totalRaised,
      activeCount,
      campaignCount: campaigns?.length ?? 0,
    };
  });
