import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { fetchCampaigns } from "@/api/campaigns";
import { getUserStats } from "@/api/users";
import { CampaignCard, type CampaignCardData } from "@/components/CampaignCard";
import { formatUSD, shortAddr } from "@/lib/format";

export default function Dashboard() {
  const { user, loading } = useFundloomAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [stats, setStats] = useState<{
    totalRaised: number;
    activeCount: number;
    campaignCount: number;
  } | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setBusy(true);
      const [c, s] = await Promise.all([
        fetchCampaigns({ data: { userId: user.id } }),
        getUserStats({ data: { userId: user.id } }),
      ]);
      setCampaigns(c as unknown as CampaignCardData[]);
      setStats(s);
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
