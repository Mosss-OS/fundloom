import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { syncUser } from "@/api/users";
import { mockEmbeddedWallet } from "@/lib/wallet";

export type FundloomUser = {
  id: string;
  privy_id: string;
  email: string;
  wallet_address: string | null;
  display_name: string | null;
};

type FundloomAuthContextType = {
  user: FundloomUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  privyAvailable: boolean;
};

const FundloomAuthContext = createContext<FundloomAuthContextType | null>(null);

const PRIVY_CONFIGURED =
  typeof import.meta.env.VITE_PRIVY_APP_ID === "string" &&
  import.meta.env.VITE_PRIVY_APP_ID !== "" &&
  import.meta.env.VITE_PRIVY_APP_ID !== "REPLACE_WITH_YOUR_PRIVY_APP_ID";

/**
 * Provider component that wraps the app and provides auth context
 */
export function FundloomAuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  // Always call hooks (Rules of Hooks)
  const privy = usePrivy();
  const { wallets } = useWallets();
     
  const [user, setUser] = useState<FundloomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const synced = useRef<string | null>(null);

  // Check if Privy is properly configured and ready
  const isAvailable = PRIVY_CONFIGURED && mounted && privy.ready === true;

  // Demo fallback session (when Privy not configured)
  useEffect(() => {
    if (isAvailable) return;
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("fl.demoUser");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem("fl.demoUser");
      }
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable]);

  // Privy session → sync to Supabase
  useEffect(() => {
    if (!isAvailable) return;
    if (!privy.ready) return;
    
    console.log("[FundloomAuth] Privy state:", { 
      authenticated: privy.authenticated, 
      hasUser: !!privy.user, 
      userId: privy.user?.id,
      ready: privy.ready,
      walletCount: wallets.length 
    });
    
    if (!privy.authenticated) {
      setUser(null);
      setLoading(false);
      synced.current = null;
      return;
    }

    // If no user yet, keep loading and wait
    if (!privy.user) {
      console.log("[FundloomAuth] Authenticated but no user yet, waiting...");
      setLoading(true);
      return;
    }

    // We have both authenticated and user - sync to Supabase
    const email = privy.user.email?.address ?? "";
    const privyId = privy.user.id;
    const wallet =
      wallets[0]?.address ?? privy.user.wallet?.address ?? mockEmbeddedWallet(privyId || email);

    // Avoid re-syncing the same user
    if (synced.current === privyId) {
      console.log("[FundloomAuth] Already synced user:", privyId);
      setLoading(false);
      return;
    }
    synced.current = privyId;

    console.log("[FundloomAuth] Syncing user to Supabase:", { privyId, email, wallet });
    setLoading(true);
    syncUser({ data: { privyId, email, walletAddress: wallet } })
      .then((u) => {
        console.log("[FundloomAuth] User synced successfully:", u);
        setUser(u);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[FundloomAuth] Failed to sync user:", err);
        setUser(null);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAvailable, privy.ready, privy.authenticated, privy.user, wallets]);

  const loginEmail = async (email: string) => {
    if (isAvailable) {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("fl.pendingEmail", email);
        }
        privy.login?.({ loginMethods: ["email"] });
      } catch (e) {
        console.error("[FundloomAuth] Login error:", e);
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

  const value = useMemo(
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

  return (
    <FundloomAuthContext.Provider value={value}>
      {children}
    </FundloomAuthContext.Provider>
  );
}

/**
 * Hook to use the Fundloom auth context
 */
export function useFundloomAuth() {
  const context = useContext(FundloomAuthContext);
  if (!context) {
    throw new Error("useFundloomAuth must be used within a FundloomAuthProvider");
  }
  return context;
}
