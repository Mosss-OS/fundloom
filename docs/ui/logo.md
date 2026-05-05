# Logo

Last updated: May 2026

## Fundloom Logo

The Fundloom logo is the primary visual identifier for the platform. It represents trust, transparency, and the modern approach to charitable giving through blockchain technology.

### Logo URL

The official Fundloom logo is hosted on Cloudinary:

```
https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png
```

### Logo Usage in Code

The logo is referenced in `src/routes/__root.tsx` for meta tags and branding:

```tsx
// Open Graph (Facebook, LinkedIn, etc.)
meta: [
  {
    property: "og:image",
    content: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
  },
  // Twitter Card
  {
    name: "twitter:image",
    content: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
  },
  // Favicon
  {
    rel: "icon",
    type: "image/png",
    href: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
  },
  // Apple Touch Icon
  {
    rel: "apple-touch-icon",
    href: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
  },
]
```

## Logo Specifications

### Clear Space

Maintain clear space around the logo equal to the height of the "F" in the logo mark:

```
┌─────────────────┐
│                 │ ← Clear space (1x logo height)
│   [LOGO HERE]   │
│                 │ ← Clear space (1x logo height)
└─────────────────┘
← Clear space →
  (1x logo width)
```

### Minimum Size

- **Digital**: 24px height (minimum for readability)
- **Print**: 0.5 inches / 12.7mm height
- **Favicon**: 32x32px, 16x16px

### Maximum Size

- No strict maximum, but ensure the logo remains proportionally sized
- For hero sections, don't exceed 400px width unless specifically designed

## Logo Variations

### Primary Logo (Default)

The full-color logo on light backgrounds:

```tsx
<img
  src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png"
  alt="Fundloom"
  className="h-8 w-auto" // Adjust size as needed
/>
```

### Logo on Dark Backgrounds

When using the logo on dark backgrounds, ensure sufficient contrast. The current logo should work on:
- Dark blue backgrounds (`oklch(0.129 0.042 264.695)`)
- Pure black backgrounds
- Dark gray backgrounds

```tsx
// Logo on dark background
<div className="bg-background-dark p-6">
  <img
    src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png"
    alt="Fundloom"
    className="h-8 w-auto brightness-0 invert" // Inverts colors for dark bg
  />
</div>
```

## Implementation

### In Header/Navigation

```tsx
// src/components/SiteHeader.tsx
import { Link } from "@tanstack/react-router";

function SiteHeader() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png"
            alt="Fundloom"
            className="h-8 w-auto"
          />
        </Link>
        {/* Rest of header */}
      </div>
    </header>
  );
}
```

### In Footer

```tsx
function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <div className="container">
        <img
          src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png"
          alt="Fundloom"
          className="h-6 w-auto opacity-80"
        />
        {/* Footer content */}
      </div>
    </footer>
  );
}
```

### In Auth Screens

```tsx
// src/routes/login.tsx
function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <img
        src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png"
        alt="Fundloom"
        className="mb-8 h-12 w-auto"
      />
      {/* Login form */}
    </div>
  );
}
```

## Favicon

The favicon is set in `src/routes/__root.tsx`:

```tsx
export const Route = createFileRoute("/")({
  meta: () => [
    {
      rel: "icon",
      type: "image/png",
      href: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
    },
  ],
});
```

There's also a local favicon at `/public/favicon.png` for fallback.

## Partner Logos

Fundloom supports partner/sponsor logos displayed on the landing page marquee.

### Partner Logo Guidelines

- **Format**: PNG or SVG preferred
- **Size**: Maximum 4MB
- **Dimensions**: Recommended 200x80px or proportional
- **Background**: Transparent preferred
- **Quality**: High resolution for crisp display

### Partner Logo Upload

Partner logos are managed in the admin panel (`/admin/partners`):

