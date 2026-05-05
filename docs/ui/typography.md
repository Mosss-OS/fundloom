# Typography

Last updated: April 2026

## Type Scale

Fundloom uses a modular scale for typography to ensure visual harmony and readability. Our type scale is based on a 1.25 ratio (minor third) for a balanced, professional feel.

### Font Sizes

| Size | Value | Usage |
|------|-------|-------|
| **xs** | 0.75rem (12px) | Helper text, captions, footnotes |
| **sm** | 0.875rem (14px) | Small text, form helper text |
| **base** | 1rem (16px) | Body text, paragraph, default |
| **lg** | 1.125rem (18px) | Small headings, subheadings |
| **xl** | 1.25rem (20px) | Medium headings |
| **2xl** | 1.5rem (24px) | Large headings, section titles |
| **3xl** | 1.875rem (30px) | Page titles, major headings |
| **4xl** | 2.25rem (36px) | Hero sections, large banners |
| **5xl** | 3rem (48px) | Major headlines, marketing sections |
| **6xl** | 3.75rem (60px) | Ultra-large display text |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| **Thin** | 100 | Rarely used, for special effects |
| **ExtraLight** | 200 | Rarely used |
| **Light** | 300 | Light text, secondary information |
| **Normal** | 400 | Body text, primary content |
| **Medium** | 500 | Sub-headings, UI controls |
| **SemiBold** | 600 | Strong emphasis, buttons |
| **Bold** | 700 | Headings, strong emphasis |
| **ExtraBold** | 800 | Prominent headings, calls to action |
| **Black** | 900 | Maximum emphasis, logos |

## Font Families

### Primary Font
**Inter** - A highly legible, open-source sans-serif font designed for computer interfaces.
- Why Inter: Excellent readability on screens, great for both UI and content, open-source, extensive language support
- Weights used: 400, 500, 600, 700

### Secondary Font (for accents)
**Space Grotesk** - A geometric sans-serif for headings and special elements
- Why Space Grotesk: Modern, clean appearance that pairs well with Inter
- Used sparingly for: Logos, marketing headlines, special UI elements
- Weights used: 500, 600, 700

### Monospace Font
**JetBrains Mono** - For code snippets, technical content, and wallet addresses
- Why JetBrains Mono: Excellent readability for code, distinct characters, ligatures for programming
- Used in: Code blocks, transaction hashes, contract addresses, code snippets

## Line Heights & Letter Spacing

### Line Heights
- **Tight**: 1.25 (for headings, compact elements)
- **Normal**: 1.5 (body text, paragraphs)
- **Relaxed**: 1.75 (long-form content, improved readability)
- **Loose**: 2.0 (special formatting, poetry, etc.)

### Letter Spacing (Tracking)
- **Tighter**: -0.025em (headings, uppercase text)
- **Normal**: 0 (body text, most content)
- **Wide**: 0.05em (uppercase text, letter-spacing for emphasis)
- **Wider**: 0.1em (special effects, logos)

## Text Styles

### Headings
```css
/* Example: Heading 1 (h1) */
font-family: 'Inter', sans-serif;
font-weight: 700;
font-size: 3rem; /* 5xl */
line-height: 1.2;
letter-spacing: -0.025em;

/* Example: Heading 2 (h2) */
font-family: 'Inter', sans-serif;
font-weight: 600;
font-size: 2.25rem; /* 4xl */
line-height: 1.25;
letter-spacing: -0.02em;
```

### Body Text
```css
/* Example: Base body text */
font-family: 'Inter', sans-serif;
font-weight: 400;
font-size: 1rem; /* base */
line-height: 1.5;
color: var(--text-primary);

/* Example: Lead paragraph (slightly larger) */
font-family: 'Inter', sans-serif;
font-weight: 400;
font-size: 1.125rem; /* lg */
line-height: 1.6;
color: var(--text-primary);
```

### Utility Classes (Tailwind-inspired)
We provide utility classes for consistent typography:

```
.text-xs    { font-size: 0.75rem; line-height: 1rem; }
.text-sm    { font-size: 0.875rem; line-height: 1.25rem; }
.text-base  { font-size: 1rem; line-height: 1.5rem; }
.text-lg    { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl    { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl   { font-size: 1.5rem; line-height: 2rem; }
.text-3xl   { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl   { font-size: 2.25rem; line-height: 2.5rem; }
.text-5xl   { font-size: 3rem; line-height: 1; }
.text-6xl   { font-size: 3.75rem; line-height: 1; }

.font-thin    { font-weight: 100; }
.font-extralight { font-weight: 200; }
.font-light   { font-weight: 300; }
.font-normal  { font-weight: 400; }
.font-medium  { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold    { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-black   { font-weight: 900; }
```

