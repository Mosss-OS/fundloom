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
        { title: "Fundloom — The Best Crowdfunding Platform | Raise Funds on Blockchain" },
        {
          name: "description",
          content:
            "Fundloom is the most transparent crowdfunding platform. Raise funds with USDC on Base blockchain or accept fiat. Milestone-based escrow, AI-powered, lower fees than GoFundMe. Start your campaign today!",
        },
        { name: "author", content: "Fundloom" },
        { name: "keywords", content: "crowdfunding, blockchain, USDC, Base, GoFundMe alternative, transparent fundraising, milestone escrow, AI campaign optimizer, donate, raise money online" },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        
        // Open Graph (Facebook, LinkedIn)
        { property: "og:title", content: "Fundloom — Better than GoFundMe | Blockchain Crowdfunding" },
        { property: "og:description", content: "Raise more with Fundloom - the transparent, blockchain-powered crowdfunding platform. Lower fees, milestone escrow, AI optimization. Try it now!" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://fundloom.vercel.app" },
        { property: "og:image", content: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png" },
        { property: "og:image:width", content: "1254" },
        { property: "og:image:height", content: "1254" },
        { property: "og:site_name", content: "Fundloom" },
        
        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Fundloom — The GoFundMe Alternative on Blockchain" },
        { name: "twitter:description", content: "Lower fees than GoFundMe. Transparent, on-chain crowdfunding with milestone escrow and AI tools. Start now!" },
        { name: "twitter:image", content: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png" },
        { name: "twitter:site", content: "@fundloom" },
        { name: "twitter:creator", content: "@fundloom" },
        
        // Additional SEO
        { name: "application-name", content: "Fundloom" },
        { name: "msapplication-TileImage", content: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png" },
        { name: "theme-color", content: "#F5F2ED" },
      ],
      links: [
        {
          rel: "icon",
          href: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
          type: "image/png",
          sizes: "32x32",
        },
        {
          rel: "apple-touch-icon",
          href: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
        },
        { rel: "canonical", href: "https://fundloom.vercel.app" },
        { rel: "sitemap", href: "https://fundloom.vercel.app/sitemap.xml" },
      ],
    }),
  };
      { name: "author", content: "Fundloom" },
      { property: "og:title", content: "Fundloom — Crowdfunding, woven together" },
      { property: "og:description", content: "Transparent crowdfunding on Base Sepolia." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:image", content: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png" },
    ],
    links: [
      {
        rel: "icon",
        href: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
        type: "image/png",
      },
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
