# Icons

Last updated: May 2026

## Icon System

Fundloom uses **Lucide React** as its primary icon library - a clean, consistent, and customizable icon set based on the Lucide design system. Lucide icons are:

- **Lightweight**: Tree-shakeable, import only what you need
- **Consistent**: 24x24 viewBox with 2px stroke width by default
- **Customizable**: Easy to size, color, and style with Tailwind classes
- **Accessible**: Built-in support for aria-labels and semantic meaning

## Installation

Lucide React is already installed in the project:

```bash
npm list lucide-react
# lucide-react@0.468.0
```

## Basic Usage

### Importing Icons

Import icons individually for optimal tree-shaking:

```tsx
import { Wallet, Heart, Zap } from "lucide-react";

function MyComponent() {
  return (
    <div>
      <Wallet className="size-5" />
      <Heart className="size-5 text-red-500" />
      <Zap className="size-6 text-yellow-500" />
    </div>
  );
}
```

### Sizing Icons

Use Tailwind's size utilities for consistent icon sizing:

```tsx
// Common sizes
<Wallet className="size-4" />   // 16x16px - inline with text
<Wallet className="size-5" />   // 20x20px - default for buttons, UI elements
<Wallet className="size-6" />   // 24x24px - larger buttons, headings
<Wallet className="size-8" />   // 32x32px - feature sections, hero icons
<Wallet className="size-10" />  // 40x40px - extra large, decorative
```

### Coloring Icons

Icons inherit color by default, or use Tailwind text color classes:

```tsx
// Inherits color from parent
<Heart className="size-5" />

// Explicit color
<Heart className="size-5 text-red-500" />
<Check className="size-5 text-green-600" />
<AlertTriangle className="size-5 text-yellow-600" />
<X className="size-5 text-destructive" />
```

## Icon Categories

### Navigation & UI

| Icon | Import | Usage |
|------|--------|-------|
| **Menu** | `PanelLeft` | Sidebar toggle, mobile menu |
| **Close** | `X` | Close buttons, dismiss dialogs |
| **Chevron Left** | `ChevronLeft` | Back navigation, pagination |
| **Chevron Right** | `ChevronRight` | Forward navigation, pagination |
| **Chevron Down** | `ChevronDown` | Expand/collapse, dropdowns |
| **Chevron Up** | `ChevronUp` | Expand/collapse |
| **More Horizontal** | `MoreHorizontal` | Overflow menus, pagination |
| **More Vertical** | `MoreVertical` | Context menus |

### Actions & Interactions

| Icon | Import | Usage |
|------|--------|-------|
| **Plus** | `Plus` | Add new items, create |
| **Minus** | `Minus` | Remove, decrease |
| **Check** | `Check` | Confirm, complete, success |
| **Trash** | `Trash2` | Delete, remove |
| **Edit** | `Pencil` | Edit, modify |
| **Upload** | `Upload` | File uploads |
| **Download** | `Download` | File downloads |
| **Refresh** | `RefreshCw` | Reload, refresh data |
| **Search** | `Search` | Search functionality |
| **Link** | `Link2` | Copy link, share |
| **External Link** | `ExternalLink` | Open in new tab |
| **Lock** | `Lock` | Private, secured |
| **Unlock** | `Unlock` | Public, unlocked |

### Financial & Donations

| Icon | Import | Usage |
|------|--------|-------|
| **Wallet** | `Wallet` | Connect wallet, crypto |
| **Dollar Sign** | `DollarSign` | Donations, pricing |
| **Heart** | `Heart` | Favorite, donate, like |
| **Heart Handshake** | `HeartHandshake` | Charity, partnerships |
| **Target** | `Target` | Goals, milestones |
| **Trending Up** | `TrendingUp` | Growth, success metrics |
| **Bar Chart** | `BarChart3` | Analytics, statistics |
| **Pie Chart** | `PieChart` | Fund allocation |

### Communication & Social

| Icon | Import | Usage |
|------|--------|-------|
| **Message** | `MessageCircle` | Comments, chat |
| **Megaphone** | `Megaphone` | Announcements, updates |
| **Share** | `Sparkles` | Share campaign (also used for AI features) |
| **Twitter** | `Twitter` | Share on Twitter/X |
| **Mail** | `Mail` | Email, contact |

### AI & Smart Features