## Responsive Typography

Typography scales appropriately across different viewport sizes:

### Base Scale (mobile)
All base font sizes as defined above

### Tablet (min-width: 768px)
- Increase heading sizes by ~10%
- Increase body text slightly for better readability on larger screens

### Desktop (min-width: 1024px)
- Further increase heading sizes for impact
- Consider slightly larger body text for long-form reading

### Large Desktop (min-width: 1440px)
- Maximum heading sizes for immersive experiences
- Body text optimized for long reading sessions

## Usage Guidelines

### Hierarchy & Emphasis
1. Use size and weight to establish visual hierarchy
2. Headings should be clearly distinguishable from body text
3. Important information can be emphasized with weight rather than just size
4. Avoid using all caps for body text (reduces readability)
5. Use italics sparingly for emphasis or special text (quotes, technical terms)

### Readability Best Practices
- Maintain sufficient contrast between text and background
- Avoid long paragraphs of centered or justified text
- Limit line length to 45-75 characters for optimal reading
- Provide adequate whitespace around text blocks
- Use hierarchy to guide the eye through content

### Special Text Types
- **Captions**: Use text-xs or text-sm, often muted colors
- **Labels**: Typically text-sm or text-base, medium or regular weight
- **Placeholders**: Lighter color, same size as input
- **Error/Success Text**: text-sm, appropriate semantic colors
- **Timestamps**: text-xs or text-sm, muted color
- **Code Blocks**: JetBrains Mono, text-sm or text-base, background contrast

## Implementation

### CSS Custom Properties
We define our typography scale as CSS variables for easy access:
```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
--font-serif: 'Georgia', 'Times New Roman', Times, serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;

--font-weight-thin: 100;
--font-weight-extralight: 200;
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
--font-weight-black: 900;

--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 1.875rem;
--font-size-4xl: 2.25rem;
--font-size-5xl: 3rem;
--font-size-6xl: 3.75rem;

--font-line-height-tight: 1.2;
--font-line-height-normal: 1.5;
--font-line-height-relaxed: 1.75;
--font-line-height-loose: 2.0;
```

### Usage in Components
```typescript
import { twMerge } from "tailwind-merge";
import { cva, type VariantProps } from "class-variance-authority";

const headingVariants = cva(
  "font-heading text-text-primary",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
        "3xl": "text-3xl",
        "4xl": "text-4xl",
        "5xl": "text-5xl",
        "6xl": "text-6xl",
      },
      weight: {
        thin: "font-thin",
        extralight: "font-extralight",
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
        extrabold: "font-extrabold",
        black: "font-black",
      },
    },
    defaultVariants: {
      size: "base",
      weight: "normal",
    },
  }
);

// Usage:
// <h1 className={twMerge(headingVariants({ size: "5xl", weight: "bold" }))}>
//   Main Title
// </h1>
```

## Internationalization Considerations

- Our font choices support extensive Unicode coverage for major world languages
- We test with:
  - Latin-based languages (English, Spanish, French, German, etc.)
  - Cyrillic (Russian, Ukrainian, etc.)
  - Greek
  - Arabic (with special attention to shaping and bidirectional text)
  - Hebrew (bidirectional text)
  - Chinese, Japanese, Korean (CJK)
  - Thai, Vietnamese, and other Southeast Asian scripts
- Line heights and spacing accommodate different script requirements
- We avoid fixed heights that might clip ascenders/descenders in various scripts

## Accessibility Considerations

- Text can be resized up to 200% without loss of content or functionality
- Sufficient contrast ratios maintained at all text sizes
- Avoid using text presentation alone to convey information
- Respect user's preferred font settings when possible
- Ensure text spacing (letter-spacing, word-spacing, line-height) can be adjusted
- Avoid text that relies solely on color for meaning

## Future Enhancements

- Implement a design token system for typography
- Create a typography scale generator for consistent sizing
- Develop variable font support for finer weight control
- Add support for optical sizes (different designs for different sizes)
- Create typography utilities for text balancing and hyphenation
- Develop a typography testing suite for visual regression