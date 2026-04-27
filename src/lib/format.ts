export const formatUSD = (n: number | string | null | undefined) => {
  const v = typeof n === "string" ? Number(n) : (n ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: v >= 1000 ? 0 : 2,
  }).format(v || 0);
};

export const shortAddr = (addr?: string | null) => {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
};

export const daysLeft = (deadline: string) => {
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const d = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return `${d} day${d === 1 ? "" : "s"} left`;
};

export const progress = (raised: number | string, goal: number | string) => {
  const r = Number(raised) || 0;
  const g = Number(goal) || 1;
  return Math.min(100, Math.round((r / g) * 100));
};

/** BaseScan (Sepolia) URL for a tx hash. Returns null for non-0x hashes. */
export const baseScanTxUrl = (hash?: string | null): string | null => {
  if (!hash) return null;
  if (!hash.startsWith("0x")) return null;
  return `https://sepolia.basescan.org/tx/${hash}`;
};

export const baseScanAddressUrl = (addr?: string | null): string | null => {
  if (!addr || !addr.startsWith("0x")) return null;
  return `https://sepolia.basescan.org/address/${addr}`;
};

export const formatTimeAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};