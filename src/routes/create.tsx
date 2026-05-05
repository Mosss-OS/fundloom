import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Upload, X, Sparkles } from "lucide-react";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { useEthersSigner } from "@/lib/ethers";
import { getContractInstance } from "@/integrations/contract";
import { createCampaign, uploadCampaignCover } from "@/functions/campaigns.functions";
import { AiCampaignOptimizer } from "@/components/AiCampaignOptimizer";
import { formatUSD } from "@/lib/format";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "New campaign — Fundloom" }] }),
  component: CreatePage,
});

const STEPS = ["Story", "Goal", "Cover", "Milestones", "Review"] as const;

const CATEGORIES: { value: string; label: string }[] = [
  { value: "art", label: "Art" },
  { value: "tech", label: "Tech" },
  { value: "community", label: "Community" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "environment", label: "Environment" },
  { value: "music", label: "Music" },
  { value: "food", label: "Food" },
  { value: "gaming", label: "Gaming" },
  { value: "other", label: "Other" },
];

function CreatePage() {
  const { user, loading } = useFundloomAuth();
  const { getSigner } = useEthersSigner();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("other");
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [cover, setCover] = useState("");
  const [uploading, setUploading] = useState(false);
  const [payout, setPayout] = useState<"crypto" | "fiat">("crypto");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<Array<{ description: string; amount: string }>>([]);
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  const canNext = () => {
    if (step === 0)
      return title.trim().length >= 3 && description.trim().length >= 10 && !!category;
    if (step === 1) return Number(goal) > 0 && !!deadline;
    if (step === 2) return !uploading;
    return true;
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("Image must be 4 MB or less.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await uploadCampaignCover({
        data: {
          userId: user.id,
          fileName: file.name,
          contentType: file.type,
          fileBase64: base64,
        },
      });
      setCover(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      // Create on-chain campaign first
      const signer = await getSigner();
      let onChainCampaignId: number | undefined;

      if (signer) {
        const contract = getContractInstance(signer);
        const deadlineUnix = Math.floor(new Date(deadline).getTime() / 1000);
        onChainCampaignId = await contract.createCampaign(Number(goal), deadlineUnix);

        // Add milestones to the on-chain campaign
        if (milestones.length > 0) {
          for (const m of milestones) {
            await contract.addMilestone(onChainCampaignId, m.description, Number(m.amount));
          }
        }
      }

      // Create Supabase record with on-chain ID
      const row = await createCampaign({
        data: {
          userId: user.id,
          title: title.trim(),
          description: description.trim(),
          goalAmount: Number(goal),
          deadline: new Date(deadline).toISOString(),
          coverImageUrl: cover.trim() || null,
          payoutPreference: payout,
          category: category as Tables<"campaigns">["category"],
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
              <Field label="Category">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`rounded-full px-4 py-2 text-xs transition hairline ${
                        category === c.value
                          ? "bg-ink text-canvas"
                          : "bg-paper text-ink-soft hover:text-ink"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
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
                  <span className="absolute inset-y-0 left-5 flex items-center text-ink-soft">
                    $
                  </span>
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={onFileChange}
              />

              {cover ? (
                <div className="relative overflow-hidden rounded-3xl hairline">
                  <img src={cover} alt="" className="aspect-[5/3] w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCover("")}
                    className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-ink/80 text-canvas backdrop-blur transition hover:bg-ink"
                    aria-label="Remove cover"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onPickFile}
                  disabled={uploading}
                  className="flex aspect-[5/3] w-full flex-col items-center justify-center gap-3 rounded-3xl bg-paper text-sm text-ink-soft transition hover:bg-ink/5 hairline disabled:opacity-50"
                >
                  <Upload className="size-6" />
                  {uploading ? "Uploading…" : "Upload cover image"}
                  <span className="text-xs">PNG, JPG, WEBP · up to 4 MB</span>
                </button>
              )}

              <Field label="Or paste an image URL">
                <input
                  value={cover}
                  onChange={(e) => setCover(e.target.value)}
                  placeholder="https://…"
                  className={inputCls}
                />
              </Field>
              {error && <p className="text-sm text-destructive">{error}</p>}
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
                <Row k="Category" v={category} />
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
