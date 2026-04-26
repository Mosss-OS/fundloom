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