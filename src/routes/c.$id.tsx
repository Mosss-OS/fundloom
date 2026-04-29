import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ExternalLink, MessageCircle, Megaphone, Trash2 } from "lucide-react";
import { fetchCampaign } from "@/server/campaigns.functions";
import { withdrawFunds } from "@/server/donations.functions";
import {
  postCampaignUpdate,
  deleteCampaignUpdate,
  postCampaignComment,
  deleteCampaignComment,
  requestRefund,
} from "@/server/engagement.functions";
import { PaymentModal } from "@/components/PaymentModal";
import { ShareRow } from "@/components/ShareRow";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { MilestoneManager } from "@/components/MilestoneManager";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { useEthersSigner } from "@/lib/ethers";
import { getContractInstance } from "@/integrations/contract";
import { AiFraudDetection } from "@/components/AiFraudDetection";
import { SmartDonorMatching } from "@/components/SmartDonorMatching";
import {
  formatUSD,
  shortAddr,
  daysLeft,
  progress,
  baseScanTxUrl,
  baseScanAddressUrl,
  formatTimeAgo,
} from "@/lib/format";
import type { Tables } from "@/integrations/supabase/types";

import sample1 from "@/assets/sample-campaign-1.jpg";
import sample2 from "@/assets/sample-campaign-2.jpg";
import sample3 from "@/assets/sample-campaign-3.jpg";

const fallbacks = [sample1, sample2, sample3];

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
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
}

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
  errorComponent: ErrorComponent,
  component: CampaignDetail,
});

type Tab = "story" | "milestones" | "updates" | "comments" | "backers";

