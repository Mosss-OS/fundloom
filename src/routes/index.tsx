import { Link } from "react-router-dom";
import {
  Sparkles,
  Wallet,
  ShieldCheck,
  Globe2,
  ArrowUpRight,
  Quote,
  Plus,
  Minus,
  Zap,
  HeartHandshake,
  Layers,
} from "lucide-react";
import { useState, useEffect } from "react";
import heroImg from "@/assets/hero-loom.jpg";
import handsImg from "@/assets/hero-hands.jpg";
import sample1 from "@/assets/sample-campaign-1.jpg";
import sample2 from "@/assets/sample-campaign-2.jpg";
import sample3 from "@/assets/sample-campaign-3.jpg";
import { fetchActivePartners, type Partner } from "@/api/partners";
import { SmileMoon, Sunburst, Blob, Dot, Underline, Floater } from "@/components/DevfolioDecor";

export default function Index() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchActivePartners();
        setPartners(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load partners"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);
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

        {/* Devfolio-style floating decorations */}
        <Floater className="left-[6%] top-24 hidden sm:block" delay={0.1}>
          <SmileMoon className="h-12 w-20 rotate-[-8deg]" color="#F4C26B" />
        </Floater>
        <Floater className="right-[8%] top-32 hidden sm:block" delay={0.4}>
          <SmileMoon className="h-10 w-16 rotate-[14deg]" color="#F0E6C8" />
        </Floater>
        <Floater className="right-[16%] top-72 hidden md:block" delay={0.6}>
          <Sunburst className="h-20 w-20 opacity-80" color="#CDEBD6" />
        </Floater>
        <Floater className="left-[42%] top-16 hidden md:block" delay={0.3}>
          <Dot className="h-3 w-3" color="#5b8cff" />
        </Floater>
        <Floater className="left-[18%] bottom-24 hidden sm:block" delay={0.5}>
          <Blob className="h-10 w-10 rotate-12" color="#9CA8FF" />
        </Floater>

         <div className="mx-auto max-w-6xl px-5 pb-28 pt-20 sm:px-8 sm:pt-28">
           {/* Right side image - desktop only */}
           <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none">
             <div className="relative h-full w-full">
               <img
                 src={handsImg}
                 alt="Hands caring"
                 className="h-full w-full object-cover object-left"
               />
                {/* Decorative theme elements over image */}
               <div className="absolute inset-0">
                 {/* Grid of decorative shapes */}
                 <div className="absolute left-8 top-16">
                   <SmileMoon className="h-14 w-24 rotate-12" color="#F4C26B" />
                 </div>
                 <div className="absolute right-20 top-24">
                   <Sunburst className="h-16 w-16" color="#CDEBD6" />
                 </div>
                 <div className="absolute left-12 top-1/2 -translate-y-1/2">
                   <Blob className="h-24 w-24 rotate-45" color="#9CA8FF" />
                 </div>
                 <div className="absolute right-16 top-1/3">
                   <HeartHandshake className="h-20 w-20 text-forest/50" />
                 </div>
                 <div className="absolute bottom-32 left-20">
                   <div className="h-28 w-28 rounded-full bg-forest/15 backdrop-blur-md" />
                 </div>
                 <div className="absolute bottom-20 right-24">
                   <Dot className="h-6 w-6" color="#5b8cff" />
                 </div>
                 {/* Floating smaller dots */}
                 <div className="absolute left-24 top-1/4 animate-[floaterBob_4s_ease-in-out_infinite]">
                   <Dot className="h-3 w-3" color="#F0E6C8" />
                 </div>
                 <div className="absolute right-32 top-1/2 animate-[floaterBob_5s_ease-in-out_infinite_1s]">
                   <Dot className="h-4 w-4" color="#F4C26B" />
                 </div>
                 <div className="absolute left-16 bottom-40 animate-[floaterBob_6s_ease-in-out_infinite_2s]">
                   <Dot className="h-2 w-2" color="#CDEBD6" />
                 </div>
                 {/* Gradient overlay to blend with text */}
                 <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/40 to-transparent" />
               </div>
             </div>
           </div>

           <div
             className="relative z-10 max-w-2xl"
           >
            <span className="inline-flex items-center gap-2 rounded-full bg-paper/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink-soft hairline">
              <span className="size-1.5 rounded-full bg-forest" />
              Live on Base Sepolia
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-ink sm:text-7xl">
              Crowdfunding,
              <br />
              <span className="relative inline-block not-italic text-ink">
                woven together.
                <Underline className="absolute -bottom-2 left-0 h-3 w-full text-forest" />
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg">
              Raise in USDC. Receive in fiat or crypto. Every contribution recorded on-chain — every
              detail finished by hand.
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
          </div>
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
            <div
              key={p.k}
              className="bg-canvas p-8 sm:p-10"
            >
              <div className="font-display text-sm text-ink-soft">{p.k}</div>
              <h3 className="mt-4 font-display text-2xl text-ink">{p.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats — "We move money" */}
      <section className="relative overflow-hidden border-y border-line bg-paper/60">
        <Floater className="right-10 top-16 hidden md:block" delay={0.2}>
          <Sunburst className="h-16 w-16" color="#E8E4D5" />
        </Floater>
        <Floater className="left-8 bottom-20 hidden md:block" delay={0.4}>
          <Blob className="h-8 w-8" color="#9CA8FF" />
        </Floater>
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
            <Sparkles className="size-3.5 text-forest" />
            By the numbers
          </div>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] text-ink sm:text-6xl">
            We move money{" "}
            <span className="relative inline-block not-italic text-ink">
              honestly.
              <Underline className="absolute -bottom-2 left-0 h-3 w-full text-forest" />
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Since launch, Fundloom has powered transparent giving across continents — every dollar
            traceable, every payout instant.
          </p>

          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-line sm:grid-cols-3">
            {[
              { v: "$4.2M+", l: "raised on-chain" },
              { v: "12,400+", l: "contributors" },
              { v: "320+", l: "campaigns funded" },
            ].map((s, i) => (
              <div
                key={s.l}
                className="bg-canvas px-8 py-12 sm:px-10 sm:py-16"
              >
                <div className="font-display text-5xl text-ink sm:text-6xl">{s.v}</div>
                <div className="mt-3 text-sm uppercase tracking-[0.18em] text-ink-soft">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live campaigns */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-forest" />
              </span>
              Happening now
            </div>
            <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
              Live campaigns,
              <br />
              <em className="not-italic text-forest">funding in real time.</em>
            </h2>
          </div>
          <Link
            to="/explore"
            className="group inline-flex items-center gap-2 rounded-full hairline px-5 py-2.5 text-sm text-ink transition hover:bg-ink hover:text-canvas"
          >
            See all
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                img: sample1,
                title: "A school garden in Nairobi",
                raised: 8420,
                goal: 12000,
                backers: 214,
                tag: "Education",
              },
              {
                img: sample2,
                title: "Open-source climate dashboards",
                raised: 23100,
                goal: 50000,
                backers: 612,
                tag: "Climate",
              },
              {
                img: sample3,
                title: "Hand-bound poetry, vol. III",
                raised: 4800,
                goal: 6000,
                backers: 187,
                tag: "Arts",
              },
            ].map((c, i) => {
              const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
              return (
                <article
                  key={c.title}
                  className="group overflow-hidden rounded-3xl bg-paper hairline transition hover:shadow-[var(--shadow-lift)]"
                >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-canvas/90 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-ink backdrop-blur">
                    {c.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-ink">{c.title}</h3>
                  <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-forest" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-ink-soft">
                    <span>
                      <span className="text-ink">${c.raised.toLocaleString()}</span> of $
                      {c.goal.toLocaleString()}
                    </span>
                    <span>{c.backers} backers</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-ink text-canvas">
        <Floater className="right-12 top-20 hidden md:block" delay={0.3}>
          <SmileMoon className="h-10 w-16 rotate-[18deg]" color="#F4C26B" />
        </Floater>
        <Floater className="left-10 bottom-16 hidden md:block" delay={0.5}>
          <Dot className="h-3 w-3" color="#9CA8FF" />
        </Floater>
        <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-canvas/60">
            <Layers className="size-3.5" />
            How it works
          </div>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] sm:text-6xl">
            Three steps. <em className="not-italic text-forest-soft">No friction.</em>
          </h2>

          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            {[
              {
                icon: <Wallet className="size-5" />,
                k: "Step 01",
                t: "Sign in with email",
                d: "We provision a smart wallet behind the scenes — no seed phrase, no extension.",
              },
              {
                icon: <Zap className="size-5" />,
                k: "Step 02",
                t: "Launch in minutes",
                d: "Tell your story, set a goal, pick a payout method. We deploy the escrow contract.",
              },
              {
                icon: <HeartHandshake className="size-5" />,
                k: "Step 03",
                t: "Receive & withdraw",
                d: "Funds settle in USDC instantly. Off-ramp to fiat when you're ready.",
              },
            ].map((s, i) => (
              <div
                key={s.k}
              >
                <div className="flex size-11 items-center justify-center rounded-full border border-canvas/15 text-canvas">
                  {s.icon}
                </div>
                <div className="mt-6 text-xs uppercase tracking-[0.2em] text-canvas/50">{s.k}</div>
                <h3 className="mt-2 font-display text-2xl text-canvas">{s.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-canvas/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
          <Quote className="size-3.5 text-forest" />
          Loved by builders
        </div>
        <h2 className="mt-4 max-w-3xl font-display text-4xl text-ink sm:text-5xl">
          Words from the <em className="not-italic text-forest">loom.</em>
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                q: "Fundloom turned a six-week fiat onboarding into a single afternoon. Donors didn't even notice it was crypto.",
                n: "Amelia Okafor",
                r: "Founder, Lumen Schools",
              },
              {
                q: "The transparency is the product. Every backer can audit the treasury in two clicks.",
                n: "Jonas Ribeiro",
                r: "Lead, OpenClimate",
              },
              {
                q: "It feels like Stripe and Etherscan had a very well-designed child.",
                n: "Mira Tanaka",
                r: "Independent publisher",
              },
            ].map((t, i) => (
              <figure
                key={t.n}
                className="rounded-3xl bg-paper p-8 hairline"
              >
              <Quote className="size-5 text-forest" />
              <blockquote className="mt-5 font-display text-xl leading-[1.35] text-ink">
                “{t.q}”
              </blockquote>
              <figcaption className="mt-8 border-t border-line pt-5 text-sm">
                <div className="text-ink">{t.n}</div>
                <div className="text-ink-soft">{t.r}</div>
              </figcaption>
              </figure>
            ))}
          </div>
        </section>

      {/* Partners marquee */}
      <section className="border-y border-line bg-paper/60 py-14">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
            <Globe2 className="size-3.5 text-forest" />
            Built on open rails
          </div>
        </div>
        <PartnersMarquee partners={partners} />
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
          <ShieldCheck className="size-3.5 text-forest" />
          Frequently asked
        </div>
        <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
          Questions, <em className="not-italic text-forest">answered.</em>
        </h2>

        <div className="mt-12 divide-y divide-line border-y border-line">
          {[
            {
              q: "Do I need a crypto wallet to start?",
              a: "No. Sign in with your email and we provision a non-custodial smart wallet for you. You can export it anytime.",
            },
            {
              q: "How are funds held?",
              a: "Each campaign deploys its own on-chain escrow contract. Funds are released only to the verified creator address.",
            },
            {
              q: "Can my donors pay with a card?",
              a: "Yes. Card payments are converted to USDC at checkout, so creators always settle on-chain.",
            },
            {
              q: "What are the fees?",
              a: "Fundloom charges a flat 2.5% platform fee. Network gas on Base is typically under one cent per donation.",
            },
          ].map((item, i) => (
            <FaqRow key={item.q} q={item.q} a={item.a} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-28 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-10 text-canvas sm:p-16">
          <div className="absolute -right-24 -top-24 size-96 rounded-full bg-forest/30 blur-3xl" />
          <div className="relative flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <div className="text-xs uppercase tracking-[0.2em] text-canvas/60">
                Ready when you are
              </div>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-6xl">
                Start raising in <em className="not-italic text-forest-soft">five minutes.</em>
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-canvas px-6 py-3 text-sm font-medium text-ink transition hover:bg-canvas/90"
              >
                Launch a campaign
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-canvas/20 px-6 py-3 text-sm font-medium text-canvas transition hover:bg-canvas/10"
              >
                Browse campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FaqRow({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center justify-between gap-6 text-left"
      >
        <span className="font-display text-xl text-ink sm:text-2xl">{q}</span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full hairline text-ink transition-colors group-hover:bg-ink group-hover:text-canvas">
          {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
        </span>
      </button>
      <div
        className={`overflow-hidden ${open ? 'h-auto opacity-100' : 'h-0 opacity-0'} transition-all duration-350`}
      >
        <p className="pt-4 text-base leading-relaxed text-ink-soft sm:max-w-2xl">{a}</p>
      </div>
    </div>
  );
}

function PartnersMarquee({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) {
    return (
      <div className="mx-auto mt-8 max-w-6xl px-5 text-sm text-ink-soft sm:px-8">
        Partners coming soon.
      </div>
    );
  }

  // Duplicate the list so the marquee loop is seamless
  const items = [...partners, ...partners];

  return (
    <div className="mt-8 flex gap-16 overflow-hidden">
      {[0, 1].map((track) => (
        <div
          key={track}
          aria-hidden={track === 1 ? true : undefined}
          className="flex shrink-0 animate-[marquee_38s_linear_infinite] items-center gap-16 pr-16"
        >
          {items.map((p, i) => {
            const content = (
              <div className="flex items-center gap-3 opacity-70 transition hover:opacity-100">
                {p.logo_url && (
                  <img
                    src={p.logo_url}
                    alt={p.name}
                    className="h-8 w-auto object-contain sm:h-10"
                    loading="lazy"
                  />
                )}
                <span className="font-display text-lg tracking-tight text-ink-soft sm:text-xl">
                  {p.name}
                </span>
              </div>
            );
            return p.url ? (
              <a
                key={`${track}-${p.id}-${i}`}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                {content}
              </a>
            ) : (
              <span key={`${track}-${p.id}-${i}`} className="shrink-0">
                {content}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
