import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { fetchCampaign } from "@/server/campaigns.functions";
import { withdrawFunds } from "@/server/donations.functions";
import { PaymentModal } from "@/components/PaymentModal";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { formatUSD, shortAddr, daysLeft, progress } from "@/lib/format";

import sample1 from "@/assets/sample-campaign-1.jpg";
import sample2 from "@/assets/sample-campaign-2.jpg";
import sample3 from "@/assets/sample-campaign-3.jpg";

const fallbacks = [sample1, sample2, sample3];

export const Route = createFileRoute("/c/$id")({
  loader: async ({ params }) => {
    const result = await fetchCampaign({ data: { id: params.id } });
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    const c = loaderData?.campaign;
    return {
      meta: [
        { title: c ? `${c.title} — Fundloom` : "Campaign — Fundloom" },
        { name: "description", content: c?.description?.slice(0, 160) ?? "" },
        { property: "og:title", content: c?.title ?? "Fundloom" },
        { property: "og:description", content: c?.description?.slice(0, 160) ?? "" },
        ...(c?.cover_image_url ? [{ property: "og:image", content: c.cover_image_url }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="font-display text-4xl text-ink">Campaign not found</h1>
    </main>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-ink">Something went wrong</h1>
        <p className="mt-3 text-sm text-ink-soft">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm text-canvas"
        >
          Try again
        </button>
      </main>
    );
  },
  component: CampaignDetail,
});

function CampaignDetail() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const { user } = useFundloomAuth();
  const [open, setOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const c = data.campaign as any;
  const cover = c.cover_image_url || fallbacks[0];
  const pct = progress(c.amount_raised, c.goal_amount);
  const isOwner = user?.id === c.user_id;

  const handleWithdraw = async () => {
    if (!user) return;
    setWithdrawing(true);
    try {
      await withdrawFunds({
        data: { userId: user.id, campaignId: c.id, amount: Number(c.amount_raised) },
      });
      router.invalidate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-3xl hairline"
      >
        <img src={cover} alt={c.title} className="aspect-[5/2] w-full object-cover" />
      </motion.div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: story */}
        <div>
          <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">
            {c.payout_preference === "crypto" ? "USDC payout · Base" : "Fiat payout"}
          </span>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {c.title}
          </h1>
          <p className="mt-6 whitespace-pre-line text-pretty leading-relaxed text-ink-soft">
            {c.description}
          </p>

          {/* Contributors */}
          <section className="mt-14">
            <h2 className="font-display text-2xl text-ink">Contributors</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Every transaction is on the public ledger.
            </p>
            <div className="mt-6 space-y-2">
              {data.donations.length === 0 && (
                <div className="rounded-2xl bg-paper p-6 text-sm text-ink-soft hairline">
                  No contributions yet — be the first.
                </div>
              )}
              {(data.donations as any[]).map((d: any, i: number) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.03 }}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-paper px-5 py-4 hairline"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest-soft text-xs font-medium text-forest">
                      {d.donor_wallet.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-mono text-sm text-ink">
                        {shortAddr(d.donor_wallet)}
                      </div>
                      <div className="text-xs text-ink-soft">
                        {d.payment_method === "crypto" ? "USDC" : "Fiat"} ·{" "}
                        {new Date(d.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg text-ink">
                      {formatUSD(d.amount)}
                    </div>
                    {d.tx_hash && (
                      <div className="font-mono text-[10px] text-ink-soft">
                        {d.tx_hash.slice(0, 10)}…
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: funding panel */}
        <aside>
          <div className="sticky top-24 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-3xl bg-paper p-7 hairline"
            >
              <div className="font-display text-4xl text-ink">{formatUSD(c.amount_raised)}</div>
              <div className="mt-1 text-sm text-ink-soft">
                raised of {formatUSD(c.goal_amount)} goal
              </div>

              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-forest"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">Backers</div>
                  <div className="mt-1 font-display text-xl text-ink">{data.donations.length}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">Time left</div>
                  <div className="mt-1 font-display text-xl text-ink">{daysLeft(c.deadline)}</div>
                </div>
              </div>

              {isOwner ? (
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing || Number(c.amount_raised) <= 0}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-canvas transition hover:bg-forest/90 disabled:opacity-50"
                >
                  {withdrawing
                    ? "Withdrawing…"
                    : `Withdraw ${formatUSD(c.amount_raised)} to wallet`}
                </button>
              ) : (
                <button
                  onClick={() => setOpen(true)}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition hover:bg-ink/90"
                >
                  Contribute
                </button>
              )}
            </motion.div>

            <div className="rounded-3xl bg-paper p-6 text-sm hairline">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">Created by</div>
              <div className="mt-2 font-mono text-sm text-ink">
                {shortAddr(c.users?.wallet_address)}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <PaymentModal
        open={open}
        onClose={() => setOpen(false)}
        campaignId={c.id}
        campaignTitle={c.title}
        onFunded={() => router.invalidate()}
      />
    </main>
  );
}