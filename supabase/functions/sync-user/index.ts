import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PRIVY_APP_ID =
  Deno.env.get("PRIVY_APP_ID") ??
  Deno.env.get("VITE_PRIVY_APP_ID") ??
  "cmod721aq000h0cjpdld492es";

type SyncPayload = {
  privyId?: string;
  email?: string;
  walletAddress?: string | null;
  displayName?: string | null;
};

type JwtHeader = { kid?: string; alg?: string };
type JwtPayload = { sub?: string; aud?: string; iss?: string; exp?: number };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as T;
}

async function verifyPrivyToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed auth token");

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJson<JwtHeader>(encodedHeader);
  const payload = decodeJson<JwtPayload>(encodedPayload);

  if (header.alg !== "ES256" || !header.kid) throw new Error("Unsupported auth token");
  if (payload.iss !== "privy.io") throw new Error("Invalid token issuer");
  if (payload.aud !== PRIVY_APP_ID) throw new Error("Invalid token audience");
  if (!payload.sub) throw new Error("Missing token subject");
  if (!payload.exp || payload.exp * 1000 < Date.now()) throw new Error("Expired auth token");

  const jwksResponse = await fetch(`https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json`);
  if (!jwksResponse.ok) throw new Error("Could not load auth keys");

  const jwks = await jwksResponse.json() as { keys?: JsonWebKey[] };
  const jwk = jwks.keys?.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("Auth key not found");

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["verify"],
  );

  const verified = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    base64UrlToBytes(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  );

  if (!verified) throw new Error("Invalid auth token signature");
  return payload;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return json({ error: "Backend is not configured" }, 500);
    }

    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return json({ error: "Missing auth token" }, 401);

    const claims = await verifyPrivyToken(token);
    const body = await req.json() as SyncPayload;

    if (!body.privyId || body.privyId !== claims.sub) {
      return json({ error: "Token does not match the requested user" }, 403);
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return json({ error: "A valid email is required" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.rpc("sync_privy_user", {
      _privy_id: body.privyId,
      _email: body.email,
      _wallet_address: body.walletAddress ?? null,
      _display_name: body.displayName ?? null,
    });

    if (error) throw error;
    return json(data);
  } catch (error) {
    console.error("sync-user error:", error);
    return json({ error: error instanceof Error ? error.message : "Could not sync user" }, 500);
  }
});
