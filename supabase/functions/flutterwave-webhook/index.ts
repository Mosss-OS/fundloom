import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY") ?? "";
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface FlutterwaveWebhookEvent {
  event: string;
  "data.tx_ref": string;
  "data.amount": number;
  "data.status": string;
  "data.meta": {
    campaignId: string;
    userId: string;
    fundloom_type: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const signature = req.headers.get("verif-hash");
  
  // Verify webhook signature ( Flutterwave uses verif-hash header)
  if (signature !== flutterwaveSecret) {
    console.error("Invalid Flutterwave webhook signature");
    return new Response("Invalid signature", { status: 401 });
  }

  const event = await req.json() as FlutterwaveWebhookEvent;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  if (event.event === "charge.completed" && event.data.status === "successful") {
    const { campaignId, userId } = event.data.meta;
    const amount = event.data.amount;
    const txRef = event.data.tx_ref;

    if (campaignId && userId && amount > 0) {
      // Record the donation in Supabase
      const { error: donationError } = await supabase.from("donations").insert({
        campaign_id: campaignId,
        donor_user_id: userId,
        donor_wallet: txRef, // Use txRef as reference
        amount: amount,
        payment_method: "fiat",
        tx_hash: txRef,
        flutterwave_tx_ref: txRef,
      });

      if (donationError) {
        console.error("Failed to record donation:", donationError);
      } else {
        // Update campaign amount_raised
        await supabase.rpc("increment_campaign_raised", {
          _campaign_id: campaignId,
          _amount: amount,
        });
        
        console.log(`Flutterwave payment recorded: ${amount} for campaign ${campaignId}`);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});