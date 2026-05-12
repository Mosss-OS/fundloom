import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { fetchCampaigns } from "@/api/campaigns";
import { getUserStats, getRecentDonations } from "@/api/users";
import { CampaignCard, type CampaignCardData } from "@/components/CampaignCard";
import { formatUSD, shortAddr, formatTimeAgo } from "@/lib/format";

export default function Dashboard() {
  const { user, loading, privyAuthenticated } = useFundloomAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [stats, setStats] = useState<{
    totalRaised: number;
    activeCount: number;
    campaignCount: number;
  } | null>(null);
  const [donations, setDonations] = useState<Array<{
    id: string;
    amount: number | string;
    created_at: string;
    tx_hash: string | null;
    payment_method: string;
    campaign_id: string;
    campaigns: { id: string; title: string } | null;
  }>>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user && !privyAuthenticated) navigate("/login");
  }, [loading, user, privyAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setBusy(true);
      const [c, s, d] = await Promise.all([
        fetchCampaigns({ userId: user.id }),
        getUserStats({ userId: user.id }),
        getRecentDonations({ userId: user.id, limit: 8 }),
      ]);
      setCampaigns(c as unknown as CampaignCardData[]);
      setStats(s);
      setDonations(d as typeof donations);
      setBusy(false);
    })();
  }, [user]);

  if (loading || !user) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
        <div className="h-8 w-40 animate-pulse rounded-full bg-paper" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Welcome back</span>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          {user.email.split("@")[0]}.
        </h1>
      </header>

      {/* Balance + stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <BigStat label="Total raised" value={formatUSD(stats?.totalRaised ?? 0)} accent />
        <BigStat label="Active campaigns" value={String(stats?.activeCount ?? 0)} />
        <BigStat
          label="Wallet balance (USDC)"
          value="$0.00"
          hint={shortAddr(user.wallet_address)}
        />
      </div>

      {/* Quick actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/create"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition hover:bg-ink/90"
        >
          + New campaign
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center rounded-full bg-paper px-5 py-2.5 text-sm font-medium text-ink hairline transition hover:bg-ink/5"
        >
          Explore
        </Link>
      </div>

      {/* Your campaigns */}
      <section className="mt-16">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-ink">Your campaigns</h2>
          <span className="text-xs text-ink-soft">{campaigns.length} total</span>
        </div>

        {busy ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-3xl bg-paper" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-3xl bg-paper p-12 text-center hairline">
            <h3 className="font-display text-2xl text-ink">Nothing yet</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Launch your first campaign in under a minute.
            </p>
            <Link
              to="/create"
              className="mt-6 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm text-canvas hover:bg-ink/90"
            >
              Create campaign
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c, i) => (
              <CampaignCard key={c.id} campaign={c} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Recent donations */}
      <section className="mt-16">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl text-ink">Recent donations</h2>
          <span className="text-xs text-ink-soft">{donations.length} recent</span>
        </div>

        {busy ? (
          <div className="h-40 animate-pulse rounded-3xl bg-paper" />
        ) : donations.length === 0 ? (
          <div className="rounded-3xl bg-paper p-10 text-center hairline">
            <p className="text-sm text-ink-soft">You haven't made any donations yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-paper hairline">
            <ul className="divide-y divide-ink/10">
              {donations.map((d) => {
                const status = d.tx_hash ? "Confirmed" : "Pending";
                return (
                  <li
                    key={d.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      {d.campaigns ? (
                        <Link
                          to={`/c/${d.campaigns.id}`}
                          className="truncate font-medium text-ink hover:underline"
                        >
                          {d.campaigns.title}
                        </Link>
                      ) : (
                        <span className="text-ink-soft">Unknown campaign</span>
                      )}
                      <div className="mt-1 text-xs text-ink-soft">
                        {formatTimeAgo(d.created_at)} · {d.payment_method}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg text-ink">
                        {formatUSD(Number(d.amount))}
                      </div>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                          status === "Confirmed"
                            ? "bg-ink text-canvas"
                            : "bg-ink/10 text-ink-soft"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}

function BigStat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl p-7 hairline ${
        accent ? "ink-grad text-canvas" : "bg-paper text-ink"
      }`}
    >
      <div
        className={`text-xs uppercase tracking-[0.18em] ${accent ? "text-canvas/70" : "text-ink-soft"}`}
      >
        {label}
      </div>
      <div className="mt-3 font-display text-4xl tracking-tight">{value}</div>
      {hint && (
        <div className={`mt-2 text-xs ${accent ? "text-canvas/60" : "text-ink-soft"}`}>{hint}</div>
      )}
    </div>
  );
}
