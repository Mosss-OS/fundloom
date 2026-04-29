import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { detectFraud } from "@/lib/groq";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import type { Tables } from "@/integrations/supabase/types";

interface CreatorHistory {
  campaignsCreated: number;
  successfulCampaigns: number;
  totalRaised: number;
}

export function AiFraudDetection({
  campaign,
  creatorHistory,
}: {
  campaign: Tables<"campaigns">;
  creatorHistory?: CreatorHistory;
}) {
  const { user } = useFundloomAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    riskScore: number;
    riskLevel: "low" | "medium" | "high";
    flags: string[];
    recommendation: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const fraudResult = await detectFraud({
        title: campaign.title,
        description: campaign.description,
        category: campaign.category || "other",
        goalAmount: Number(campaign.goal_amount),
        creatorHistory: creatorHistory || {
          campaignsCreated: 0,
          successfulCampaigns: 0,
          totalRaised: 0,
        },
      });
      setResult(fraudResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fraud detection failed");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="size-5" />;
      case "medium":
        return <AlertTriangle className="size-5" />;
      case "high":
        return <AlertTriangle className="size-5" />;
      default:
        return <Shield className="size-5" />;
    }
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-red-50 to-orange-50 p-6 hairline">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="size-5 text-red-600" />
        <h3 className="font-display text-lg text-ink">AI Fraud Detection</h3>
      </div>

      <button
        onClick={handleDetect}
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-red-600 to-orange-600 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="size-4 animate-spin" />
            Analyzing risk...
          </span>
        ) : (
          "Analyze Campaign Risk"
        )}
      </button>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-4"
          >
            {/* Risk Score */}
            <div className="rounded-xl bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRiskIcon(result.riskLevel)}
                  <span className="text-sm font-medium text-ink">Risk Score</span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${getRiskColor(result.riskLevel)}`}
                >
                  {result.riskScore}/100
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.riskScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    result.riskLevel === "low"
                      ? "bg-green-500"
                      : result.riskLevel === "medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
              </div>
            </div>

            {/* Risk Level */}
            <div className="rounded-xl bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">
                Risk Level
              </div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getRiskColor(result.riskLevel)}`}
              >
                {result.riskLevel.toUpperCase()}
              </span>
            </div>

            {/* Flags */}
            {result.flags.length > 0 && (
              <div className="rounded-xl bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">Flags</div>
                <ul className="space-y-1">
                  {result.flags.map((flag, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                      <span className="mt-1 text-red-600">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendation */}
            <div className="rounded-xl bg-white/80 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-soft mb-2">
                Recommendation
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">{result.recommendation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !loading && (
        <p className="mt-3 text-xs text-ink-soft">
          AI will analyze the campaign for potential fraud indicators and provide a risk assessment.
        </p>
      )}
    </div>
  );
}
