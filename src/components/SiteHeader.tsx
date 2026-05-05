import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useFundloomAuth } from "@/auth/useFundloomAuth";
import { shortAddr } from "@/lib/format";
import { isCurrentUserAdmin } from "@/functions/partners.functions";

export function SiteHeader() {
  const { user, logout } = useFundloomAuth();
  const { location } = useRouterState();
  const onLanding = location.pathname === "/";
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    isCurrentUserAdmin({ data: { actorUserId: user.id } })
      .then((r) => {
        if (!cancelled) setIsAdmin(!!r.isAdmin);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 border-b border-line/60 bg-canvas/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2">
          <LoomMark />
          <span className="font-display text-lg tracking-tight text-ink">Fundloom</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-ink-soft md:flex">
          <Link
            to="/explore"
            className="transition hover:text-ink"
            activeProps={{ className: "text-ink" }}
          >
            Explore
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className="transition hover:text-ink"
              activeProps={{ className: "text-ink" }}
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/create"
            className="transition hover:text-ink"
            activeProps={{ className: "text-ink" }}
          >
            Create
          </Link>
          {isAdmin && (
            <Link
              to="/admin/partners"
              className="transition hover:text-ink"
              activeProps={{ className: "text-ink" }}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden rounded-full bg-paper px-3 py-1.5 text-xs text-ink-soft hairline sm:inline">
                {shortAddr(user.wallet_address)}
              </span>
              <button
                onClick={() => logout()}
                className="rounded-full px-3 py-1.5 text-sm text-ink-soft transition hover:text-ink"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-ink px-4 py-2 text-sm text-canvas transition hover:bg-ink/90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}

function LoomMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle
        cx="11"
        cy="11"
        r="10.5"
        stroke="currentColor"
        className="text-ink"
        strokeWidth="0.6"
      />
      <path
        d="M3 11h16M11 3v16M5 5l12 12M17 5L5 17"
        stroke="currentColor"
        className="text-ink"
        strokeWidth="0.6"
      />
    </svg>
  );
}
