# Brand Assets

Last updated: May 2026

## Brand Overview

Fundloom is a blockchain-powered donation platform that brings trust and transparency to charitable giving. Our brand communicates:

- **Trust**: Secure, transparent, reliable
- **Innovation**: Modern blockchain technology
- **Compassion**: Human-centered charitable giving
- **Clarity**: Clean, editorial design aesthetic

## Brand Assets Inventory

### Primary Assets

| Asset | Location | Format | Usage |
|-------|----------|--------|-------|
| **Logo (Primary)** | Cloudinary | PNG | Headers, footers, business cards |
| **Favicon** | `/public/favicon.png` | PNG | Browser tabs, bookmarks |
| **Logo (OG/Twitter)** | Cloudinary | PNG | Social media shares |

### Logo URL

```
https://res.cloudinary.com/dv0tt80vn/image/upload/v1777382546/fundloom_Logo_nlovd8.png
```

## Typography

### Primary Typeface: Inter

- **Usage**: Body text, UI elements, forms, navigation
- **Weights**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **License**: Open-source (SIL Open Font License)
- **Where to get**: https://fonts.google.com/specimen/Inter or https://github.com/rsms/inter

```css
font-family: 'Inter', ui-sans-serif, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

### Display Typeface: Fraunces

- **Usage**: Headings, hero sections, marketing materials
- **Weights**: 400 (Regular), 500, 600, 700
- **Style**: Serif with editorial, warm feel
- **License**: Open-source (SIL Open Font License)
- **Where to get**: https://fonts.google.com/specimen/Fraunces

```css
font-family: 'Fraunces', ui-serif, Georgia, serif;
```

### Monospace Typeface: JetBrains Mono

- **Usage**: Code snippets, wallet addresses, transaction hashes
- **Weights**: 400 (Regular), 500, 700
- **License**: Open-source (Apache 2.0)
- **Where to get**: https://fonts.google.com/specimen/JetBrains+Mono

```css
font-family: 'JetBrains Mono', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;
```

## Color Palette

### Primary Brand Colors

| Color | OKLCH Value | Hex (Approximate) | Usage |
|-------|-------------|-------------------|-------|
| **Canvas** | `oklch(0.972 0.012 80)` | `#F7F5F2` | Page backgrounds |
| **Ink** | `oklch(0.205 0.018 60)` | `#2D2926` | Primary text, dark elements |
| **Forest** | `oklch(0.42 0.07 145)` | `#3D8B60` | Accent, success states |
| **Forest Soft** | `oklch(0.92 0.04 145)` | `#D6EDE0` | Accent backgrounds |

### Extended Palette

| Color | OKLCH Value | Usage |
|-------|-------------|-------|
| **Paper** | `oklch(0.985 0.008 80)` | Card surfaces |
| **Ink Soft** | `oklch(0.42 0.015 60)` | Secondary text |
| **Line** | `oklch(0.88 0.012 75)` | Borders, dividers |
| **Destructive** | `oklch(0.55 0.18 25)` | Error states (light mode) |

See [colors.md](./colors.md) for complete color documentation.

## Imagery & Photography

### Style Guidelines

- **Tone**: Warm, human-centered, optimistic
- **Subjects**: People helping people, technology with human touch, transparency/trust visuals
- **Color treatment**: Should work with our warm off-white (Canvas) and ink (Ink) palette
- **Filters**: Minimal; prefer natural lighting and authentic moments

### Image Specifications

| Type | Dimensions | Format | Max Size |
|------|------------|--------|----------|
| **Hero Images** | 1920x1080px (16:9) | WebP, JPG | 500KB |
| **Campaign Cards** | 800x600px (4:3) | WebP, JPG | 300KB |
| **Thumbnails** | 400x400px (1:1) | WebP, JPG | 150KB |
| **Icons/Graphics** | SVG preferred | SVG, PNG | 50KB |

### Image Hosting

Fundloom uses **Cloudinary** for image hosting and optimization:

```
https://res.cloudinary.com/dv0tt80vn/
```

Example transformation (resize to 800px width):
```
https://res.cloudinary.com/dv0tt80vn/image/upload/w_800,campaign-image.jpg
```

## Voice & Tone

### Brand Voice

- **Clear**: Simple language, no jargon
- **Trustworthy**: Transparent, honest communication
- **Compassionate**: Empathetic, human-centered
- **Innovative**: Forward-thinking, modern

### Writing Guidelines

**Do's:**
- Use active voice
- Be concise and direct
- Write at an 8th-grade reading level
- Use "you" and "your" to address users
- Include numbers and data for transparency

**Don'ts:**
- Avoid buzzwords ("synergy", "leverage", "disrupt")
- Don't use overly technical blockchain jargon
- Avoid passive voice
- Don't make promises we can't keep

### Examples

| Context | Good | Avoid |
|---------|------|-------|
| Headline | "Support transparent causes" | "Leverage blockchain for synergy" |
| Error | "Please enter a valid amount" | "Invalid input detected" |
| Success | "Your donation was successful!" | "Transaction completed successfully" |
| Call to Action | "Start a campaign" | "Initiate campaign creation process" |

## Iconography

See [icons.md](./icons.md) for complete icon documentation.

**Icon Library**: Lucide React
**Style**: 24x24 viewBox, 2px stroke width, rounded ends
**Custom icons**: Avoid unless absolutely necessary; maintain consistency

