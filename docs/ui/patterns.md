# UI Patterns

Last updated: May 2026

## Overview

This document outlines common UI patterns used in Fundloom. These patterns ensure consistency across the platform and provide reusable solutions for common interface challenges.

## Button Patterns

### Basic Buttons

Fundloom uses a flexible button component with multiple variants and sizes. See [buttons documentation](./components.md) for full details.

```tsx
import { Button } from "@/components/ui/button";

// Primary action
<Button>Save Changes</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Outline style
<Button variant="outline">Learn More</Button>

// Ghost (minimal)
<Button variant="ghost">Skip</Button>

// Link style
<Button variant="link">View Details</Button>
```

### Button Sizes

```tsx
// Small button
<Button size="sm">Small</Button>

// Default size
<Button size="default">Default</Button>

// Large button
<Button size="lg">Large</Button>

// Icon-only button
<Button size="icon"><Plus className="size-4" /></Button>
```

### Button with Icon

```tsx
import { Plus, Trash2 } from "lucide-react";

// Icon left
<Button>
  <Plus className="size-4 mr-2" />
  Create Campaign
</Button>

// Icon right
<Button>
  Continue
  <ArrowRight className="size-4 ml-2" />
</Button>

// Icon only
<Button size="icon" aria-label="Add new">
  <Plus className="size-4" />
</Button>
```

### Button States

```tsx
// Loading state
<Button disabled>
  <Loader2 className="size-4 mr-2 animate-spin" />
  Saving...
</Button>

// Disabled state
<Button disabled>Cannot Save</Button>
```

## Card Patterns

### Basic Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Campaign Title</CardTitle>
    <CardDescription>Brief description here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Campaign Card (Common Pattern)

```tsx
<Card className="overflow-hidden">
  <div className="aspect-video bg-muted">
    {/* Campaign image */}
  </div>
  <CardHeader>
    <CardTitle className="line-clamp-1">Campaign Name</CardTitle>
    <CardDescription className="line-clamp-2">
      Brief description of the campaign
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span>75%</span>
      </div>
      <div className="h-2 bg-muted rounded-full">
        <div className="h-full w-3/4 bg-primary rounded-full" />
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Donate Now</Button>
  </CardFooter>
</Card>
```

## Form Patterns

### Basic Form Layout

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <div className="space-y-2">
    <Label htmlFor="title">Campaign Title</Label>
    <Input id="title" placeholder="Enter title" />
    <p className="text-sm text-muted-foreground">Choose a clear, descriptive title</p>
  </div>

  <div className="space-y-2">
    <Label htmlFor="description">Description</Label>
    <Textarea id="description" placeholder="Describe your campaign" />
  </div>

  <div className="flex gap-4">
    <Button type="submit">Save</Button>
    <Button type="button" variant="outline">Cancel</Button>
  </div>
</form>
```

### Form with Validation Errors

```tsx
<div className="space-y-2">
  <Label htmlFor="amount" className={errors.amount ? "text-destructive" : ""}>
    Donation Amount
  </Label>
  <Input
    id="amount"
    type="number"
    className={errors.amount ? "border-destructive" : ""}
  />
  {errors.amount && (
    <p className="text-sm text-destructive">{errors.amount.message}</p>
  )}
</div>
```

### Inline Form Field

```tsx
<div className="flex items-center gap-4">
  <Label htmlFor="email" className="shrink-0">Email</Label>
  <Input id="email" type="email" className="flex-1" />
  <Button size="sm">Subscribe</Button>
</div>
```

## Dialog/Modal Patterns

### Basic Dialog

```tsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to proceed? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end gap-4">
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Confirm</Button>
    </div>
  </DialogContent>
</Dialog>
```

### Delete Confirmation Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive" size="icon">
      <Trash2 className="size-4" />
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Campaign</DialogTitle>
      <DialogDescription>
        This will permanently delete the campaign and all associated data.
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end gap-4">
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button variant="destructive" onClick={handleDelete}>Delete</Button>
    </div>
  </DialogContent>
</Dialog>
```

## Table Patterns

### Data Table with Actions

```tsx
<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">{item.name}</TableCell>
          <TableCell>
            <Badge variant={item.active ? "default" : "secondary"}>
              {item.active ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
          <TableCell>${item.amount}</TableCell>
          <TableCell className="text-right">
            <Button variant="ghost" size="icon">
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 className="size-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

## Navigation Patterns

### Sidebar Navigation

```tsx
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

<Sidebar>
  <SidebarContent>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link to="/campaigns">
            <HeartHandshake className="size-4" />
            Campaigns
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarContent>
</Sidebar>
```

### Breadcrumb Navigation

```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link to="/">Home</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator>
      <ChevronRight className="size-4" />
    </BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbLink asChild>
        <Link to="/campaigns">Campaigns</Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator>
      <ChevronRight className="size-4" />
    </BreadcrumbSeparator>
    <BreadcrumbItem>
      <BreadcrumbPage>My Campaign</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

## Status & Feedback Patterns

### Alert Messages

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Info alert
<Alert>
  <Info className="size-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    Your campaign has been submitted for review.
  </AlertDescription>
