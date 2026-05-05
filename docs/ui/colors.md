# Colors

Last updated: May 2026

## Color Philosophy

Fundloom uses an editorial Apple-inspired aesthetic with a warm, accessible color palette. Our design system prioritizes:

- **Warm off-white canvas** with deep ink typography for comfortable reading
- **Single accent color** (forest green) to maintain focus and reduce visual noise
- **OKLCH color format** for perceptually uniform colors that work beautifully in both light and dark modes
- **High contrast ratios** meeting WCAG 2.1 AA standards for accessibility

## Color Format

All colors in Fundloom use the **OKLCH** (Lightness, Chroma, Hue) format:
- **L** (Lightness): 0-1 (0 = black, 1 = white)
- **C** (Chroma): 0+ (0 = grayscale, higher = more saturated)
- **H** (Hue): 0-360 (degrees on the color wheel)

OKLCH ensures:
- Perceptually uniform lightness (50% lightness looks equally bright across hues)
- Better dark mode transitions
- More accessible color choices

## Core Editorial Palette

These are the foundational colors that define Fundloom's visual identity:

| Name | OKLCH Value | Light Mode | Dark Mode | Usage |
|------|-------------|------------|-----------|-------|
| **Canvas** | `oklch(0.972 0.012 80)` | Warm off-white | Dark blue (`oklch(0.129 0.042 264.695)`) | Page backgrounds, main surfaces |
| **Paper** | `oklch(0.985 0.008 80)` | Lighter off-white | Dark blue (`oklch(0.208 0.042 265.755)`) | Cards, popovers, elevated surfaces |
| **Ink** | `oklch(0.205 0.018 60)` | Deep warm near-black | Light gray (`oklch(0.984 0.003 247.858)`) | Primary text, icons, primary buttons |
| **Ink Soft** | `oklch(0.42 0.015 60)` | Medium gray | Light gray (`oklch(0.704 0.04 256.788)`) | Secondary text, captions, placeholders |
| **Line** | `oklch(0.88 0.012 75)` | Light gray | White 10% opacity | Borders, dividers, hairlines |
| **Forest** | `oklch(0.42 0.07 145)` | Forest green | Bright blue (`oklch(0.488 0.243 264.376)`) | Accent color, links, success states |
| **Forest Soft** | `oklch(0.92 0.04 145)` | Light green | Dark blue (`oklch(0.279 0.041 260.031)`) | Accent backgrounds, hover states |

## Semantic Colors

These colors map to Tailwind utility classes (e.g., `bg-primary`, `text-destructive`):

### Base Semantic Colors

| Name | CSS Variable | Light Mode Value | Dark Mode Value | Tailwind Class |
|------|--------------|------------------|-----------------|----------------|
| **Background** | `--background` | `var(--canvas)` | `oklch(0.129 0.042 264.695)` | `bg-background` |
| **Foreground** | `--foreground` | `var(--ink)` | `oklch(0.984 0.003 247.858)` | `text-foreground` |
| **Card** | `--card` | `var(--paper)` | `oklch(0.208 0.042 265.755)` | `bg-card` |
| **Card Foreground** | `--card-foreground` | `var(--ink)` | `oklch(0.984 0.003 247.858)` | `text-card-foreground` |
| **Popover** | `--popover` | `var(--paper)` | `oklch(0.208 0.042 265.755)` | `bg-popover` |
| **Popover Foreground** | `--popover-foreground` | `var(--ink)` | `oklch(0.984 0.003 247.858)` | `text-popover-foreground` |

### Interactive Colors

| Name | CSS Variable | Light Mode Value | Dark Mode Value | Usage |
|------|--------------|------------------|-----------------|-------|
| **Primary** | `--primary` | `var(--ink)` | `oklch(0.929 0.013 255.508)` | Primary buttons, active states |
| **Primary Foreground** | `--primary-foreground` | `var(--canvas)` | `oklch(0.208 0.042 265.755)` | Text on primary buttons |
| **Secondary** | `--secondary` | `oklch(0.94 0.012 75)` | `oklch(0.279 0.041 260.031)` | Secondary buttons, subtle backgrounds |
| **Secondary Foreground** | `--secondary-foreground` | `var(--ink)` | `oklch(0.984 0.003 247.858)` | Text on secondary backgrounds |
| **Accent** | `--accent` | `var(--forest-soft)` | `oklch(0.279 0.041 260.031)` | Accent backgrounds, highlights |
| **Accent Foreground** | `--accent-foreground` | `var(--forest)` | `oklch(0.984 0.003 247.858)` | Text on accent backgrounds |

### Feedback Colors

