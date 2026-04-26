import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FundSchema = z.object({
  campaignId: z.string().uuid(),
  donorWallet: z.string().min(10).max(80),
  donorUserId: z.string().uuid().optional().nullable(),
  amount: z.number().positive().max(1_000_000),
  paymentMethod: z.enum(["crypto", "fiat"]),
  txHash: z.string().min(4).max(120).optional().nullable(),
});

export const fundCampaign = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof FundSchema>) => FundSchema.parse(d))
  .handler(async ({ data }) => {
    // Generate a mock tx hash for crypto if none provided (MVP mock flow)
    const txHash =
      data.txHash ??
      (data.paymentMethod === "crypto"
        ? "0x" +
          Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
        : `fiat_${Date.now()}`);

    const { data: donation, error } = await supabaseAdmin
      .from("donations")
      .insert({
        campaign_id: data.campaignId,
        donor_user_id: data.donorUserId ?? null,
        donor_wallet: data.donorWallet,
        amount: data.amount,
        payment_method: data.paymentMethod,
        tx_hash: txHash,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Increment raised total atomically
    const { error: rpcErr } = await supabaseAdmin.rpc("increment_campaign_raised", {
      _campaign_id: data.campaignId,
      _amount: data.amount,
    });
    if (rpcErr) throw new Error(rpcErr.message);

    // Record transaction for the donor (if known)
    if (data.donorUserId) {
      await supabaseAdmin.from("transactions").insert({
        user_id: data.donorUserId,
        campaign_id: data.campaignId,
        type: "donation",
        amount: data.amount,
        status: "confirmed",
        tx_hash: txHash,
      });
    }

    return donation;
  });

const WithdrawSchema = z.object({
  userId: z.string().uuid(),
  campaignId: z.string().uuid(),
  amount: z.number().positive(),
});

export const withdrawFunds = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof WithdrawSchema>) => WithdrawSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: campaign, error: cErr } = await supabaseAdmin
      .from("campaigns")
      .select("user_id,amount_raised")
      .eq("id", data.campaignId)
      .single();
    if (cErr) throw new Error(cErr.message);
    if (campaign.user_id !== data.userId) throw new Error("Not your campaign");
    if (Number(campaign.amount_raised) < data.amount) throw new Error("Insufficient funds");

    const txHash =
      "0x" +
      Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const { data: tx, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: data.userId,
        campaign_id: data.campaignId,
        type: "withdrawal",
        amount: data.amount,
        status: "confirmed",
        tx_hash: txHash,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("campaigns")
      .update({ amount_raised: Number(campaign.amount_raised) - data.amount })
      .eq("id", data.campaignId);

    return tx;
  });