## Spacing & Layout

### Border Radius Scale

Based on `--radius: 0.875rem` (14px) in our design system:

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 10px | Small elements, badges |
| `radius-md` | 12px | Buttons, inputs |
| `radius-lg` | 14px | Cards, modals |
| `radius-xl` | 18px | Large cards, hero sections |
| `radius-2xl` | 22px | Extra large elements |

### Spacing Scale

Use Tailwind's spacing scale (4px base unit):

| Size | Value | Usage |
|------|-------|-------|
| 1 | 4px | Tight spacing, inline elements |
| 2 | 8px | Default spacing between related items |
| 4 | 16px | Padding within cards, spacing between sections |
| 6 | 24px | Section padding |
| 8 | 32px | Large section spacing |
| 12 | 48px | Hero section padding |
| 16 | 64px | Major layout spacing |

## Animation & Motion

### Principles

- **Subtle**: Animations should enhance, not distract
- **Fast**: 150-300ms duration for UI interactions
- **Natural**: Use easing curves that feel organic

### Animation Classes

From `tw-animate-css` (already imported):

```tsx
// Fade in
<div className="animate-in fade-in duration-300">

// Slide in from bottom
<div className="animate-in slide-in-from-bottom-4 duration-500">

// Scale up
<div className="animate-in zoom-in-95 duration-200">
```

See [animations.md](./animations.md) for complete animation documentation.

## Partner & Sponsor Logos

### Logo Requirements

- **Format**: PNG with transparent background or SVG
- **Size**: Maximum 4MB
- **Dimensions**: Recommended 200x80px (will be displayed at ~120px height)
- **Quality**: High resolution, crisp on retina displays

### Partner Logo Usage

Partner logos are displayed in a scrolling marquee on the homepage. They should:

- Not be altered (no recoloring, stretching, or effects)
- Link to the partner's website when clicked
- Be uploaded via the admin panel (`/admin/partners`)

### Managing Partner Logos

```tsx
// Upload partner logo
const res = await uploadPartnerLogo({ data: file });

// Partner logo in database
type Partner = {
  id: string;
  name: string;
  url: string | null;
  logo_url: string | null;
  display_order: number;
};
```

## File Formats & Export

### When to Use Each Format

| Format | Use Case | Notes |
|--------|----------|-------|
| **SVG** | Icons, logos, simple graphics | Scalable, small file size, preferred |
| **PNG** | Logos with transparency, screenshots | Use for logos, avoid for photos |
| **WebP** | Photos, complex images | 25-35% smaller than JPG, modern browsers |
| **JPG** | Photos only | Use only when WebP not possible |
| **GIF** | Simple animations | Avoid; use video or WebP animation instead |

### Export Checklist

Before exporting assets:

- [ ] Correct color space (sRGB for web)
- [ ] Appropriate resolution (2x for retina displays)
- [ ] Optimized file size (run through compressor)
- [ ] Proper naming convention (lowercase, hyphens)
- [ ] Transparent background where needed (PNG/WebP)

## Brand Asset Requests

To request official brand assets (SVG logo, high-res files, brand guidelines PDF):

1. **GitHub Issue**: Create an issue at https://github.com/anomalyco/fundloom/issues
2. **Email**: Contact the team via the website contact form
3. **Direct Request**: For partners, contact via admin email

## Asset Storage

### Project Assets

```
/public/
  favicon.png           # Browser favicon
  /images/              # Static images (if any)
```

### Cloudinary Assets

```
https://res.cloudinary.com/dv0tt80vn/
  /image/upload/
    fundloom_Logo_nlovd8.png
    /campaigns/         # Campaign images
    /partners/          # Partner logos
    /avatars/           # User avatars
```

## Do's and Don'ts

### Do's ✅

- Use official brand colors from the design system
- Maintain clear space around the logo
- Use Inter and Fraunces fonts for consistency
- Optimize all images before uploading
- Link partner logos to their respective websites

### Don'ts ❌

- Don't modify the logo (recolor, stretch, add effects)
- Don't use system fonts instead of Inter/Fraunces
- Don't use pure black (#000) or pure white (#FFF)
- Don't use more than 2-3 font weights in one design
- Don't use stock photos that look generic or inauthentic

## Brand Consistency Checklist

When creating new pages or marketing materials:

- [ ] Using approved brand colors (OKLCH values from `styles.css`)
- [ ] Using Inter (body) and Fraunces (headings) fonts
- [ ] Logo is correctly placed with proper clear space
- [ ] Images are optimized and relevant
- [ ] Voice and tone match brand guidelines
- [ ] Icons are from Lucide React library
- [ ] Border radius matches design system (`--radius: 0.875rem`)
- [ ] Animations are subtle and fast (150-300ms)

## Brand Evolution

As Fundloom grows, the brand may evolve. Any major brand changes should:

1. Be discussed with the core team
2. Be documented in a new version of this file
3. Include migration guidelines for existing assets
4. Be communicated to partners and users

## Future Enhancements

- Create a brand kit ZIP file with all assets
- Develop a brand compliance checker tool
- Add brand asset templates for partners
- Create social media templates with brand styling
- Build a brand asset CDN with automatic optimization
- Develop brand guidelines in multiple languages