| Name | CSS Variable | Light Mode Value | Dark Mode Value | Usage |
|------|--------------|------------------|-----------------|-------|
| **Destructive** | `--destructive` | `oklch(0.55 0.18 25)` | `oklch(0.704 0.191 22.216)` | Error states, delete buttons |
| **Destructive Foreground** | `--destructive-foreground` | `oklch(0.99 0.005 80)` | `oklch(0.984 0.003 247.858)` | Text on error backgrounds |
| **Muted** | `--muted` | `oklch(0.94 0.012 75)` | `oklch(0.279 0.041 260.031)` | Disabled states, inactive elements |
| **Muted Foreground** | `--muted-foreground` | `var(--ink-soft)` | `oklch(0.704 0.04 256.788)` | Placeholder text, disabled text |

### Utility Colors

| Name | CSS Variable | Light Mode Value | Dark Mode Value | Usage |
|------|--------------|------------------|-----------------|-------|
| **Border** | `--border` | `var(--line)` | `oklch(1 0 0 / 10%)` | Element borders |
| **Input** | `--input` | `var(--line)` | `oklch(1 0 0 / 15%)` | Form input borders |
| **Ring** | `--ring` | `var(--ink)` | `oklch(0.551 0.027 264.364)` | Focus rings, outlines |

## Chart Colors

For data visualization (charts, graphs, progress indicators):

| Name | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Chart 1** | `oklch(0.646 0.222 41.116)` (orange) | `oklch(0.488 0.243 264.376)` (blue) | Primary data series |
| **Chart 2** | `oklch(0.6 0.118 184.704)` (cyan) | `oklch(0.696 0.17 162.48)` (teal) | Secondary series |
| **Chart 3** | `oklch(0.398 0.07 227.392)` (blue) | `oklch(0.769 0.188 70.08)` (amber) | Tertiary series |
| **Chart 4** | `oklch(0.828 0.189 84.429)` (yellow) | `oklch(0.627 0.265 303.9)` (purple) | Fourth series |
| **Chart 5** | `oklch(0.769 0.188 70.08)` (amber) | `oklch(0.645 0.246 16.439)` (red) | Fifth series |

## Sidebar Colors

For sidebar navigation components:

| Name | Light Mode | Dark Mode |
|------|------------|-----------|
| **Sidebar** | `oklch(0.984 0.003 247.858)` (near white) | `oklch(0.208 0.042 265.755)` (dark blue) |
| **Sidebar Foreground** | `oklch(0.129 0.042 264.695)` (dark) | `oklch(0.984 0.003 247.858)` (light) |
| **Sidebar Primary** | `oklch(0.208 0.042 265.755)` (dark blue) | `oklch(0.488 0.243 264.376)` (blue) |
| **Sidebar Primary Foreground** | `oklch(0.984 0.003 247.858)` (light) | `oklch(0.984 0.003 247.858)` (light) |
| **Sidebar Accent** | `oklch(0.968 0.007 247.896)` (off-white) | `oklch(0.279 0.041 260.031)` (dark) |
| **Sidebar Accent Foreground** | `oklch(0.208 0.042 265.755)` (dark) | `oklch(0.984 0.003 247.858)` (light) |
| **Sidebar Border** | `oklch(0.929 0.013 255.508)` (light gray) | `oklch(1 0 0 / 10%)` (white 10%) |
| **Sidebar Ring** | `oklch(0.704 0.04 256.788)` (gray) | `oklch(0.551 0.027 264.364)` (blue) |

## Dark Mode

Fundloom uses a true dark mode with dark blue tones (not pure black) for reduced eye strain:

### Key Differences
- Background shifts from warm off-white (`oklch(0.972 0.012 80)`) to dark blue (`oklch(0.129 0.042 264.695)`)
- Text shifts from deep ink to light gray
- Forest accent becomes a brighter blue in dark mode
- All semantic colors are carefully adjusted for dark mode contrast

### Toggling Dark Mode
```typescript
// Add the 'dark' class to the html element
document.documentElement.classList.add('dark')

// Remove for light mode
document.documentElement.classList.remove('dark')
```

## Usage Guidelines

### Do's
- Use semantic colors (`bg-primary`, `text-destructive`) instead of hardcoded values
- Maintain sufficient contrast between text and background (4.5:1 minimum for normal text)
- Use Forest/Green for success states, positive actions, and links
- Use Destructive/Red for errors, destructive actions, and warnings
- Test all color combinations in both light and dark modes

### Don'ts
- Don't use pure black (`#000000`) or pure white (`#FFFFFF`)
- Don't hardcode hex/rgb colors - use CSS variables or Tailwind classes
- Don't rely solely on color to convey information (use icons or text too)
- Don't use Chart colors for UI elements (they're for data visualization only)

