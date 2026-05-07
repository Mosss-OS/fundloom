import { useState } from "react";
import { Heart, RefreshCw, Target, DollarSign } from "lucide-react";
import { matchDonors } from "@/lib/groq";
import { useFundloomAuth } from "@/auth/useFundloomAuth";

export function SmartDonorMatching({
  campaignTitle,
  campaignDescription,
  campaignCategory,
  donorPreferences,
  donorHistory,
}: {
  campaignTitle: string;
  campaignDescription: string;
  campaignCategory: string;
  donorPreferences?: string[];
  donorHistory?: Array<{ title: string; category: string }>;
}) {
  const { user } = useFundloomAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    matchScore: number;
    reasons: string[];
    suggestedAmount: number;
    similarCampaigns: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const matchResult = await matchDonors({
        campaignTitle,
        campaignDescription,
        campaignCategory,
        donorPreferences,
        donorHistory,
      });
      setResult(matchResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Donor matching failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 p-6 hairline">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="size-5 text-pink-600" />
        <h3 className="font-display text-lg text-ink">Smart Donor Matching</h3>
      </div>

      <button
        onClick={handleMatch}
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="size-4 animate-spin" />
            Finding matches...
          </span>
        ) : (
          "Find Matching Donors"
        )}
      </button>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {result && (
          <div className="mt-6 space-y-4">
            {/* Match Score */}
            <div className="rounded-xl bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="size-5 text-pink-600" />
                  <span className="text-sm font-medium text-ink">Match Score</span>
                </div>
                <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700">
                  {result.matchScore}/100
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  style={{ width: `${result.matchScore}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
                />
              </div>
            </div>

            {/* Suggested Amount */}
            <div className="rounded-xl bg-white/80 p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="size-5 text-green-600" />
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-ink-soft">
                    Suggested Donation
                  </div>
                  <div className="text-2xl font-display text-ink">${result.suggestedAmount}</div>
                </div>
              </div>
            </div>

            {/* Reasons */}
            {result.reasons.length > 0 && (
              <div className="rounded-xl bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">
                  Why This Matches
                </div>
                <ul className="space-y-1">
                  {result.reasons.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                      <span className="mt-1 text-pink-600">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Similar Campaigns */}
            {result.similarCampaigns.length > 0 && (
              <div className="rounded-xl bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">
                  Similar Successful Campaigns
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.similarCampaigns.map((campaign, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700"
                    >
                      {campaign}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {!result && !loading && (
        <p className="mt-3 text-xs text-ink-soft">
          AI will analyze donor preferences and campaign details to suggest the best matches and
          optimal donation amounts.
        </p>
      )}
    </div>
  );
}
