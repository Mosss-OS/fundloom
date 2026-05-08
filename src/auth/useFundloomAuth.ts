import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { syncUser } from "@/api/users";
import { mockEmbeddedWallet } from "@/lib/wallet";

export type FundloomUser = {
  id: string;
  privy_id: string;
  email: string;
  wallet_address: string | null;
  display_name: string | null;
};

const PRIVY_CONFIGURED =
  typeof import.meta.env.VITE_PRIVY_APP_ID === "string" &&
  import.meta.env.VITE_PRIVY_APP_ID !== "" &&
  import.meta.env.VITE_PRIVY_APP_ID !== "REPLACE_WITH_YOUR_PRIVY_APP_ID";

/**
 * Unifies Privy auth + Supabase user record.
 * If Privy is not configured, falls back to a localStorage-only demo session
 * so the UI is fully testable end-to-end.
 */
export function useFundloomAuth() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Always call hooks (Rules of Hooks)
  const privy = usePrivy();
  const { wallets } = useWallets();
    
  const [user, setUser] = useState<FundloomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const synced = useRef<string | null>(null);

  // Check if Privy is properly configured (not the dummy appId)
  const isAvailable = PRIVY_CONFIGURED && mounted && typeof window !== "undefined" && privy?.ready !== undefined;

  // Demo fallback session (when Privy not configured)
  useEffect(() => {
    if (isAvailable) return;
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("fl.demoUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable]);

  // Privy session → sync to Supabase
  useEffect(() => {
    if (!isAvailable) return;
    if (!privy.ready) return;
    
    if (!privy.authenticated) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Wait for privy.user to be available
    if (!privy.user) {
      const checkUser = setInterval(() => {
        if (privy.user) {
          clearInterval(checkUser);
          syncToSupabase();
        }
      }, 100);
      
      // Stop checking after 5 seconds
      setTimeout(() => clearInterval(checkUser), 5000);
      return;
    }

    syncToSupabase();
    
    function syncToSupabase() {
      const email = privy.user!.email?.address ?? "";
      const privyId = privy.user!.id;
      const wallet =
        wallets[0]?.address ?? privy.user!.wallet?.address ?? mockEmbeddedWallet(privyId || email);

      if (synced.current === privyId) return;
      synced.current = privyId;

      syncUser({ data: { privyId, email, walletAddress: wallet } })
        .then((u) => {
          setUser(u);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable, privy.ready, privy.authenticated, privy.user, wallets]);

  const loginEmail = async (email: string) => {
    if (isAvailable) {
      try {
        // Store email so we can potentially use it
        if (typeof window !== "undefined") {
          localStorage.setItem("fl.pendingEmail", email);
        }
        // Trigger Privy login
        privy.login?.({ loginMethods: ["email"] });
      } catch (e) {
        console.error("Privy login error:", e);
      }
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
    if (isAvailable) {
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
      privyAvailable: isAvailable,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, isAvailable],
  );
}
