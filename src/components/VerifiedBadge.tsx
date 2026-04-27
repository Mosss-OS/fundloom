import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Verified creator"
      className={`inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-forest ${className}`}
    >
      <BadgeCheck className="size-3" />
      Verified
    </span>
  );
}
