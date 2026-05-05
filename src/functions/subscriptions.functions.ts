import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { formatUSD, daysLeft } from "@/lib/format";

const SubscriptionSchema = z.object({
  campaignId: z.string().uuid(),
  donorWallet: z.string().min(10).max(80),
  donorUserId: z.string().uuid().optional().nullable(),
  amount: z.number().positive().max(10000), // Max $10,000 per payment
  interval: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().nullable(),
  paymentMethod: z.enum(["crypto", "fiat"]),
});

export const createSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: z.infer<typeof SubscriptionSchema>) => SubscriptionSchema.parse(d))
  .handler(async ({ data }) => {
    // Calculate next charge date based on interval and start date
    const startDate = new Date(data.startDate);
    let nextChargeAt = new Date(startDate);

    switch (data.interval) {
      case "daily":
        nextChargeAt.setDate(nextChargeAt.getDate() + 1);
        break;
      case "weekly":
        nextChargeAt.setDate(nextChargeAt.getDate() + 7);
        break;
      case "monthly":
        nextChargeAt.setMonth(nextChargeAt.getMonth() + 1);
        break;
      case "yearly":
        nextChargeAt.setFullYear(nextChargeAt.getFullYear() + 1);
        break;
    }

    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        campaign_id: data.campaignId,
        donor_user_id: data.donorUserId ?? null,
        donor_wallet: data.donorWallet,
        amount: data.amount,
        interval: data.interval,
        start_date: data.startDate,
        end_date: data.endDate ?? null,
        status: "active",
        payment_method: data.paymentMethod,
        next_charge_at: nextChargeAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If crypto payment, we might want to record a transaction intent or prepare for charging
    // For now, we'll just create the subscription record
    // Actual charging would happen via a cron job or edge function that runs periodically

    // Record initial transaction if this is an immediate charge
    // For subscriptions, typically the first charge happens immediately or at start time
    if (data.donorUserId) {
      await supabaseAdmin.from("transactions").insert({
        user_id: data.donorUserId,
        campaign_id: data.campaignId,
        type: "subscription",
        amount: data.amount,
        status: "confirmed",
        // In a real implementation, we would have an actual tx hash from payment processing
        tx_hash: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });
    }

    return subscription;
  });

// Function to get active subscriptions for a campaign
export const getCampaignSubscriptions = createServerFn({ method: "GET" })
  .inputValidator((d: z.object({ campaignId: z.string().uuid() })) => 
    z.object({ campaignId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: subscriptions, error } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        id,
        amount,
        interval,
        start_date,
        end_date,
        status,
        payment_method,
        next_charge_at,
        users!subscriptions_donor_user_id_fkey (
          id,
          email,
          display_name,
          wallet_address
        )
      `)
      .eq("campaign_id", data.campaignId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return subscriptions;
  });

// Function to cancel a subscription
export const cancelSubscription = createServerFn({ method: "POST" })
  .inputValidator((d: z.object({ subscriptionId: z.string().uuid() })) => 
    z.object({ subscriptionId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("id", data.subscriptionId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return subscription;
  });