function CampaignDetail() {
  const data = Route.useLoaderData() as NonNullable<Awaited<ReturnType<typeof fetchCampaign>>>;
  const router = useRouter();
  const { user } = useFundloomAuth();
  const { getSigner } = useEthersSigner();
  const [open, setOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [tab, setTab] = useState<Tab>("story");
  const [viewer, setViewer] = useState(data.viewer);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setViewer(data.viewer);
      return;
    }
    fetchCampaign({ data: { id: data.campaign.id, viewerUserId: user.id } })
      .then((r) => {
        if (!cancelled && r) setViewer(r.viewer);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, data.campaign.id, data.viewer]);

  const c = data.campaign as unknown as Tables<"campaigns">;
  const cover = c.cover_image_url || fallbacks[0];
  const pct = progress(c.amount_raised, c.goal_amount);
  const isOwner = user?.id === c.user_id;
  const isFailed = c.status === "failed";
  const isFunded = Number(c.amount_raised) >= Number(c.goal_amount);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `/c/${c.id}`;

  const handleWithdraw = async () => {
    if (!user) return;
    setWithdrawing(true);
    try {
      // Get the on-chain campaign ID from the campaign data
      const onChainCampaignId = c.on_chain_campaign_id;

      if (onChainCampaignId !== undefined && onChainCampaignId !== null) {
        // Use smart contract withdrawal (legacy - for campaigns without milestones)
        const signer = await getSigner();
        if (!signer) throw new Error("Wallet not available");

        const contract = getContractInstance(signer);
        const txHash = await contract.withdraw(onChainCampaignId);

        // Record the withdrawal in Supabase
        await withdrawFunds({
          data: {
            userId: user.id,
            campaignId: c.id,
            amount: Number(c.amount_raised),
          },
        });
      } else {
        // Fallback to server function if no on-chain campaign
        await withdrawFunds({
          data: {
            userId: user.id,
            campaignId: c.id,
            amount: Number(c.amount_raised),
          },
        });
      }

      router.invalidate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  // Handle milestone-based withdrawal
  const handleReleaseMilestone = async (milestoneId: number) => {
    if (!user) return;
    try {
      const onChainCampaignId = c.on_chain_campaign_id;
      if (onChainCampaignId === undefined || onChainCampaignId === null) {
        throw new Error("No on-chain campaign found");
      }

      const signer = await getSigner();
      if (!signer) throw new Error("Wallet not available");

      const contract = getContractInstance(signer);
      const txHash = await contract.releaseMilestone(onChainCampaignId, milestoneId);

      alert(`Milestone ${milestoneId} released! Tx: ${txHash.slice(0, 10)}...`);
      router.invalidate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to release milestone");
    }
  };

  const handleRefund = async () => {
    if (!user) return;
    setRefunding(true);
    try {
      await requestRefund({
        data: { campaignId: c.id, donorUserId: user.id },
      });
      router.invalidate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Refund failed");
    } finally {
      setRefunding(false);
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
        {/* Left: story / tabs */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-soft">
            <span>{c.payout_preference === "crypto" ? "USDC payout · Base" : "Fiat payout"}</span>
            <span aria-hidden>·</span>
            <span className="capitalize">{c.category ?? "other"}</span>
            {c.is_verified && <VerifiedBadge className="ml-1" />}
            {isFailed && (
              <span className="ml-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-destructive">
                Goal not met
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {c.title}
          </h1>

          <div className="mt-6">
            <ShareRow url={shareUrl} title={c.title} />
          </div>

          {/* Tabs */}
          <div className="mt-10 flex gap-1 border-b border-line">
            {(
              [
                ["story", "Story"],
                ["milestones", `Milestones${c.milestones_count ? ` · ${c.milestones_count}` : ""}`],
                ["updates", `Updates${data.updates.length ? ` · ${data.updates.length}` : ""}`],
                ["comments", `Comments${data.comments.length ? ` · ${data.comments.length}` : ""}`],
                ["backers", `Backers · ${data.donations.length}`],
              ] as [Tab, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative px-4 py-3 text-sm transition ${
                  tab === key ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
                {tab === key && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute inset-x-3 -bottom-px h-px bg-ink"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {tab === "story" && (
              <div className="space-y-6">
                <p className="whitespace-pre-line text-pretty leading-relaxed text-ink-soft">
                  {c.description}
                </p>
                <AiFraudDetection
                  campaign={c}
                  creatorHistory={{
                    campaignsCreated: 1, // TODO: fetch from API
                    successfulCampaigns: 0,
                    totalRaised: 0,
                  }}
                />
                <SmartDonorMatching
                  campaignTitle={c.title}
                  campaignDescription={c.description}
                  campaignCategory={c.category || "other"}
                />
              </div>
            )}

            {tab === "milestones" && (
              <MilestoneManager
                campaignId={Number(c.on_chain_campaign_id) || 0}
                isOwner={isOwner}
                milestonesCount={c.milestones_count || 0}
                onChanged={() => router.invalidate()}
              />
            )}

            {tab === "updates" && (
              <UpdatesSection
                campaignId={c.id}
                isOwner={isOwner}
                updates={data.updates}
                userId={user?.id ?? null}
                onChanged={() => router.invalidate()}
              />
            )}

            {tab === "comments" && (
              <CommentsSection
                campaignId={c.id}
                ownerId={c.user_id}
                comments={data.comments}
                userId={user?.id ?? null}
                onChanged={() => router.invalidate()}
              />
            )}

            {tab === "backers" && <BackersSection donations={data.donations} />}
          </div>
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
                  className={`h-full rounded-full ${isFailed ? "bg-destructive" : "bg-forest"}`}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">Backers</div>
                  <div className="mt-1 font-display text-xl text-ink">{data.donations.length}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    {isFailed ? "Status" : "Time left"}
                  </div>
                  <div className="mt-1 font-display text-xl text-ink">
                    {isFailed ? "Failed" : daysLeft(c.deadline)}
                  </div>
                </div>
              </div>

              {isOwner ? (
                <>
                  {/* Legacy withdrawal - only show if no milestones */}
                  {(!c.milestones_count || c.milestones_count === 0) && (
                    <button
                      onClick={handleWithdraw}
                      disabled={withdrawing || Number(c.amount_raised) <= 0 || isFailed}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-forest px-6 py-3.5 text-sm font-medium text-canvas transition hover:bg-forest/90 disabled:opacity-50"
                    >
                      {withdrawing
                        ? "Withdrawing…"
                        : isFailed
                          ? "Refunding backers"
                          : `Withdraw ${formatUSD(c.amount_raised)}`}
                    </button>
                  )}

                  {/* Info message when milestones exist */}
                  {((c.milestones_count as number) ?? 0) > 0 && (
                    <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
                      <p className="font-medium">Milestone-based withdrawals active</p>
                      <p className="mt-1 text-xs">
                        Use the Milestones tab to approve and release funds for completed
                        milestones.
                      </p>
                    </div>
                  )}
                </>
              ) : viewer.refundEligible ? (
                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-destructive px-6 py-3.5 text-sm font-medium text-canvas transition hover:bg-destructive/90 disabled:opacity-50"
                >
                  {refunding
                    ? "Processing…"
                    : `Claim refund · ${formatUSD(viewer.donatedTotal - viewer.refundedAmount)}`}
                </button>
              ) : (
                <button
                  onClick={() => setOpen(true)}
                  disabled={isFailed || isFunded}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition hover:bg-ink/90 disabled:opacity-40"
                >
                  {isFailed ? "Campaign ended" : isFunded ? "Fully funded" : "Contribute"}
                </button>
              )}
            </motion.div>

            <CreatorCard campaign={c} />
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

/* ----------------------------- Sub-sections --------------------------- */

function CreatorCard({
  campaign,
}: {
  campaign: Tables<"campaigns"> & { users?: { wallet_address?: string | null } };
}) {
  const wallet = campaign.users?.wallet_address as string | undefined;
  const link = baseScanAddressUrl(wallet ?? null);
  return (
    <div className="rounded-3xl bg-paper p-6 text-sm hairline">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">Created by</div>
        {campaign.is_verified && <VerifiedBadge />}
      </div>
      <div className="mt-2 flex items-center gap-2 font-mono text-sm text-ink">
        {shortAddr(wallet)}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-soft transition hover:text-ink"
            aria-label="View on BaseScan"
          >
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}

function BackersSection({ donations }: { donations: Tables<"donations">[] }) {
  if (donations.length === 0) {
    return (
      <div className="rounded-2xl bg-paper p-6 text-sm text-ink-soft hairline">
        No contributions yet — be the first.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="text-sm text-ink-soft">Every transaction is on the public ledger.</p>
      <div className="mt-4 space-y-2">
        {donations.map((d, i) => {
          const tx = baseScanTxUrl(d.tx_hash);
          return (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.03 }}
              className="flex items-center justify-between gap-4 rounded-2xl bg-paper px-5 py-4 hairline"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest-soft text-xs font-medium text-forest">
                  {(d.donor_wallet || "0x").slice(2, 4).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-mono text-sm text-ink">
                    {shortAddr(d.donor_wallet)}
                  </div>
                  <div className="text-xs text-ink-soft">
                    {d.payment_method === "crypto" ? "USDC" : "Fiat"} ·{" "}
                    {formatTimeAgo(d.created_at)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg text-ink">{formatUSD(d.amount)}</div>
                {tx ? (
                  <a
                    href={tx}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-ink-soft transition hover:text-ink"
                  >
                    {String(d.tx_hash).slice(0, 10)}…
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  d.tx_hash && (
                    <div className="font-mono text-[10px] text-ink-soft">
                      {String(d.tx_hash).slice(0, 12)}…
                    </div>
                  )
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function UpdatesSection({
  campaignId,
  isOwner,
  updates,
  userId,
  onChanged,
}: {
  campaignId: string;
  isOwner: boolean;
  updates: Tables<"campaign_updates">[];
  userId: string | null;
  onChanged: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      await postCampaignUpdate({
        data: { campaignId, authorId: userId, title, body },
      });
      setTitle("");
      setBody("");
      setShowForm(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post update.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!userId) return;
    if (!confirm("Delete this update?")) return;
    try {
      await deleteCampaignUpdate({ data: { updateId: id, actorUserId: userId } });
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed.");
    }
  };

  return (
    <div className="space-y-4">
      {isOwner && (
        <div>
          {showForm ? (
            <div className="space-y-3 rounded-2xl bg-paper p-5 hairline">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Update title"
                maxLength={200}
                className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm outline-none focus:border-ink"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What's the latest?"
                rows={4}
                maxLength={5000}
                className="w-full resize-none rounded-xl border border-line bg-canvas px-4 py-3 text-sm outline-none focus:border-ink"
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-full px-4 py-2 text-xs text-ink-soft hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  disabled={busy || title.trim().length < 2 || body.trim().length < 2}
                  onClick={submit}
                  className="rounded-full bg-ink px-4 py-2 text-xs text-canvas disabled:opacity-50"
                >
                  {busy ? "Posting…" : "Post update"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs text-canvas hover:bg-ink/90"
            >
              <Megaphone className="size-3.5" />
              Post an update
            </button>
          )}
        </div>
      )}

      {updates.length === 0 ? (
        <div className="rounded-2xl bg-paper p-6 text-sm text-ink-soft hairline">
          No updates yet.
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map((u) => (
            <motion.article
              key={u.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-paper p-5 hairline"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg text-ink">{u.title}</h4>
                  <div className="mt-0.5 text-xs text-ink-soft">{formatTimeAgo(u.created_at)}</div>
                </div>
                {isOwner && userId === u.author_id && (
                  <button
                    onClick={() => remove(u.id)}
                    className="text-ink-soft transition hover:text-destructive"
                    aria-label="Delete update"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {u.body}
              </p>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsSection({
  campaignId,
  ownerId,
  comments,
  userId,
  onChanged,
}: {
  campaignId: string;
  ownerId: string;
  comments: (Tables<"campaign_comments"> & {
    users?: { display_name?: string | null; wallet_address?: string | null };
  })[];
  userId: string | null;
  onChanged: () => void;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      await postCampaignComment({
        data: { campaignId, authorId: userId, body },
      });
      setBody("");
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!userId) return;
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteCampaignComment({
        data: { commentId: id, actorUserId: userId },
      });
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed.");
    }
  };

  return (
    <div className="space-y-4">
      {userId ? (
        <div className="space-y-2 rounded-2xl bg-paper p-4 hairline">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Leave a comment…"
            rows={3}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-line bg-canvas px-4 py-3 text-sm outline-none focus:border-ink"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end">
            <button
              disabled={busy || body.trim().length === 0}
              onClick={submit}
              className="rounded-full bg-ink px-4 py-2 text-xs text-canvas disabled:opacity-50"
            >
              {busy ? "Posting…" : "Comment"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-paper p-4 text-sm text-ink-soft hairline">
          Sign in to leave a comment.
        </div>
      )}

      {comments.length === 0 ? (
        <div className="rounded-2xl bg-paper p-6 text-sm text-ink-soft hairline">
          <MessageCircle className="mb-2 inline size-4" /> No comments yet.
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((cm) => {
            const canDelete = userId && (userId === cm.author_id || userId === ownerId);
            const name =
              cm.users?.display_name || shortAddr(cm.users?.wallet_address) || "Anonymous";
            return (
              <motion.div
                key={cm.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-paper p-4 hairline"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs">
                      <span className="font-medium text-ink">{name}</span>{" "}
                      <span className="text-ink-soft">· {formatTimeAgo(cm.created_at)}</span>
                      {cm.author_id === ownerId && (
                        <span className="ml-2 rounded-full bg-forest/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-forest">
                          Creator
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-sm text-ink-soft">{cm.body}</p>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => remove(cm.id)}
                      className="text-ink-soft transition hover:text-destructive"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
