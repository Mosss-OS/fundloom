import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-loom.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt=""
            className="h-full w-full object-cover opacity-90"
            width={1536}
            height={1024}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-canvas/30 via-canvas/60 to-canvas" />
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-28 pt-20 sm:px-8 sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-paper/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink-soft hairline">
              <span className="size-1.5 rounded-full bg-forest" />
              Live on Base Sepolia
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-ink sm:text-7xl">
              Crowdfunding,<br />
              <em className="not-italic text-forest">woven together.</em>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
              Raise in USDC. Receive in fiat or crypto. Every contribution recorded on-chain —
              every detail finished by hand.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-canvas transition hover:bg-ink/90"
              >
                Start a campaign
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                to="/explore"
                className="rounded-full px-6 py-3 text-sm font-medium text-ink transition hover:bg-ink/5"
              >
                Explore campaigns
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="mx-auto max-w-6xl px-5 pb-28 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-3">
          {[
            {
              k: "01",
              t: "Email is enough",
              d: "Sign in with email — we generate your wallet quietly in the background.",
            },
            {
              k: "02",
              t: "On-chain by default",
              d: "Donations settle in USDC on Base. Every transaction is verifiable.",
            },
            {
              k: "03",
              t: "Withdraw your way",
              d: "Receive funds to your wallet, or off-ramp to fiat when you're ready.",
            },
          ].map((p, i) => (
            <motion.div
              key={p.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-canvas p-8 sm:p-10"
            >
              <div className="font-display text-sm text-ink-soft">{p.k}</div>
              <h3 className="mt-4 font-display text-2xl text-ink">{p.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
