import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { syncUser } from "@/server/users.functions";
import { mockEmbeddedWallet } from "@/lib/wallet";

export type FundloomUser = {
  id: string;
  privy_id: string;
  email: string;
  wallet_address: string | null;
  display_name: string | null;
};

/**
 * Unifies Privy auth + Supabase user record.
 * If Privy is not configured, falls back to a localStorage-only demo session
 * so the UI is fully testable end-to-end.
 */
export function useFundloomAuth() {
  const privy = useSafePrivy();
  const wallets = useSafeWallets();
  const [user, setUser] = useState<FundloomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const synced = useRef<string | null>(null);

  // Demo fallback session
  useEffect(() => {
    if (privy.available) return;
    const stored = typeof window !== "undefined" ? localStorage.getItem("fl.demoUser") : null;
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, [privy.available]);

  // Privy session → sync to Supabase
  useEffect(() => {
    if (!privy.available) return;
    if (!privy.ready) return;
    if (!privy.authenticated || !privy.user) {
      setUser(null);
      setLoading(false);
      return;
    }
    const email = privy.user.email?.address ?? "";
    const privyId = privy.user.id;
    const wallet =
      wallets[0]?.address ?? privy.user.wallet?.address ?? mockEmbeddedWallet(privyId || email);

    if (synced.current === privyId) return;
    synced.current = privyId;

    syncUser({ data: { privyId, email, walletAddress: wallet } })
      .then((u) => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [privy.available, privy.ready, privy.authenticated, privy.user, wallets]);

  const loginEmail = async (email: string) => {
    if (privy.available) {
      // Privy's `login()` opens its modal; for inline email flow users
      // would call sendCode/loginWithCode. For MVP we just open the modal.
      privy.login?.();
      return;
    }
    // Demo fallback
    const privyId = `demo:${email}`;
    const wallet = mockEmbeddedWallet(privyId);
    const u = await syncUser({ data: { privyId, email, walletAddress: wallet } });
    setUser(u);
    if (typeof window !== "undefined") {
      localStorage.setItem("fl.demoUser", JSON.stringify(u));
    }
  };

  const logout = async () => {
    if (privy.available) {
      await privy.logout?.();
    }
    if (typeof window !== "undefined") localStorage.removeItem("fl.demoUser");
    setUser(null);
    synced.current = null;
  };

  return useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      loginEmail,
      logout,
      privyAvailable: privy.available,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, privy.available],
  );
}

/** Calls usePrivy only when the provider is mounted; otherwise returns a stub. */
function useSafePrivy() {
  const appId = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;
  const available = !!appId && appId !== "REPLACE_WITH_YOUR_PRIVY_APP_ID";
  if (!available) {
    return { available: false as const, ready: true, authenticated: false, user: null };
  }
  // Hooks rules: this branch is stable across renders for a given build env.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const p = usePrivy();
  return { available: true as const, ...p };
}
function useSafeWallets() {
  const appId = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;
  const available = !!appId && appId !== "REPLACE_WITH_YOUR_PRIVY_APP_ID";
  if (!available) return [] as { address: string }[];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { wallets } = useWallets();
  return wallets ?? [];
}