</Alert>

// Success alert
<Alert className="border-green-500 bg-green-50">
  <CheckCircle className="size-4 text-green-600" />
  <AlertTitle className="text-green-800">Success</AlertTitle>
  <AlertDescription className="text-green-700">
    Donation received successfully!
  </AlertDescription>
</Alert>

// Error alert
<Alert variant="destructive">
  <AlertTriangle className="size-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to process donation. Please try again.
  </AlertDescription>
</Alert>
```

### Badge Status Indicators

```tsx
import { Badge } from "@/components/ui/badge";

// Status badges
<Badge>Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Rejected</Badge>
<Badge variant="outline">Draft</Badge>

// With icon
<Badge>
  <CheckCircle className="size-3 mr-1" />
  Verified
</Badge>
```

### Toast Notifications

```tsx
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Success!",
      description: "Your changes have been saved.",
    });
  };

  const handleError = () => {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Something went wrong. Please try again.",
    });
  };
}
```

## Data Display Patterns

### Statistics Cards

```tsx
<div className="grid gap-4 md:grid-cols-3">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
      <DollarSign className="size-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">$45,231.89</div>
      <p className="text-xs text-muted-foreground">+20.1% from last month</p>
    </CardContent>
  </Card>
  {/* More stat cards */}
</div>
```

### Progress Indicators

```tsx
// Linear progress
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Funding Progress</span>
    <span>75%</span>
  </div>
  <Progress value={75} />
</div>

// Circular progress (custom)
<div className="relative h-20 w-20">
  <svg className="h-full w-full" viewBox="0 0 100 100">
    <circle className="stroke-muted" strokeWidth="8" fill="none" cx="50" cy="50" r="45" />
    <circle
      className="stroke-primary"
      strokeWidth="8"
      fill="none"
      cx="50"
      cy="50"
      r="45"
      strokeDasharray={`${75 * 2.83} 283`}
      transform="rotate(-90 50 50)"
    />
  </svg>
  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
    75%
  </span>
</div>
```

## Layout Patterns

### Page Header

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-display">Campaign Settings</h1>
    <p className="text-muted-foreground">Manage your campaign details and preferences</p>
  </div>
  <Button>
    <Save className="size-4 mr-2" />
    Save Changes
  </Button>
</div>
```

### Two-Column Layout

```tsx
<div className="grid gap-6 lg:grid-cols-[1fr_300px]">
  <div className="space-y-6">
    {/* Main content */}
  </div>
  <div className="space-y-6">
    {/* Sidebar content */}
  </div>
</div>
```

### Responsive Grid

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <Card key={item.id}>{/* Card content */}</Card>
  ))}
</div>
```

## Empty State Patterns

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="mb-4 rounded-full bg-muted p-4">
    <Inbox className="size-8 text-muted-foreground" />
  </div>
  <h3 className="mb-2 text-lg font-semibold">No campaigns yet</h3>
  <p className="mb-4 text-sm text-muted-foreground">
    Create your first campaign to start raising funds.
  </p>
  <Button>
    <Plus className="size-4 mr-2" />
    Create Campaign
  </Button>
</div>
```

## Loading Patterns

### Skeleton Loading

```tsx
<div className="space-y-4">
  <Skeleton className="h-8 w-[250px]" />
  <Skeleton className="h-4 w-[300px]" />
  <div className="grid gap-4 sm:grid-cols-2">
    <Skeleton className="h-32 rounded-lg" />
    <Skeleton className="h-32 rounded-lg" />
  </div>
</div>
```

### Inline Loading

```tsx
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="size-4 mr-2 animate-spin" />
      Processing...
    </>
  ) : (
    "Submit"
  )}
</Button>
```

## Dark Mode Support

All patterns automatically support dark mode through Tailwind's `dark:` variant and our CSS custom properties. No additional work needed.

```tsx
// These components automatically adapt to dark mode
<Card>
  <CardContent>Content here</CardContent>
</Card>
```

## Accessibility Considerations

All patterns should:

1. Use semantic HTML elements
2. Include proper ARIA labels for icon-only buttons
3. Ensure keyboard navigation works
4. Maintain sufficient color contrast
5. Provide focus indicators

```tsx
// Good: Accessible icon button
<Button size="icon" aria-label="Delete campaign">
  <Trash2 className="size-4" />
</Button>

// Good: Form with proper labels
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

## Pattern Customization

### Using clsx/cn for Conditional Classes

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",
  condition && "conditional-class",
  variant === "special" && "special-class"
)}>
```

### Extending Components with `asChild`

```tsx
// Use Button styling on a Link
<Button asChild>
  <Link to="/campaigns">View Campaigns</Link>
</Button>
```

## Future Patterns to Document

- [ ] Multi-step form wizard
- [ ] File upload with drag-and-drop
- [ ] Infinite scroll / pagination
- [ ] Date range picker
- [ ] Rich text editor
- [ ] Command palette
- [ ] Context menu
- [ ] Hover card
- [ ] Popover forms
- [ ] Responsive table with actions