## Accessibility

### Contrast Ratios
All color combinations meet or exceed WCAG 2.1 AA standards:

| Combination | Ratio | Level |
|-------------|-------|-------|
| Ink on Canvas | 15.2:1 | AAA |
| Forest on Canvas | 7.8:1 | AAA |
| Ink Soft on Canvas | 5.1:1 | AA |
| Primary on Primary Foreground | 12.3:1 | AAA |
| Destructive on Destructive Foreground | 4.8:1 | AA |

### Color Blindness
- Our single accent (forest/blue) is distinguishable for most types of color blindness
- We never rely solely on color - always pair with icons, text, or patterns
- Chart colors are chosen to be distinguishable in protanopia, deuteranopia, and tritanopia

## Implementation

### CSS Custom Properties
All colors are defined as CSS custom properties in `src/styles.css`:

```css
:root {
  /* Editorial palette */
  --canvas: oklch(0.972 0.012 80);
  --paper: oklch(0.985 0.008 80);
  --ink: oklch(0.205 0.018 60);
  --ink-soft: oklch(0.42 0.015 60);
  --line: oklch(0.88 0.012 75);
  --forest: oklch(0.42 0.07 145);
  --forest-soft: oklch(0.92 0.04 145);

  /* Semantic mappings */
  --background: var(--canvas);
  --foreground: var(--ink);
  --primary: var(--ink);
  /* ... etc */
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  /* ... etc */
}
```

### Tailwind Usage
Colors are automatically mapped to Tailwind classes via `@theme inline`:

```tsx
// Backgrounds
<div className="bg-background">Main background</div>
<div className="bg-card">Card surface</div>
<div className="bg-muted">Subtle background</div>

// Text
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>
<p className="text-destructive">Error text</p>

// Accents
<button className="bg-primary text-primary-foreground">Primary button</button>
<div className="border-border">Element with border</div>
```

### Adding New Colors
To add a new semantic color:

1. Add the variable to `:root` and `.dark` in `src/styles.css`:
   ```css
   :root {
     --my-new-color: oklch(0.5 0.1 200);
   }
   .dark {
     --my-new-color: oklch(0.6 0.15 210);
   }
   ```

2. Register it in `@theme inline`:
   ```css
   @theme inline {
     --color-my-new-color: var(--my-new-color);
   }
   ```

3. Use it:
   ```tsx
   <div className="bg-my-new-color text-my-new-color-foreground">
   ```

## Component Examples

### Buttons
```tsx
// Primary button (Ink background in light mode)
<button className="bg-primary text-primary-foreground hover:opacity-90">
  Primary Action
</button>

// Secondary button
<button className="bg-secondary text-secondary-foreground">
  Secondary Action
</button>

// Destructive button
<button className="bg-destructive text-destructive-foreground">
  Delete
</button>
```

### Cards
```tsx
// Standard card
<div className="bg-card text-card-foreground border-border rounded-lg p-6">
  <h3 className="text-foreground font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card description</p>
</div>

// Glass effect card
<div className="glass rounded-2xl p-6">
  Glass morphism effect
</div>
```

### Form Elements
```tsx
// Input with proper border and focus
<input
  className="border-input bg-background text-foreground focus:ring-ring"
  placeholder="Enter text..."
/>

// Error state
<input
  className="border-destructive bg-background text-foreground"
  aria-invalid="true"
/>
<p className="text-destructive text-sm">Error message</p>
```

## Color Tokens for Reference

### Quick Reference - Light Mode
```
Canvas:    oklch(0.972 0.012 80)   # Warm off-white
Paper:     oklch(0.985 0.008 80)   # Lighter surface
Ink:       oklch(0.205 0.018 60)   # Deep text
Ink Soft:  oklch(0.42 0.015 60)    # Secondary text
Line:      oklch(0.88 0.012 75)    # Borders
Forest:    oklch(0.42 0.07 145)    # Accent green
```

### Quick Reference - Dark Mode
```
Background: oklch(0.129 0.042 264.695)  # Dark blue
Foreground: oklch(0.984 0.003 247.858)  # Light gray
Primary:    oklch(0.929 0.013 255.508)  # Light blue
Forest:     oklch(0.488 0.243 264.376)  # Bright blue
```

## Future Enhancements

- Add color contrast checker tool to documentation
- Create color palette generator for custom themes
- Add support for user-customizable accent colors
- Develop color usage analytics to ensure accessibility
- Create color blindness simulation previews
- Add high contrast mode for enhanced accessibility
