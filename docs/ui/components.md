# Component Documentation

Last updated: April 2026

## Overview

This document provides an overview of the UI components used in the Fundloom platform. We use a combination of custom components and Radix UI primitives to build accessible, reusable UI elements.

## Component Categories

### Layout Components
Components that handle page structure and layout:

- **Container**: Centers content with max-width and padding
- **Section**: Vertical spacing wrapper for page sections
- **Grid**: CSS grid layout helper
- **Flex**: Flexbox layout helper
- **Stack**: Vertical stack with spacing
- **InlineStack**: Horizontal stack with spacing

### Navigation Components
Components for navigation and routing:

- **Navigation**: Primary navigation menu
- **NavLink**: Styled link for navigation
- **Breadcrumbs**: Hierarchical navigation trail
- **Pagination**: Page navigation for lists
- **Tabs**: Tabbed interface for content switching
- **Stepper**: Multi-step process indicator

### Form Components
Components for form inputs and validation:

- **Input**: Text input with label and error states
- **TextArea**: Multi-line text input
- **Select**: Dropdown select menu
- **Checkbox**: Boolean input
- **Radio**: Single selection from multiple options
- **Switch**: Toggle switch for boolean values
- **FileInput**: File upload component
- **FormLabel**: Label for form inputs
- **FormError**: Error message display
- **FormHelperText**: Helper text for form inputs

### Data Display Components
Components for displaying information:

- **Card**: Flexible content container with elevation
- **Badge**: Small count or status indicator
- **Chip**: Compact element for input, attribute, or action
- **Avatar**: User profile image representation
- **Alert**: Important message requiring attention
- **ProgressBar**: Visual representation of completion
- **SkeletonLoader**: Placeholder while content loads
- **Table**: Structured data display
- **Statistic**: Numerical value with label and trend
- **Timeline**: Chronological sequence of events

### Feedback Components
Components for user feedback and interaction:

- **Button**: Primary action trigger
- **IconButton**: Button containing only an icon
- **Tooltip**: Brief message on hover/focus
- **Popover**: Floating panel for additional content
- **DropdownMenu**: Menu of choices
- **Modal**: Overlay dialog for focused interaction
- **Drawer**: Panel that slides in from the side
- **Toast**: Temporary notification at screen edge
- **AlertDialog**: Modal requiring user confirmation
- **ConfirmationDialog**: Dialog for destructive actions

### Media Components
Components for displaying media:

- **Image**: Optimized image display with loading states
- **Video**: Embedded video player
- **Audio**: Audio player component
- **Gallery**: Grid of images with lightbox
- **Carousel**: Swipeable content slider
- **AvatarGroup**: Group of avatars representing multiple users
- **AvatarStack**: Stacked avatars showing overlap

## Component Library

We primarily use [Radix UI](https://www.radix-ui.com/) as our component foundation, customized with our design system. Each Radix component is wrapped in a Fundloom-specific component that applies our styling and ensures consistency.

### Radix Primitives Used
- Accordion
- Alert Dialog
- Aspect Ratio
- Avatar
- Checkbox
- Collapsible
- Context Menu
- Dialog
- Dropdown Menu
- Hover Card
- Label
- Menubar
- Navigation Menu
- Popover
- Progress
- Radio Group
- Scroll Area
- Select
- Separator
- Slider
- Slot
- Switch
- Tabs
- Tag
- Toggle
- Toggle Group
- Tooltip

## Custom Components

Beyond Radix wrappers, we have several custom components:

### Campaign-Specific Components
- **CampaignCard**: Displays campaign summary in grids/lists
- **MilestoneManager**: Manages campaign milestones
- **PaymentModal**: Handles funding transactions
- **ShareRow**: Social sharing component
- **VerifiedBadge**: Indicates verified campaign creators
- **AiFraudDetection**: AI-powered fraud analysis display
- **AiCampaignOptimizer**: AI-powered campaign optimization suggestions
- **SmartDonorMatching**: AI-powered donor matching recommendations
- **CreatorCard**: Displays campaign creator information

### Navigation & Layout
- **Header**: Primary navigation header
- **Footer**: Page footer with links and copyright
- **Sidebar**: Secondary navigation sidebar
- **Breadcrumb**: Hierarchical navigation path
- **PageTitle**: Page title with breadcrumb

### Form Components
- **FundingForm**: Campaign contribution form
- **ProfileForm**: User profile editing form
- **CampaignForm**: Campaign creation/editing form
- **LoginForm**: User authentication form

### Data Visualization
- **ProgressChart**: Visual progress toward funding goal
- **DonationChart**: Chart showing donation history
- **TimelineChart**: Visual timeline of campaign events
- **StatisticCard**: Card displaying key metrics

## Styling Approach

Components use a combination of:
- **Tailwind CSS** for utility-based styling
- **CSS Variables** for theme colors and spacing
- **Class Variance Authority (cva)** for compound variants
- **Tailwind Merge** for conditional class merging
- **Slot-based styling** for flexible component composition

## Accessibility

All components follow accessibility guidelines:
- Proper ARIA attributes and roles
- Keyboard navigable
- Screen reader friendly
- Sufficient color contrast
- Focus visible indicators
- Respect for reduced motion preferences

## Contributing Components

When adding new components:
1. Follow existing patterns in `/src/components/`
2. Use Radix primitives as base when applicable
3. Apply our design system tokens (colors, spacing, typography)
4. Ensure keyboard accessibility
5. Add appropriate ARIA attributes
6. Test with screen readers
7. Add to component documentation
8. Follow file naming conventions (PascalCase for components)

## Component Organization

Components are organized in `/src/components/`:
```
/src/components/
├── ui/                 # Radix-based primitive wrappers
├── layout/             # Page layout components
├── forms/              # Form-specific components
├── data-display/       # Data presentation components
├── feedback/           # Interactive feedback components
├── media/              # Media display components
├── campaign/           # Campaign-specific components
├── navigation/         # Navigation components
└── index.ts            # Barrel exports
```

## Versioning

Components follow semantic versioning:
- Major: Breaking changes to API or behavior
- Minor: New features or enhancements
- Patch: Bug fixes and non-breaking changes

## Testing

Components should include:
- Unit tests for props and behavior
- Snapshot tests for rendering
- Accessibility tests (jsx-a11y/ testing-library)
- Visual regression tests (when applicable)
- Interaction tests (user-event/testing-library)

## Performance

- Use `React.memo` for expensive render calculations
- Implement `useCallback` and `useMemo` where appropriate
- Lazy load non-critical components
- Consider virtualization for large lists
- Optimize images and media assets

## Future Enhancements

Planned improvements to our component library:
- Design token system (CSS variables for theming)
- Component storybook for documentation and testing
- Design tokens export for other platforms
- Accessibility testing automation
- Performance monitoring and optimization
- Component deprecation policy