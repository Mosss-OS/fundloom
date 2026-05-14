import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature, x-signature, x-alchemy-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("DONATION_WEBHOOK_SECRET") ?? "";

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifySignature(rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature || !webhookSecret) return false;
  const provided = signature.startsWith("sha256=") ? signature.slice(7) : signature;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
  try {
    return timingSafeEqual(sig, hexToBytes(provided));
  } catch {
    return false;
  }
}

interface DonationPayload {
  campaignId: string;
  donorWallet: string;
  amount: number;
  txHash: string;
  blockNumber: number;
  chainId: number;
}

function isValid(p: unknown): p is DonationPayload {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  return (
    typeof o.campaignId === "string" && /^[0-9a-f-]{36}$/i.test(o.campaignId) &&
    typeof o.donorWallet === "string" && /^0x[a-fA-F0-9]{40}$/.test(o.donorWallet) &&
    typeof o.amount === "number" && o.amount > 0 && o.amount <= 10_000_000 &&
    typeof o.txHash === "string" && /^0x[a-fA-F0-9]{64}$/.test(o.txHash) &&
    typeof o.blockNumber === "number" && Number.isInteger(o.blockNumber) && o.blockNumber >= 0 &&
    typeof o.chainId === "number" && Number.isInteger(o.chainId) && o.chainId > 0
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  if (!webhookSecret) {
    console.error("[donation-webhook] DONATION_WEBHOOK_SECRET not configured");
    return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
  }

  const rawBody = await req.text();
  const signature =
    req.headers.get("x-webhook-signature") ??
    req.headers.get("x-signature") ??
    req.headers.get("x-alchemy-signature");

  if (!(await verifySignature(rawBody, signature))) {
    console.warn("[donation-webhook] invalid signature");
    return new Response("Invalid signature", { status: 401, headers: corsHeaders });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  if (!isValid(payload)) {
    return new Response("Invalid payload", { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase.rpc("confirm_crypto_donation", {
    _campaign_id: payload.campaignId,
    _donor_wallet: payload.donorWallet,
    _amount: payload.amount,
    _tx_hash: payload.txHash,
    _block_number: payload.blockNumber,
    _chain_id: payload.chainId,
  });

  if (error) {
    console.error("[donation-webhook] confirm_crypto_donation failed", error);
    return new Response("Failed to record donation", { status: 500, headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({ ok: true, donation: data ?? null }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});