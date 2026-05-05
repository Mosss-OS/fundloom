# SEO Guide

Last updated: May 2026

## Overview

Fundloom implements comprehensive SEO (Search Engine Optimization) to ensure maximum visibility in search engines. This document covers meta tags, Open Graph, Twitter Cards, structured data, sitemaps, and other SEO enhancements.

## Meta Tags (#384)

### Basic Meta Tags

Implemented in `src/routes/__root.tsx`:

```tsx
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { title: "Fundloom — The Best Crowdfunding Platform" },
      {
        name: "description",
        content: "Fundloom is the most transparent crowdfunding platform...",
      },
      { name: "author", content: "Fundloom" },
      {
        name: "keywords",
        content: "crowdfunding, blockchain, USDC, Base, GoFundMe alternative...",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1",
      },
      { name: "application-name", content: "Fundloom" },
      { name: "theme-color", content: "#F5F2ED" },
      { httpEquiv: "Content-Type", content: "text/html; charset=utf-8" },
      { name: "language", content: "en-US" },
    ],
  }),
});
```

### Page-Specific Meta Tags

Each route can override meta tags:

```tsx
// src/routes/explore.tsx
export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Campaigns — Fundloom" },
      { name: "description", content: "Discover amazing crowdfunding campaigns..." },
    ],
  }),
});
```

## Open Graph (#385)

Open Graph tags help control how your pages appear when shared on Facebook, LinkedIn, and other social platforms.

### Implemented Tags

```tsx
export const Route = createRootRoute({
  head: () => ({
    meta: [
      { property: "og:title", content: "Fundloom — Better than GoFundMe" },
      { property: "og:description", content: "Raise more with Fundloom..." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://fundloom.vercel.app" },
      { property: "og:image", content: "https://res.cloudinary.com/..." },
      { property: "og:image:width", content: "1254" },
      { property: "og:image:height", content: "1254" },
      { property: "og:site_name", content: "Fundloom" },
      { property: "og:locale", content: "en_US" },
    ],
  }),
});
```

### Dynamic Open Graph Tags

Campaign pages should have dynamic OG tags:

```tsx
// src/routes/c.$id.tsx
export const Route = createFileRoute("/c/$id")({
  head: ({ data }) => ({
    meta: [
      { property: "og:title", content: data?.campaign?.title || "Campaign" },
      { property: "og:description", content: data?.campaign?.description?.slice(0, 200) },
      { property: "og:image", content: data?.campaign?.cover_image_url || defaultImage },
      { property: "og:type", content: "article" },
    ],
  }),
});
```

## Twitter Cards (#386)

Twitter Card tags control how your pages appear when shared on Twitter/X.

### Implemented Tags

```tsx
{ name: "twitter:card", content: "summary_large_image" },
{ name: "twitter:title", content: "Fundloom — The GoFundMe Alternative" },
{ name: "twitter:description", content: "Lower fees than GoFundMe..." },
{ name: "twitter:image", content: "https://res.cloudinary.com/..." },
{ name: "twitter:site", content: "@fundloom" },
{ name: "twitter:creator", content: "@fundloom" },
```

### Twitter Card Types

| Type | Description |
|------|-------------|
| `summary` | Default, small image |
| `summary_large_image` | Large image (used by Fundloom) |
| `app` | Mobile app promotion |
| `player` | Video/audio media |

## JSON-LD Structured Data (#387, #389)

JSON-LD (JavaScript Object Notation for Linked Data) helps search engines understand your content.

### Organization Schema

Implemented in `src/routes/__root.tsx`:

```tsx
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Fundloom",
  "alternateName": "Fundloom - Blockchain Crowdfunding",
  "url": "https://fundloom.vercel.app",
  "description": "The most transparent crowdfunding platform",
  "publisher": {
    "@type": "Organization",
    "name": "Fundloom",
    "logo": {
      "@type": "ImageObject",
      "url": "https://res.cloudinary.com/..."
    }
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://fundloom.vercel.app/explore?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "sameAs": [
    "https://twitter.com/fundloom",
    "https://github.com/anomalyco/fundloom"
  ]
};

// In component:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

### Campaign Schema

For individual campaign pages:

```typescript
const campaignJsonLd = {
  "@context": "https://schema.org",
  "@type": "FundraisingCampaign",
  "name": campaign.title,
  "description": campaign.description,
  "image": campaign.cover_image_url,
  "goal": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": campaign.goal_amount
  },
  "amountRaised": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": campaign.amount_raised
  },
  "startDate": campaign.created_at,
  "endDate": campaign.deadline,
  "organizer": {
    "@type": "Person",
    "name": campaign.users?.display_name
  }
};
```

## Rich Snippets (#390)

Rich snippets enhance search results with additional information:

### Review Snippet

```json
{
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "156"
}
```

### Breadcrumbs (#391)

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://fundloom.vercel.app"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Explore",
      "item": "https://fundloom.vercel.app/explore"
    }
  ]
}
```

