import { PrivyProvider } from "@privy-io/react-auth";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Wraps the app with Privy. Always wraps with PrivyProvider to avoid
 * "useWallets called outside PrivyProvider" errors. When not configured,
 * we use a dummy appId or disable features gracefully.
 */
export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const appId = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;
  const isConfigured = appId && appId !== "REPLACE_WITH_YOUR_PRIVY_APP_ID";

  // Always wrap with PrivyProvider to satisfy Rules of Hooks
  return (
    <PrivyProvider
      appId={isConfigured ? appId : "dummy-app-id"}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "light",
          accentColor: "#1a3a24",
          logo: undefined,
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