| Icon | Import | Usage |
|------|--------|-------|
| **Sparkles** | `Sparkles` | AI features, magic actions |
| **Lightbulb** | `Lightbulb` | Suggestions, ideas |
| **Shield** | `Shield` | Security, fraud detection |
| **Shield Check** | `BadgeCheck` | Verified, trusted |
| **Alert Triangle** | `AlertTriangle` | Warnings, risk |
| **Check Circle** | `CheckCircle` | Success, verified |

### Form & Input

| Icon | Import | Usage |
|------|--------|-------|
| **Circle** | `Circle` | Radio buttons, empty state |
| **Check Circle** | `Check` | Checkboxes, selected state |
| **Grip Vertical** | `GripVertical` | Drag handles, reorder |
| **Calendar** | `Calendar` | Date pickers |

## Icon Usage Patterns

### In Buttons

```tsx
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Icon-only button
<Button size="icon" variant="outline">
  <Plus className="size-4" />
</Button>

// Button with icon and text
<Button>
  <Plus className="size-4 mr-2" />
  Create Campaign
</Button>

// Destructive action
<Button variant="destructive">
  <Trash2 className="size-4 mr-2" />
  Delete
</Button>
```

### In Form Elements

```tsx
import { Search, X } from "lucide-react";

// Search input with icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
  <input className="pl-10" placeholder="Search campaigns..." />
  <X className="absolute right-3 top-1/2 -translate-y-1/2 size-4 cursor-pointer" />
</div>
```

### In Navigation

```tsx
import { ChevronRight, Home } from "lucide-react";

// Breadcrumbs
<nav className="flex items-center space-x-1 text-sm">
  <Home className="size-4" />
  <ChevronRight className="size-4 text-muted-foreground" />
  <span>Campaigns</span>
  <ChevronRight className="size-4 text-muted-foreground" />
  <span className="text-foreground">My Campaign</span>
</nav>
```

### In Status Indicators

```tsx
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

// Success
<div className="flex items-center gap-2 text-green-600">
  <CheckCircle className="size-5" />
  <span>Campaign verified</span>
</div>

// Warning
<div className="flex items-center gap-2 text-yellow-600">
  <AlertTriangle className="size-5" />
  <span>Review required</span>
</div>

// Error
<div className="flex items-center gap-2 text-destructive">
  <XCircle className="size-5" />
  <span>Verification failed</span>
</div>
```

## Customizing Icons

### Size Variants

```tsx
// Using Tailwind size utilities (recommended)
<Wallet className="size-4" />   // 16px
<Wallet className="size-5" />   // 20px
<Wallet className="size-6" />   // 24px

// Using arbitrary values
<Wallet className="size-[18px]" />
```

### Color Variants

```tsx
// Semantic colors
<Check className="size-5 text-green-600" />      // Success
<AlertTriangle className="size-5 text-yellow-500" /> // Warning
<X className="size-5 text-destructive" />         // Error
<Info className="size-5 text-blue-500" />         // Info

// Using design system colors
<Heart className="size-5 text-forest" />
<Sparkles className="size-5 text-primary" />
```

### Stroke Width

Lucide icons use 2px stroke width by default. You can customize this:

```tsx
import { Wallet } from "lucide-react";

// Default stroke width (2)
<Wallet className="size-5" />

// Custom stroke width via props
<Wallet className="size-5" strokeWidth={1.5} />

// Thicker stroke
<Wallet className="size-5" strokeWidth={2.5} />
```

## Accessibility

### Icon Buttons

Always provide an accessible label for icon-only buttons:

```tsx
// Good: aria-label provided
<Button size="icon" aria-label="Delete campaign">
  <Trash2 className="size-4" />
</Button>

// Good: using title attribute
<button aria-label="Close dialog">
  <X className="size-4" />
</button>

// Avoid: no label (inaccessible)
<Button size="icon">
  <Trash2 className="size-4" />
</Button>
```

### Decorative Icons

If an icon is purely decorative, use `aria-hidden="true"`:

```tsx
// Decorative icon (announces nothing to screen readers)
<Heart className="size-5 text-red-500" aria-hidden="true" />
```

### Semantic Icons

For icons that convey meaning, ensure the meaning is also available as text:

```tsx
// Good: icon paired with text
<div className="flex items-center gap-2">
  <CheckCircle className="size-5 text-green-600" />
  <span>Verified campaign</span>
</div>

// Good: icon with aria-label
<CheckCircle className="size-5 text-green-600" aria-label="Verified campaign" />
```

