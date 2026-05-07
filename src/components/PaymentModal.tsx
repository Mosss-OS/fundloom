import { useState } from "react";
import { fundCampaign } from "@/api/donations";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { useEthersSigner } from "@/lib/ethers";
import { getContractInstance } from "@/integrations/contract";
import { formatUSD, shortAddr } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";

async function createFlutterwaveCheckout(params: {
  campaignId: string;
  campaignTitle: string;
  amount: number;
  userId: string;
  email?: string;
}) {
  const { data, error } = await supabase.functions.invoke("flutterwave-checkout", {
    body: params,
  });
  if (error) throw new Error(error.message);
  return data as { txRef: string; link: string };
}

type Props = {
  open: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
  onFunded: () => void;
};

export function PaymentModal({ open, onClose, campaignId, campaignTitle, onFunded }: Props) {
  const { user, loginEmail } = useFundloomAuth();
  const [method, setMethod] = useState<"crypto" | "fiat">("crypto");
  const [amount, setAmount] = useState("25");
  const [phase, setPhase] = useState<"select" | "confirming" | "success">("select");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPhase("select");
    setError(null);
    setAmount("25");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const { getSigner } = useEthersSigner();

  const submit = async () => {
    setError(null);
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!user) {
      setError("Sign in first to contribute.");
      return;
    }
    setPhase("confirming");
    try {
      if (method === "crypto") {
        // Use smart contract for USDC contribution
        const signer = await getSigner();
        if (!signer) throw new Error("Wallet not available");

        const contract = getContractInstance(signer);
        const txHash = await contract.contribute(Number(campaignId), value);

        // Record the on-chain contribution in Supabase
        await fundCampaign({
          data: {
            campaignId,
            donorWallet: user.wallet_address ?? "0x0",
            donorUserId: user.id,
            amount: value,
            paymentMethod: "crypto",
            txHash,
          },
        });
      } else {
        // Fiat payment via Flutterwave
        const { link } = await createFlutterwaveCheckout({
          campaignId,
          campaignTitle,
          amount: value,
          userId: user.id,
          email: user.email ?? undefined,
        });
        
        // Redirect to Flutterwave payment page
        window.location.href = link;
        return;
      }
      // Subtle delay for the success animation to feel earned
      await new Promise((r) => setTimeout(r, 600));
      setPhase("success");
      onFunded();
    } catch (e) {
      setPhase("select");
      setError(e instanceof Error ? e.message : "Could not process payment.");
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center"
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-t-3xl bg-canvas p-7 shadow-[var(--shadow-lift)] sm:rounded-3xl"
          >
            {phase !== "success" ? (
              <>
                <div className="mb-1 text-xs uppercase tracking-[0.18em] text-ink-soft">
                  Contribute to
                </div>
                <h2 className="font-display text-2xl text-ink">{campaignTitle}</h2>

                <div className="mt-6">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">Method</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["crypto", "fiat"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={`rounded-2xl px-4 py-3 text-sm transition hairline ${
                          method === m ? "bg-ink text-canvas" : "bg-paper text-ink hover:bg-ink/5"
                        }`}
                      >
                        {m === "crypto" ? "USDC · Base" : "Card / Mobile"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Amount (USD)
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {[25, 50, 100, 250].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAmount(String(v))}
                        className={`rounded-full px-3 py-1.5 text-xs transition hairline ${
                          Number(amount) === v
                            ? "bg-ink text-canvas"
                            : "bg-paper text-ink-soft hover:text-ink"
                        }`}
                      >
                        {formatUSD(v)}
                      </button>
                    ))}
                  </div>
                  <div className="relative mt-3">
                    <span className="absolute inset-y-0 left-5 flex items-center text-ink-soft">
                      $
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block w-full rounded-2xl border border-line bg-paper px-5 py-4 pl-9 text-lg text-ink outline-none focus:border-ink"
                    />
                  </div>
                </div>

                {method === "fiat" && (
                  <p className="mt-4 rounded-2xl bg-paper p-3 text-xs leading-relaxed text-ink-soft hairline">
                    Pay securely with card, USSD, or mobile money via Flutterwave. You'll be redirected to complete payment.
                  </p>
                )}

                {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

                <div className="mt-7 flex flex-col gap-2">
                  {user ? (
                    <button
                      type="button"
                      disabled={phase === "confirming"}
                      onClick={submit}
                      className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-4 text-sm font-medium text-canvas transition hover:bg-ink/90 disabled:opacity-60"
                    >
                      {phase === "confirming"
                        ? "Confirming…"
                        : `Contribute ${formatUSD(Number(amount) || 0)}`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => loginEmail("")}
                      className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-4 text-sm font-medium text-canvas hover:bg-ink/90"
                    >
                      Sign in to contribute
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-xs text-ink-soft transition hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <SuccessView
                amount={Number(amount)}
                onClose={handleClose}
                wallet={user?.wallet_address}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function SuccessView({
  amount,
  onClose,
  wallet,
}: {
  amount: number;
  onClose: () => void;
  wallet?: string | null;
}) {
  return (
    <div className="py-2 text-center">
      <div
        className="mx-auto flex size-16 items-center justify-center rounded-full bg-forest/15 text-forest"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="mt-5 font-display text-2xl text-ink">Thank you.</h3>
      <p className="mt-1 text-sm text-ink-soft">
        {formatUSD(amount)} contributed from {shortAddr(wallet)}
      </p>
      <button
        onClick={onClose}
        className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-sm text-canvas hover:bg-ink/90"
      >
        Done
      </button>
    </div>
  );
}
