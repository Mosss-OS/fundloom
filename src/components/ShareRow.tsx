import { useState } from "react";
import { Link2, Twitter, Sparkles, Check } from "lucide-react";

type Props = {
  url: string;
  title: string;
};

export function ShareRow({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title,
  )}&url=${encodeURIComponent(url)}`;
  const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
    title + " " + url,
  )}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-[0.18em] text-ink-soft">Share</span>
      <button
        onClick={copy}
        type="button"
        className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs text-ink-soft transition hover:text-ink hairline"
      >
        {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs text-ink-soft transition hover:text-ink hairline"
      >
        <Twitter className="size-3.5" />X
      </a>
      <a
        href={farcasterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs text-ink-soft transition hover:text-ink hairline"
      >
        <Sparkles className="size-3.5" />
        Farcaster
      </a>
    </div>
  );
}
