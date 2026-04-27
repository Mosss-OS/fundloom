import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fetchCampaigns } from "@/server/campaigns.functions";
import { CampaignCard, type CampaignCardData } from "@/components/CampaignCard";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore campaigns — Fundloom" },
      { name: "description", content: "Discover crowdfunding campaigns on Fundloom." },
    ],
  }),
  loader: () => fetchCampaigns({ data: { limit: 60 } }),
  component: Explore,
});

function Explore() {
  const campaigns = Route.useLoaderData() as unknown as CampaignCardData[];
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "most_funded" | "ending_soon">("newest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q
      ? campaigns.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q),
        )
      : [...campaigns];
    if (sort === "most_funded") {
      list.sort((a, b) => Number(b.amount_raised) - Number(a.amount_raised));
    } else if (sort === "ending_soon") {
      list.sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      );
    }
    return list;
  }, [campaigns, query, sort]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12 max-w-2xl"
      >
        <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Open campaigns</span>
        <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
          Worth backing.
        </h1>
        <p className="mt-3 text-ink-soft">
          Each campaign is on-chain. Each contribution leaves a public mark.
        </p>
      </motion.header>

      {campaigns.length > 0 && (
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campaigns…"
              className="w-full rounded-full bg-paper py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink-soft hairline focus:outline-none focus:ring-2 focus:ring-forest/40"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="sort" className="text-ink-soft">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="rounded-full bg-paper px-4 py-2 text-sm text-ink hairline focus:outline-none focus:ring-2 focus:ring-forest/40"
            >
              <option value="newest">Newest</option>
              <option value="most_funded">Most funded</option>
              <option value="ending_soon">Ending soon</option>
            </select>
            <span className="ml-2 hidden text-xs text-ink-soft sm:inline">
              {filtered.length} of {campaigns.length}
            </span>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-paper p-12 text-center hairline">
          <h3 className="font-display text-2xl text-ink">No matches</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl bg-paper p-12 text-center hairline">
      <h3 className="font-display text-2xl text-ink">No campaigns yet</h3>
      <p className="mt-2 text-sm text-ink-soft">Be the first to launch one.</p>
    </div>
  );
}