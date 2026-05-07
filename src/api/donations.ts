import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const FundSchema = z.object({
  campaignId: z.string().uuid(),
  donorWallet: z.string().min(10).max(80),
  donorUserId: z.string().uuid().optional().nullable(),
  amount: z.number().positive().max(1_000_000),
  paymentMethod: z.enum(["crypto", "fiat"]),
  txHash: z.string().min(4).max(120).optional().nullable(),
});

export async function fundCampaign(data: z.infer<typeof FundSchema>) {
  const validated = FundSchema.parse(data);
  
  // Generate a mock tx hash for crypto if none provided
  const txHash = validated.txHash ?? (
    validated.paymentMethod === "crypto"
      ? "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      : `fiat_${Date.now()}`
  );

  const { data: donation, error } = await supabase
    .from("donations")
    .insert({
      campaign_id: validated.campaignId,
      donor_user_id: validated.donorUserId ?? null,
      donor_wallet: validated.donorWallet,
      amount: validated.amount,
      payment_method: validated.paymentMethod,
      tx_hash: txHash,
    })
    .select()
    .single();
  
  if (error) throw new Error(error.message);

  // Increment raised total atomically
  const { error: rpcErr } = await supabase.rpc("increment_campaign_raised", {
    _campaign_id: validated.campaignId,
    _amount: validated.amount,
  });
  
  if (rpcErr) throw new Error(rpcErr.message);

  // Record transaction for the donor (if known)
  if (validated.donorUserId) {
    await supabase.from("transactions").insert({
      user_id: validated.donorUserId,
      campaign_id: validated.campaignId,
      type: "donation",
      amount: validated.amount,
      status: "confirmed",
      tx_hash: txHash,
    });
  }

  return donation;
}

const WithdrawSchema = z.object({
  userId: z.string().uuid(),
  campaignId: z.string().uuid(),
  amount: z.number().positive(),
});

export async function withdrawFunds(data: z.infer<typeof WithdrawSchema>) {
  const validated = WithdrawSchema.parse(data);
  
  const { data: campaign, error: cErr } = await supabase
    .from("campaigns")
    .select("user_id,amount_raised")
    .eq("id", validated.campaignId)
    .single();
  
  if (cErr) throw new Error(cErr.message);
  if (campaign.user_id !== validated.userId) throw new Error("Not your campaign");
  if (Number(campaign.amount_raised) < validated.amount) throw new Error("Insufficient funds");

  const txHash = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const { data: tx, error } = await supabase
    .from("transactions")
    .insert({
      user_id: validated.userId,
      campaign_id: validated.campaignId,
      type: "withdrawal",
      amount: validated.amount,
      status: "confirmed",
      tx_hash: txHash,
    })
    .select()
    .single();
  
  if (error) throw new Error(error.message);

  await supabase
    .from("campaigns")
    .update({ amount_raised: Number(campaign.amount_raised) - validated.amount })
    .eq("id", validated.campaignId);

  return tx;
}