## Icon Components

### Creating Reusable Icon Components

```tsx
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function Icon({ icon: Icon, size = "md", className }: IconProps) {
  return <Icon className={cn(sizeMap[size], className)} />;
}

// Usage
<Icon icon={Wallet} size="lg" className="text-primary" />
```

### Feature Icon Pattern

For feature sections with icons:

```tsx
import { Wallet, Zap, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Connect Wallet",
    description: "Connect your crypto wallet to get started",
  },
  {
    icon: Zap,
    title: "Instant Donations",
    description: "Donate instantly with low fees",
  },
  {
    icon: HeartHandshake,
    title: "Trust & Transparency",
    description: "Track your donations on-chain",
  },
];

<div className="grid grid-cols-3 gap-6">
  {features.map((feature) => (
    <div key={feature.title} className="text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
        <feature.icon className="size-6 text-primary" />
      </div>
      <h3 className="mb-2 font-semibold">{feature.title}</h3>
      <p className="text-sm text-muted-foreground">{feature.description}</p>
    </div>
  ))}
</div>
```

## Common Icon Patterns in Fundloom

Based on the existing codebase:

### Campaign Cards
```tsx
import { Heart, BarChart3, Calendar } from "lucide-react";

// Used in campaign cards for quick info
<div className="flex items-center gap-4 text-sm text-muted-foreground">
  <span className="flex items-center gap-1">
    <Heart className="size-4" />
    234 donors
  </span>
  <span className="flex items-center gap-1">
    <BarChart3 className="size-4" />
    75% funded
  </span>
</div>
```

### Admin Tables
```tsx
import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";

// Action buttons in admin tables
<div className="flex items-center gap-2">
  <Button size="icon" variant="ghost">
    <Pencil className="size-4" />
  </Button>
  <Button size="icon" variant="ghost">
    <Trash2 className="size-4" />
  </Button>
  <Button size="icon" variant="ghost">
    <ArrowUp className="size-4" />
  </Button>
</div>
```

### AI Features
```tsx
import { Sparkles, Shield, Lightbulb } from "lucide-react";

// AI-powered features
<div className="flex items-center gap-2 rounded-lg bg-forest-soft p-3">
  <Sparkles className="size-5 text-forest" />
  <span>AI-powered campaign optimization</span>
</div>
```

## Icon Libraries & Resources

### Official Resources
- **Lucide Website**: https://lucide.dev/
- **Lucide React Docs**: https://lucide.dev/guide/packages/lucide-react
- **Icon Search**: https://lucide.dev/icons/

### Finding Icons

Browse icons at https://lucide.dev/icons/ and import by name:

```tsx
// Search for "camera" on the website, then import
import { Camera } from "lucide-react";
```

### Alternative Icons

If Lucide doesn't have the icon you need, consider:

1. **Request the icon** on the Lucide GitHub repository
2. **Use a similar icon** from Lucide's extensive library
3. **Create a custom SVG** (last resort, ensure consistency)

## Best Practices

### Do's
- Import icons individually for tree-shaking (`import { Wallet } from "lucide-react"`)
- Use consistent sizes (`size-4`, `size-5`, `size-6`)
- Provide accessible labels for icon-only buttons
- Use semantic colors for status icons (green for success, red for error)
- Pair icons with text when conveying important information

### Don'ts
- Don't use different stroke widths without reason (stick to default 2px)
- Don't mix icon libraries (use only Lucide React)
- Don't use icons that are too detailed or complex
- Don't rely solely on icons to convey meaning (add text or aria-labels)
- Don't resize icons with inline styles (use Tailwind classes)

## Adding New Icons

To add a new icon to the project:

1. Search for the icon at https://lucide.dev/icons/
2. Import it in your component:
   ```tsx
   import { NewIconName } from "lucide-react";
   ```
3. Use it with appropriate sizing and coloring:
   ```tsx
   <NewIconName className="size-5 text-muted-foreground" />
   ```

## Performance

Lucide React is tree-shakeable, so only imported icons are included in the bundle. To verify:

```bash
# Check bundle size impact
npm run build
npm run analyze  # if available
```

## Future Enhancements

- Create an icon preview component in Storybook
- Add icon animation presets (spin, pulse, bounce)
- Develop icon usage guidelines for specific contexts
- Create custom Fundloom-specific icons for unique features
- Add icon search and preview to the design system documentation
