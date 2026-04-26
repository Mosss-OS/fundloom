import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { createCampaign } from "@/server/campaigns.functions";
import { formatUSD } from "@/lib/format";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "New campaign — Fundloom" }] }),
  component: CreatePage,
});

const STEPS = ["Story", "Goal", "Cover", "Review"] as const;

function CreatePage() {
  const { user, loading } = useFundloomAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [cover, setCover] = useState("");
  const [payout, setPayout] = useState<"crypto" | "fiat">("crypto");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const canNext = () => {
    if (step === 0) return title.trim().length >= 3 && description.trim().length >= 10;
    if (step === 1) return Number(goal) > 0 && !!deadline;
    if (step === 2) return true; // cover optional
    return true;
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const row = await createCampaign({
        data: {
          userId: user.id,
          title: title.trim(),
          description: description.trim(),
          goalAmount: Number(goal),
          deadline: new Date(deadline).toISOString(),
          coverImageUrl: cover.trim() || null,
          payoutPreference: payout,
        },
      });
      navigate({ to: "/c/$id", params: { id: row.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create campaign.");
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return <main className="mx-auto max-w-2xl px-5 py-24" />;
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      {/* Progress dots */}
      <div className="mb-12 flex items-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`flex size-7 items-center justify-center rounded-full text-xs transition ${
                i <= step ? "bg-ink text-canvas" : "bg-paper text-ink-soft hairline"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs ${i === step ? "text-ink" : "text-ink-soft"}`}>{label}</span>
            {i < STEPS.length - 1 && <span className="text-ink-soft">/</span>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-4xl text-ink">Tell the story.</h1>
                <p className="mt-2 text-ink-soft">A clear title, a real reason.</p>
              </div>
              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder="A community kiln for Lisbon"
                  className={inputCls}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={4000}
                  rows={6}
                  placeholder="What are you building, and who does it serve?"
                  className={inputCls + " resize-none"}
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-4xl text-ink">Set the goal.</h1>
                <p className="mt-2 text-ink-soft">In USD. We'll handle the on-chain conversion.</p>
              </div>
              <Field label="Funding goal (USD)">
                <div className="relative">
                  <span className="absolute inset-y-0 left-5 flex items-center text-ink-soft">$</span>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="10,000"
                    className={inputCls + " pl-9"}
                  />
                </div>
              </Field>
              <Field label="Deadline">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                  className={inputCls}
                />
              </Field>
              <Field label="Payout preference">
                <div className="grid grid-cols-2 gap-2">
                  {(["crypto", "fiat"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPayout(p)}
                      className={`rounded-2xl px-4 py-3 text-sm capitalize transition hairline ${
                        payout === p ? "bg-ink text-canvas" : "bg-paper text-ink hover:bg-ink/5"
                      }`}
                    >
                      {p === "crypto" ? "USDC (Base)" : "Fiat (off-ramp)"}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-4xl text-ink">Add a cover.</h1>
                <p className="mt-2 text-ink-soft">Optional. A good image earns trust.</p>
              </div>
              <Field label="Cover image URL">
                <input
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder="https://…"
                  className={inputCls}
                />
              </Field>
              {cover && (
                <div className="overflow-hidden rounded-3xl hairline">
                  <img src={cover} alt="" className="aspect-[5/3] w-full object-cover" />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-4xl text-ink">Review.</h1>
                <p className="mt-2 text-ink-soft">One last look before launch.</p>
              </div>
              <div className="space-y-3 rounded-3xl bg-paper p-6 hairline">
                <Row k="Title" v={title} />
                <Row k="Goal" v={formatUSD(Number(goal))} />
                <Row k="Deadline" v={new Date(deadline).toLocaleDateString()} />
                <Row k="Payout" v={payout === "crypto" ? "USDC (Base)" : "Fiat off-ramp"} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-sm text-ink-soft transition hover:text-ink disabled:opacity-30"
        >
          ← Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => canNext() && setStep((s) => s + 1)}
            disabled={!canNext()}
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-canvas transition hover:bg-ink/90 disabled:opacity-40"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded-full bg-forest px-6 py-3 text-sm font-medium text-canvas transition hover:bg-forest/90 disabled:opacity-60"
          >
            {submitting ? "Launching…" : "Launch campaign"}
          </button>
        )}
      </div>
    </main>
  );
}

const inputCls =
  "block w-full rounded-2xl border border-line bg-paper px-5 py-4 text-base text-ink placeholder:text-ink-soft/60 outline-none transition focus:border-ink focus:ring-0";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">{k}</span>
      <span className="text-right text-sm text-ink">{v}</span>
    </div>
  );
}