import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig ?? "",
      Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const campaignId = session.metadata?.campaignId;
    const userId = session.metadata?.userId;
    const amount = session.amount_total ? session.amount_total / 100 : 0;

    if (campaignId && userId && amount > 0) {
      // Get the connected account info if this was a connected payment
      const customerEmail = session.customer_details?.email;
      
      // Record the donation in Supabase
      const { error: donationError } = await supabase.from("donations").insert({
        campaign_id: campaignId,
        donor_user_id: userId,
        donor_wallet: session.customer_details?.email || "stripe-customer",
        amount: amount,
        payment_method: "fiat",
        tx_hash: session.payment_intent as string,
        stripe_session_id: session.id,
      });

      if (donationError) {
        console.error("Failed to record donation:", donationError);
      } else {
        // Update campaign amount_raised
        await supabase.rpc("increment_campaign_raised", {
          _campaign_id: campaignId,
          _amount: amount,
        });
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});