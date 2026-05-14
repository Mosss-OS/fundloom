import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Expected payload shape posted by the on-chain indexer (Alchemy/QuickNode/custom listener)
// after a `Donated` event is included AND has reached the required confirmation depth.
const PayloadSchema = z.object({
  campaignId: z.string().uuid(),
  donorWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amount: z.number().positive().max(10_000_000),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  blockNumber: z.number().int().nonnegative(),
  chainId: z.number().int().positive(),
});

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  // Strip optional "sha256=" prefix used by some providers
  const provided = signature.startsWith("sha256=") ? signature.slice(7) : signature;
  const a = Buffer.from(provided, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/donation-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.DONATION_WEBHOOK_SECRET;
        if (!secret) {
          console.error("[donation-webhook] DONATION_WEBHOOK_SECRET not configured");
          return new Response("Server misconfigured", { status: 500 });
        }

        const rawBody = await request.text();
        const signature =
          request.headers.get("x-webhook-signature") ??
          request.headers.get("x-signature") ??
          request.headers.get("x-alchemy-signature");

        if (!verifySignature(rawBody, signature, secret)) {
          console.warn("[donation-webhook] invalid signature");
          return new Response("Invalid signature", { status: 401 });
        }

        let parsed: z.infer<typeof PayloadSchema>;
        try {
          parsed = PayloadSchema.parse(JSON.parse(rawBody));
        } catch (err) {
          console.warn("[donation-webhook] invalid payload", err);
          return new Response("Invalid payload", { status: 400 });
        }

        const { data, error } = await supabaseAdmin.rpc("confirm_crypto_donation", {
          _campaign_id: parsed.campaignId,
          _donor_wallet: parsed.donorWallet,
          _amount: parsed.amount,
          _tx_hash: parsed.txHash,
          _block_number: parsed.blockNumber,
          _chain_id: parsed.chainId,
        });

        if (error) {
          console.error("[donation-webhook] confirm_crypto_donation failed", error);
          return new Response("Failed to record donation", { status: 500 });
        }

        return Response.json({ ok: true, donationId: (data as { id?: string } | null)?.id ?? null });
      },
    },
  },
});