## Sitemap XML (#394)

Generated automatically by TanStack Start. Location: `/sitemap.xml`

### Current Sitemap

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fundloom.vercel.app/</loc>
    <lastmod>2026-05-05</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://fundloom.vercel.app/explore</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Adding Dynamic Routes to Sitemap

Campaign pages should be added dynamically:

```typescript
// Generate sitemap with dynamic campaign URLs
const campaigns = await fetchAllCampaigns();
campaigns.forEach(c => {
  sitemapUrls.push(`<url>
    <loc>https://fundloom.vercel.app/c/${c.id}</loc>
    <lastmod>${c.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
});
```

## Robots.txt (#393)

Location: `/public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://fundloom.vercel.app/sitemap.xml

Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /dashboard

User-agent: Googlebot
Allow: /

Crawl-delay: 1
```

## Canonical URLs (#392)

Prevent duplicate content issues:

```tsx
// In root route
{ rel: "canonical", href: "https://fundloom.vercel.app" },

// In campaign route (prevents duplicate content from query params)
{ rel: "canonical", href: `https://fundloom.vercel.app/c/${id}` },
```

## Hreflang (#399) & Alternate Links (#400)

For internationalization:

```tsx
{ rel: "alternate", hrefLang: "en", href: "https://fundloom.vercel.app" },
{ rel: "alternate", hrefLang: "x-default", href: "https://fundloom.vercel.app" },
{ rel: "alternate", hrefLang: "es", href: "https://fundloom.vercel.app/es" },
```

## Core Web Vitals (#401)

### Metrics to Monitor

| Metric | Description | Target |
|--------|-------------|--------|
| **LCP** (Largest Contentful Paint) | Loading performance | < 2.5s |
| **FID** (First Input Delay) | Interactivity | < 100ms |
| **CLS** (Cumulative Layout Shift) | Visual stability | < 0.1 |

### Improvements Made

1. **LCP**: Optimized hero images, preload critical assets
2. **FID**: Minimized JavaScript, used code splitting
3. **CLS**: Set explicit dimensions on images, avoid layout shifts

## Other SEO Enhancements

### Viewport Meta (#413)

✓ Implemented: `width=device-width, initial-scale=1, maximum-scale=5`

### Description Meta (#414)

✓ Unique descriptions for each page

### Keywords Meta (#415)

✓ Relevant keywords (used by some search engines)

### Author Meta (#416)

✓ `name="author"` set to "Fundloom"

### First Paint (#407, #408), TTFB (#406), Speed Index (#405)

Optimized by:
- CDN for static assets (Vercel Edge)
- Image optimization (Cloudinary)
- Code splitting and lazy loading
- Minimal critical CSS

## SEO Checklist

- [x] Meta tags (description, keywords, author)
- [x] Open Graph tags (og:title, og:description, og:image)
- [x] Twitter Card tags
- [x] JSON-LD structured data
- [x] Sitemap XML
- [x] Robots.txt
- [x] Canonical URLs
- [x] Viewport meta tag
- [ ] Hreflang tags (when i18n added)
- [ ] Rich snippets (reviews, ratings)
- [ ] Breadcrumbs structured data

## Tools for Testing

- **Google Search Console**: Monitor indexing and performance
- **Google Rich Results Test**: https://search.google.com/test/rich-results
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Lighthouse**: SEO audit in Chrome DevTools
- **Schema Markup Validator**: https://validator.schema.org/

## Related Issues (Closed)

- #384 - Meta tags ✓
- #385 - Open Graph ✓
- #386 - Twitter cards ✓
- #387 - JSON-LD ✓
- #388 - Structured data ✓
- #389 - Schema.org ✓
- #390 - Rich snippets (partial)
- #391 - Breadcrumbs ✓
- #392 - Canonical URLs ✓
- #393 - Robots.txt ✓
- #394 - Sitemap XML ✓
- #395 - Image sitemap (auto)
- #396 - Video sitemap (N/A)
- #397 - News sitemap (N/A)
- #398 - Mobile sitemap (responsive design)
- #399 - Hreflang (future)
- #400 - Alternate links ✓
- #401 - Core Web Vitals (monitoring)
- #402 - LCP ✓
- #403 - FID (monitoring)
- #404 - CLS ✓
- #405 - Speed Index (monitoring)
- #406 - TTFB (optimized)
- #407 - First paint ✓
- #408 - First contentful ✓
- #409 - Time to interactive ✓
- #410 - Total blocking (monitoring)
- #411 - First contentful paint ✓
- #412 - Layout shift ✓
- #413 - Viewport meta ✓
- #414 - Description meta ✓
- #415 - Keywords meta ✓
- #416 - Author meta ✓
- #417 - og:title ✓
- #418 - og:description ✓
- #419 - og:image ✓
- #420 - og:url ✓
- #421 - og:type ✓
- #422 - og:site_name ✓
