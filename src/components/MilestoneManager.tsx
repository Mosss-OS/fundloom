import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Check, Lock, Unlock } from "lucide-react";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { useEthersSigner } from "@/lib/ethers";
import { getContractInstance, MilestoneData, MilestoneStatus } from "@/integrations/contract";
import { formatUSD } from "@/lib/format";

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  0: "Pending",
  1: "Approved",
  2: "Released",
};

const STATUS_COLORS: Record<MilestoneStatus, string> = {
  0: "bg-yellow-100 text-yellow-700",
  1: "bg-blue-100 text-blue-700",
  2: "bg-green-100 text-green-700",
};

export function MilestoneManager({
  campaignId,
  isOwner,
  milestonesCount,
  onChanged,
  onReleaseMilestone,
}: {
  campaignId: number;
  isOwner: boolean;
  milestonesCount: number;
  onChanged: () => void;
  onReleaseMilestone?: (milestoneId: number) => void;
}) {
  const { user } = useFundloomAuth();
  const { getSigner } = useEthersSigner();
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMilestone = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Wallet not available");

      const contract = getContractInstance(signer);
      await contract.addMilestone(campaignId, description, Number(amount));

      setDescription("");
      setAmount("");
      setShowAddForm(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add milestone");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (milestoneId: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const signer = await getSigner();
      if (!signer) throw new Error("Wallet not available");

      const contract = getContractInstance(signer);
      await contract.approveMilestone(campaignId, milestoneId);
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to approve");
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async (milestoneId: number) => {
    if (!user) return;
    setLoading(true);
    try {
      // Use the parent's release function if provided, otherwise use internal
      if (onReleaseMilestone) {
        await onReleaseMilestone(milestoneId);
      } else {
        const signer = await getSigner();
        if (!signer) throw new Error("Wallet not available");

        const contract = getContractInstance(signer);
        await contract.releaseMilestone(campaignId, milestoneId);
      }
      onChanged();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to release");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-ink">Milestones</h3>
        {isOwner && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-xs font-medium text-canvas hover:bg-ink/90"
          >
            <Plus className="size-3.5" />
            Add Milestone
          </button>
        )}
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-paper p-5 hairline space-y-3"
        >
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Milestone description (e.g., Complete prototype)"
            className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-ink-soft">$</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount in USD"
              className="w-full rounded-xl border border-line bg-canvas px-4 py-3 pl-8 text-sm outline-none focus:border-ink"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-full px-4 py-2 text-xs text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMilestone}
              disabled={loading || !description || !amount}
              className="rounded-full bg-ink px-4 py-2 text-xs text-canvas disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Milestone"}
            </button>
          </div>
        </motion.div>
      )}

      <MilestoneList
        campaignId={campaignId}
        milestonesCount={milestonesCount}
        isOwner={isOwner}
        onApprove={handleApprove}
        onRelease={handleRelease}
        loading={loading}
      />
    </div>
  );
}

function MilestoneList({
  campaignId,
  milestonesCount,
  isOwner,
  onApprove,
  onRelease,
  loading,
}: {
  campaignId: number;
  milestonesCount: number;
  isOwner: boolean;
  onApprove: (id: number) => void;
  onRelease: (id: number) => void;
  loading: boolean;
}) {
  const { getSigner } = useEthersSigner();
  const [milestones, setMilestones] = useState<
    Array<{ id: number; description: string; amount: number; status: MilestoneStatus }>
  >([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);

  // Fetch milestones
  const fetchMilestones = async () => {
    if (milestonesCount === 0) return;
    setLoadingMilestones(true);
    try {
      const signer = await getSigner();
      if (!signer) return;

      const contract = getContractInstance(signer);
      const items = [];
      for (let i = 0; i < milestonesCount; i++) {
        const data: MilestoneData = await contract.getMilestone(campaignId, i);
        if (data.exists) {
          items.push({
            id: i,
            description: data.description,
            amount: Number(data.amount) / 1e6, // Convert from USDC decimals
            status: data.status as MilestoneStatus,
          });
        }
      }
      setMilestones(items);
    } catch (e) {
      console.error("Failed to fetch milestones:", e);
    } finally {
      setLoadingMilestones(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchMilestones();
  }, [campaignId, milestonesCount]);

  if (milestonesCount === 0) {
    return (
      <div className="rounded-2xl bg-paper p-6 text-sm text-ink-soft hairline">
        No milestones yet. {isOwner && "Add one to start escrow-based funding."}
      </div>
    );
  }

  if (loadingMilestones) {
    return <div className="text-sm text-ink-soft">Loading milestones...</div>;
  }

  return (
    <div className="space-y-2">
      {milestones.map((m) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-paper p-4 hairline"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm text-ink">{m.description}</div>
              <div className="mt-1 text-xs text-ink-soft">{formatUSD(m.amount)}</div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-1 text-[10px] font-medium ${STATUS_COLORS[m.status]}`}
              >
                {STATUS_LABELS[m.status]}
              </span>
              {isOwner && m.status === 0 && (
                <button
                  onClick={() => onApprove(m.id)}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  <Check className="size-3" />
                  Approve
                </button>
              )}
              {isOwner && m.status === 1 && (
                <button
                  onClick={() => onRelease(m.id)}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-[10px] font-medium text-white hover:bg-green-600 disabled:opacity-50"
                >
                  <Unlock className="size-3" />
                  Release
                </button>
              )}
              {m.status === 2 && <Lock className="size-3 text-green-600" />}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
