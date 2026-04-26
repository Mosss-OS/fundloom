import { PrivyProvider } from "@privy-io/react-auth";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Wraps the app with Privy. Runs only on the client (TanStack Start SSR
 * is on Cloudflare Workers; Privy's SDK is browser-only). On the server
 * and during the first hydration tick we just render children unwrapped.
 */
export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const appId = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;

  if (!mounted || !appId || appId === "REPLACE_WITH_YOUR_PRIVY_APP_ID") {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "light",
          accentColor: "#1a3a24",
          logo: undefined,
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}