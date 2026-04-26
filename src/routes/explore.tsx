import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { fetchCampaigns } from "@/server/campaigns.functions";
import { CampaignCard } from "@/components/CampaignCard";

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
  const campaigns = Route.useLoaderData();

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

      {campaigns.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c, i) => (
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