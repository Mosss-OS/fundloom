import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const flutterwaveSecret = Deno.env.get("FLUTTERWAVE_SECRET_KEY") ?? "";
const flutterwaveBaseUrl = "https://api.flutterwave.com/v3";

interface FlutterwaveTransaction {
  status: string;
  message: string;
  data: {
    link: string;
    tx_ref: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { campaignId, campaignTitle, amount, userId, email } = await req.json();

    if (!campaignId || !amount || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const txRef = `FLW-${campaignId.slice(0, 8)}-${Date.now()}`;
    const baseUrl = req.headers.get("origin") || "https://fundloom.vercel.app";

    // Create Flutterwave payment link
    const response = await fetch(`${flutterwaveBaseUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${flutterwaveSecret}`,
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: amount.toString(),
        currency: "USD",
        country: "US",
        customer: {
          email: email || "donor@fundloom.app",
          name: `Donor for ${campaignTitle}`,
        },
        meta: {
          campaignId,
          userId,
          fundloom_type: "donation",
        },
        redirect_url: `${baseUrl}/c/${campaignId}?payment=success&tx_ref=${txRef}`,
        payment_options: "card,ussd,mobilemoney",
        customization: {
          title: `Donation to "${campaignTitle}"`,
          description: "Fundloom Campaign Donation",
        },
      }),
    });

    const data: FlutterwaveTransaction = await response.json();

    if (data.status !== "success") {
      throw new Error(data.message || "Flutterwave payment failed");
    }

    return new Response(
      JSON.stringify({ 
        txRef, 
        link: data.data.link 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Flutterwave checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});