```tsx
// src/routes/admin.partners.tsx
import { uploadPartnerLogo } from "@/server/partners.functions";

// Upload handler
const handleLogoUpload = async (file: File) => {
  if (file.size > 4 * 1024 * 1024) {
    toast.error("Logo must be under 4MB");
    return;
  }

  const res = await uploadPartnerLogo({ data: file });
  setLogoUrl(res.url);
  toast.success("Logo uploaded");
};
```

### Displaying Partner Logos

Partner logos are displayed in a scrolling marquee on the homepage:

```tsx
// src/routes/index.tsx
<div className="marquee-container">
  {partners.map((p) => (
    <div key={p.id} className="marquee-item">
      {p.logo_url ? (
        <img
          src={p.logo_url}
          alt={p.name}
          className="h-12 w-auto object-contain"
        />
      ) : (
        <span className="text-sm text-ink-soft">{p.name}</span>
      )}
    </div>
  ))}
</div>
```

## Logo Do's and Don'ts

### Do's ✅

- Use the official logo URL or local file
- Maintain the logo's proportions (don't stretch or squash)
- Provide sufficient clear space around the logo
- Use alt text when using `<img>` tags: `alt="Fundloom"`
- Ensure the logo is links to the homepage when used in headers
- Keep logo file size optimized (use the Cloudinary URL with appropriate transformations)

### Don'ts ❌

- Don't change the logo colors unless absolutely necessary
- Don't rotate or skew the logo
- Don't add drop shadows, outlines, or effects
- Don't use the logo as a background element
- Don't place the logo on busy backgrounds without a solid background container
- Don't use low-resolution versions that appear pixelated
- Don't modify the logo typography or icon

## Social Media & SEO

### Open Graph (Facebook, LinkedIn)

```tsx
{
  property: "og:image",
  content: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
}
```

### Twitter Card

```tsx
{
  name: "twitter:image",
  content: "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png",
}
```

### Schema.org Structured Data

```tsx
{
  name: "publisher",
  content: JSON.stringify({
    "@type": "Organization",
    "name": "Fundloom",
    "logo": {
      "@type": "ImageObject",
      "url": "https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png"
    }
  })
}
```

## Responsive Logo Sizing

Use Tailwind classes for responsive logo sizing:

```tsx
// Responsive example
<img
  src="https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png"
  alt="Fundloom"
  className="h-6 w-auto md:h-8 lg:h-10" // Smaller on mobile, larger on desktop
/>
```

## Cloudinary Transformations

Since the logo is hosted on Cloudinary, you can apply transformations if needed:

```tsx
// Resize to 200px width
`https://res.cloudinary.com/dv0tt80vn/image/upload/w_200/v1777382546/fundloom_Logo_nlovd8.png`

// Convert to webp format
`https://res.cloudinary.com/dv0tt80vn/image/upload/f_webp/v1777382546/fundloom_Logo_nlovd8.png`

// Add quality auto
`https://res.cloudinary.com/dv0tt80vn/image/upload/q_auto/v1777382546/fundloom_Logo_nlovd8.png`
```

## Download Links

- **PNG (Original)**: [fundloom_Logo_nlovd8.png](https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png)
- **Favicon**: `/public/favicon.png` (local copy)

## Brand Assets Request

To request additional logo formats (SVG, EPS, AI) or brand guidelines, contact the Fundloom team via:

- GitHub Issues: https://github.com/anomalyco/fundloom/issues
- Email: Contact form on website

## Logo Update Procedure

If the logo needs to be updated:

1. Upload new logo to Cloudinary
2. Update the URL in `src/routes/__root.tsx`
3. Replace `/public/favicon.png` with new version
4. Test all logo instances across the site
5. Update this documentation
6. Clear CDN caches if applicable

## Future Enhancements

- Create SVG version of the logo for better scaling
- Develop dark mode specific logo variant
- Add animated logo version for loading states
- Create logo usage playground in Storybook
- Develop automated logo contrast checker
- Add支持 for multiple logo orientations (horizontal, vertical, icon-only)
