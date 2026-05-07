import { useState } from "react";
import { Sparkles, Lightbulb, Tag, RefreshCw } from "lucide-react";
import { optimizeCampaign } from "@/lib/groq";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { formatUSD } from "@/lib/format";

export function AiCampaignOptimizer({
  title,
  description,
  category,
  goalAmount,
  deadline,
  onApplySuggestions,
}: {
  title: string;
  description: string;
  category: string;
  goalAmount: number;
  deadline: string;
  onApplySuggestions: (suggestions: { title: string; description: string; tags: string[] }) => void;
}) {
  const { user } = useFundloomAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    improvedTitle: string;
    improvedDescription: string;
    suggestions: string[];
    tags: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const handleOptimize = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setApplied(false);

    try {
      const optimized = await optimizeCampaign({
        title,
        description,
        category,
        goalAmount,
        deadline,
      });
      setResult(optimized);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplySuggestions({
      title: result.improvedTitle,
      description: result.improvedDescription,
      tags: result.tags,
    });
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-blue-50 p-6 hairline">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="size-5 text-purple-600" />
        <h3 className="font-display text-lg text-ink">AI Campaign Optimizer</h3>
      </div>

      <button
        onClick={handleOptimize}
        disabled={loading || !title || !description}
        className="w-full rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="size-4 animate-spin" />
            Analyzing campaign...
          </span>
        ) : (
          "Optimize with AI"
        )}
      </button>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {result && (
          <div className="mt-6 space-y-4">
            {/* Improved Title */}
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                Improved Title
              </div>
              <div className="mt-1 rounded-xl bg-white/80 p-3 text-sm text-ink">
                {result.improvedTitle}
              </div>
            </div>

            {/* Improved Description */}
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                Improved Description
              </div>
              <div className="mt-1 rounded-xl bg-white/80 p-3 text-sm text-ink whitespace-pre-line">
                {result.improvedDescription}
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <div className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-ink-soft">
                <Lightbulb className="size-3" />
                Suggestions
              </div>
              <ul className="mt-2 space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span className="mt-1 text-purple-600">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-ink-soft">
                <Tag className="size-3" />
                Suggested Tags
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApply}
              disabled={applied}
              className="w-full rounded-full bg-ink px-6 py-3 text-sm font-medium text-canvas transition hover:bg-ink/90 disabled:opacity-50"
            >
              {applied ? "Applied!" : "Apply Suggestions"}
            </button>
          </div>
        )}

      {!result && !loading && (
        <p className="mt-3 text-xs text-ink-soft">
          AI will analyze your campaign and provide title improvements, description enhancements,
          and optimization suggestions.
        </p>
      )}
    </div>
  );
}
