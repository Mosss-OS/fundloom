import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const SyncSchema = z.object({
  privyId: z.string().min(1).max(200),
  email: z.string().email().max(255),
  walletAddress: z.string().min(10).max(80).nullable().optional(),
  displayName: z.string().min(1).max(80).nullable().optional(),
});

export async function syncUser(data: z.infer<typeof SyncSchema>) {
  const validated = SyncSchema.parse(data);
  
  const { data: existing, error: selErr } = await supabase
    .from("users")
    .select("*")
    .eq("privy_id", validated.privyId)
    .maybeSingle();
  
  if (selErr) throw new Error(selErr.message);

  if (existing) {
    const { data: updated, error } = await supabase
      .from("users")
      .update({
        email: validated.email,
        wallet_address: validated.walletAddress ?? existing.wallet_address,
        display_name: validated.displayName ?? existing.display_name,
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  }

  const { data: inserted, error } = await supabase
    .from("users")
    .insert({
      privy_id: validated.privyId,
      email: validated.email,
      wallet_address: validated.walletAddress ?? null,
      display_name: validated.displayName ?? null,
    })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return inserted;
}

export async function getUserStats(data: { userId: string }) {
  const { data: campaigns } = await supabase
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
}

export async function getRecentDonations(data: { userId: string; limit?: number }) {
  const { data: donations, error } = await supabase
    .from("donations")
    .select("id,amount,created_at,tx_hash,payment_method,campaign_id,campaigns(id,title)")
    .eq("donor_user_id", data.userId)
    .order("created_at", { ascending: false })
    .limit(data.limit ?? 10);

  if (error) throw new Error(error.message);
  return donations ?? [];
}
