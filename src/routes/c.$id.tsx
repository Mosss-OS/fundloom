import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ExternalLink, MessageCircle, Megaphone, Trash2 } from "lucide-react";
import { fetchCampaign } from "@/api/campaigns";
import { withdrawFunds } from "@/api/donations";
import {
  postCampaignUpdate,
  deleteCampaignUpdate,
  postCampaignComment,
  deleteCampaignComment,
  requestRefund,
} from "@/api/engagement";
import { PaymentModal } from "@/components/PaymentModal";
import { ShareRow } from "@/components/ShareRow";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { MilestoneManager } from "@/components/MilestoneManager";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { useEthersSigner } from "@/lib/ethers";
import { getContractInstance } from "@/integrations/contract";
import { DisputeType } from "@/integrations/contract";
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
import { supabase } from "@/integrations/supabase/client";

import sample1 from "@/assets/sample-campaign-1.jpg";
import sample2 from "@/assets/sample-campaign-2.jpg";
import sample3 from "@/assets/sample-campaign-3.jpg";

const fallbacks = [sample1, sample2, sample3];

type Tab = "story" | "milestones" | "updates" | "comments" | "backers" | "disputes";

type CampaignWithChain = Tables<"campaigns"> & {
  users?: { wallet_address?: string | null };
  on_chain_campaign_id?: number | null;
  milestones_count?: number | null;
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useFundloomAuth();
  const { getSigner } = useEthersSigner();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [open, setOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [tab, setTab] = useState<Tab>("story");
  const [viewer, setViewer] = useState<any>(null);
  const [disputes, setDisputes] = useState<Array<{
    id: number;
    campaignId: number;
    milestoneId: number;
    disputeType: number;
    proposer: string;
    startTime: number;
    endTime: number;
    yesVotes: bigint;
    noVotes: bigint;
    executed: boolean;
    cancelled: boolean;
  }> | null>(null);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"success" | "cancelled" | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const result = await fetchCampaign({ id });
        if (!result) {
          setError(new Error("Campaign not found"));
          return;
        }
        setData(result);
        setViewer(result.viewer);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load campaign"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("payment") === "success") {
      setPaymentResult("success");
      navigate(`/c/${id}`, { replace: true });
    } else if (params.get("payment") === "cancelled") {
      setPaymentResult("cancelled");
      navigate(`/c/${id}`, { replace: true });
    }
  }, [location.search, id, navigate]);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setViewer(data?.viewer);
      return;
    }
    data?.campaign?.id ? fetchCampaign({ id: data.campaign.id, viewerUserId: user.id }) : Promise.resolve(null)
      .then((r) => {
        if (!cancelled && r) setViewer(r.viewer);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, data?.campaign?.id]);

  // Real-time updates with Supabase Realtime
  useEffect(() => {
    if (!data?.campaign?.id) return;
    
    fetchDisputes();

    // Set up Supabase Realtime subscriptions for campaign-related changes
    const channel = supabase
      .channel(`campaign-${data.campaign.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_updates",
          filter: `campaign_id=eq.${data.campaign.id}`,
        },
        () => {
          // Refetch campaign data on updates
          fetchCampaign({ id: data.campaign.id })
            .then((r) => {
              if (r) setData(r);
            })
            .catch(() => {});
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_comments",
          filter: `campaign_id=eq.${data.campaign.id}`,
        },
        () => {
          fetchCampaign({ id: data.campaign.id })
            .then((r) => {
              if (r) setData(r);
            })
            .catch(() => {});
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "donations",
          filter: `campaign_id=eq.${data.campaign.id}`,
        },
        () => {
          fetchCampaign({ id: data.campaign.id })
            .then((r) => {
              if (r) setData(r);
            })
            .catch(() => {});
        }
      )
      .subscribe();

    // Keep polling for on-chain disputes
    const disputeInterval = setInterval(fetchDisputes, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(disputeInterval);
    };
  }, [data?.campaign?.id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <div className="h-8 w-40 animate-pulse rounded-full bg-paper" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-ink">Campaign not found</h1>
        <p className="mt-3 text-sm text-ink-soft">{error?.message}</p>
      </main>
    );
  }

  const c = data.campaign as unknown as CampaignWithChain;
  const cover = c?.cover_image_url || fallbacks[0];
  const milestonesCount = c?.milestones_count ?? 0;
  const onChainCampaignId = c?.on_chain_campaign_id ?? null;
  const pct = progress(c?.amount_raised ?? 0, c?.goal_amount ?? 1);
  const isOwner = user?.id === c.user_id;
  const isFailed = c.status === "failed";
  const isFunded = Number(c.amount_raised) >= Number(c.goal_amount);

  const shareUrl = typeof window !== "undefined" ? window.location.href : `/c/${c.id}`;

  const handleWithdraw = async () => {
    if (!user) return;
    setWithdrawing(true);
    try {
      if (onChainCampaignId !== undefined && onChainCampaignId !== null) {
        // Use smart contract withdrawal (legacy - for campaigns without milestones)
        const signer = await getSigner();
        if (!signer) throw new Error("Wallet not available");

        const contract = getContractInstance(signer);
        const txHash = await contract.withdraw(onChainCampaignId);

        // Record the withdrawal in Supabase
        await withdrawFunds({
          userId: user.id,
          campaignId: c.id,
          amount: Number(c.amount_raised),
        });
      } else {
        // Fallback to server function if no on-chain campaign
        await withdrawFunds({
          userId: user.id,
          campaignId: c.id,
          amount: Number(c.amount_raised),
        });
      }

      // Refetch campaign data
      const updated = await fetchCampaign({ id: c.id });
      if (updated) setData(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  // Handle milestone-based withdrawal

  // Handle dispute creation
  const handleCreateDispute = async (milestoneId: number, disputeType: number) => {
    if (!user) return;
    setDisputeLoading(true);
    try {
      if (onChainCampaignId === undefined || onChainCampaignId === null) {
        throw new Error("No on-chain campaign found");
      }

      const signer = await getSigner();
      if (!signer) throw new Error("Wallet not available");

      const contract = getContractInstance(signer);
      const disputeId = await contract.createDispute(onChainCampaignId, milestoneId, disputeType);
      
      alert(`Dispute created! Dispute ID: ${disputeId}`);
      // Refresh disputes
      fetchDisputes();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create dispute");
    } finally {
      setDisputeLoading(false);
    }
  };

  // Handle voting on dispute
  const handleVoteOnDispute = async (disputeId: number, support: boolean) => {
    if (!user) return;
    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Wallet not available");

      const contract = getContractInstance(signer);
      const txHash = await contract.voteOnDispute(disputeId, support);
      
      alert(`Vote cast! Tx: ${txHash.slice(0, 10)}...`);
      fetchDisputes();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to vote");
    }
  };

  // Handle dispute execution
  const handleExecuteDispute = async (disputeId: number) => {
    if (!user) return;
    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Wallet not available");

      const contract = getContractInstance(signer);
      const txHash = await contract.executeDispute(disputeId);
      
      alert(`Dispute executed! Tx: ${txHash.slice(0, 10)}...`);
      fetchDisputes();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to execute dispute");
    }
  };

  // Fetch disputes for this campaign
  const fetchDisputes = async () => {
    if (!onChainCampaignId) return;
    
    try {
      const signer = await getSigner();
      if (!signer) return;
      
      const contract = getContractInstance(signer);
      const disputeIds = await contract.getDisputesForCampaign(onChainCampaignId);
      
      // Fetch details for each dispute
      const disputeDetails = await Promise.all(
        disputeIds.map(async (id: number) => {
          return await contract.getDispute(id);
        })
      );
      
      setDisputes(disputeDetails.map((d, index) => ({ ...d, id: Number(disputeIds[index]) })));
    } catch (e) {
      console.error("Failed to fetch disputes:", e);
    }
  };

  const handleReleaseMilestone = async (milestoneId: number) => {
    if (!user) return;
    try {
      if (onChainCampaignId === undefined || onChainCampaignId === null) {
        throw new Error("No on-chain campaign found");
      }

      const signer = await getSigner();
      if (!signer) throw new Error("Wallet not available");

      const contract = getContractInstance(signer);
      const txHash = await contract.releaseMilestone(onChainCampaignId, milestoneId);

      alert(`Milestone ${milestoneId} released! Tx: ${txHash.slice(0, 10)}...`);
      // Refetch campaign data
      const updated = await fetchCampaign({ id: c.id });
      if (updated) setData(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to release milestone");
    }
  };

  const handleRefund = async () => {
    if (!user) return;
    setRefunding(true);
    try {
      await requestRefund({ campaignId: c.id, donorUserId: user.id });
      // Refetch campaign data
      const updated = await fetchCampaign({ id: c.id });
      if (updated) setData(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Refund failed");
    } finally {
      setRefunding(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      {/* Hero */}
      <div
        className="overflow-hidden rounded-3xl hairline"
      >
        <img src={cover} alt={c.title} className="aspect-[5/2] w-full object-cover" />
      </div>

      {paymentResult === "success" && (
        <div
          className="mt-6 rounded-2xl bg-forest/10 px-5 py-4 text-sm text-forest"
        >
          Payment successful! Your donation has been recorded.
        </div>
      )}
      {paymentResult === "cancelled" && (
        <div
          className="mt-6 rounded-2xl bg-paper px-5 py-4 text-sm text-ink-soft hairline"
        >
          Payment was cancelled. You can try again if you'd like to contribute.
        </div>
      )}

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
                ["milestones", `Milestones${milestonesCount ? ` · ${milestonesCount}` : ""}`],
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
                  <div
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
                campaignId={Number(onChainCampaignId) || 0}
                isOwner={isOwner}
                milestonesCount={milestonesCount || 0}
                onChanged={async () => {
                  const updated = await fetchCampaign({ id: c.id });
                  if (updated) setData(updated);
                }}
              />
            )}

            {tab === "updates" && (
              <UpdatesSection
                campaignId={c.id}
                isOwner={isOwner}
                updates={data.updates}
                userId={user?.id ?? null}
                onChanged={async () => {
                  const updated = await fetchCampaign({ id: c.id });
                  if (updated) setData(updated);
                }}
              />
            )}

            {tab === "comments" && (
              <CommentsSection
                campaignId={c.id}
                ownerId={c.user_id}
                comments={data.comments}
                userId={user?.id ?? null}
                onChanged={async () => {
                  const updated = await fetchCampaign({ id: c.id });
                  if (updated) setData(updated);
                }}
              />
            )}

            {tab === "backers" && <BackersSection donations={data.donations} />}

            {tab === "disputes" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-paper p-6 text-sm hairline">
                  <h3 className="font-display text-lg text-ink">Dispute Resolution</h3>
                  <p className="mt-2 text-ink-soft">
                    This campaign has {disputes ? disputes.length : 0} active dispute(s).
                  </p>
                  {isOwner && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleCreateDispute(0, DisputeType.WITHDRAWAL)}
                        disabled={disputeLoading}
                        className="rounded-full bg-forest px-4 py-2 text-sm text-canvas disabled:opacity-50"
                      >
                        {disputeLoading ? "Creating..." : "Create Withdrawal Dispute"}
                      </button>
                    </div>
                  )}
                </div>

                {disputes && disputes.length > 0 ? (
                  <div className="space-y-3">
                    {disputes.map((d, i) => (
                      <div
                        key={d.id}
                        className="rounded-2xl bg-paper p-5 hairline"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-ink">
                              Dispute #{d.id} - {d.disputeType === DisputeType.WITHDRAWAL ? "Withdrawal" : "Milestone Release"}
                            </div>
                            <div className="mt-1 text-xs text-ink-soft">
                              Created by {shortAddr(d.proposer)} · {formatTimeAgo(new Date(d.startTime * 1000).toISOString())}
                            </div>
                          </div>
                          {!d.executed && !d.cancelled && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleVoteOnDispute(d.id, true)}
                                className="rounded-full bg-forest/10 px-3 py-1 text-xs text-forest"
                              >
                                Vote Yes
                              </button>
                              <button
                                onClick={() => handleVoteOnDispute(d.id, false)}
                                className="rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive"
                              >
                                Vote No
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 text-sm text-ink-soft">
                          <div className="flex gap-4">
                            <span>Yes: {d.yesVotes.toString()}</span>
                            <span>No: {d.noVotes.toString()}</span>
                          </div>
                          {d.executed && (
                            <div className="mt-2 text-xs text-forest">Executed</div>
                          )}
                          {d.cancelled && (
                            <div className="mt-2 text-xs text-destructive">Cancelled</div>
                          )}
                        </div>
                        {isOwner && !d.executed && !d.cancelled && d.endTime * 1000 < Date.now() && (
                          <button
                            onClick={() => handleExecuteDispute(d.id)}
                            className="mt-3 rounded-full bg-ink px-4 py-2 text-xs text-canvas"
                          >
                            Execute Dispute
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-paper p-6 text-sm text-ink-soft hairline">
                    No disputes yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: funding panel */}
        <aside>
          <div className="sticky top-24 space-y-4">
            <div
              className="rounded-3xl bg-paper p-7 hairline"
            >
              <div className="font-display text-4xl text-ink">{formatUSD(c.amount_raised)}</div>
              <div className="mt-1 text-sm text-ink-soft">
                raised of {formatUSD(c.goal_amount)} goal
              </div>

              <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div
                  style={{ width: `${pct}%` }}
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
                  {(!milestonesCount || milestonesCount === 0) && (
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
                  {((milestonesCount as number) ?? 0) > 0 && (
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
            </div>

            <CreatorCard campaign={c} />
          </div>
        </aside>
      </div>

      <PaymentModal
        open={open}
        onClose={() => setOpen(false)}
        campaignId={c.id}
        campaignTitle={c.title}
        onFunded={async () => {
          const updated = await fetchCampaign({ id: c.id });
          if (updated) setData(updated);
        }}
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
            <div
              key={d.id}
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
            </div>
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
      await postCampaignUpdate({ campaignId, authorId: userId, title, body });
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
      await deleteCampaignUpdate({ updateId: id, actorUserId: userId });
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
            <article
              key={u.id}
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
            </article>
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
      await postCampaignComment({ campaignId, authorId: userId, body });
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
      await deleteCampaignComment({ commentId: id, actorUserId: userId });
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
              <div
                key={cm.id}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
