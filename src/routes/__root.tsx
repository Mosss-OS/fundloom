import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { PrivyAuthProvider } from "@/auth/PrivyAuthProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-ink">404</h1>
        <h2 className="mt-4 font-display text-xl text-ink">Page not found</h2>
        <p className="mt-2 text-sm text-ink-soft">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-ink/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Fundloom — Crowdfunding, woven together" },
      {
        name: "description",
        content:
          "Raise and receive funds in USDC on Base or fiat. Transparent, on-chain by default, beautifully simple.",
      },
      { name: "author", content: "Fundloom" },
      { property: "og:title", content: "Fundloom — Crowdfunding, woven together" },
      { property: "og:description", content: "Transparent crowdfunding on Base Sepolia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <PrivyAuthProvider>
      <div className="min-h-screen bg-canvas text-ink">
        <SiteHeader />
        <Outlet />
        <Toaster />
      </div>
    </PrivyAuthProvider>
  );
}
