# Animations

Fundloom uses Framer Motion for animations to create a smooth, engaging user experience.

## Animation Principles

- **Subtle and Purposeful**: Animations should enhance usability, not distract
- **Consistent**: Similar actions should have similar animations
- **Performance-conscious**: Animations should be optimized for 60fps
- **Accessible**: Respects user's motion preferences

## Common Animation Patterns

### Page Transitions
- Fade-in/fade-out between routes
- Slide-in for modals and drawers
- Scale-in for floating action buttons

### Element Entrances
- Staggered fade-in for lists
- Scale-up from center for cards
- Slide-up from bottom for sheets

### Interactive Feedback
- Press states on buttons and touch targets
- Hover lifts for cards and interactive elements
- Loading spinners for async operations
- Success/error state animations

### List Operations
- Insert: Slide-in + fade
- Remove: Slide-out + fade
- Update: Pulse or scale feedback
- Reorder: Lift and slide with shadow

## Implementation Guidelines

### Using Framer Motion
```typescript
import { motion, AnimatePresence } from "framer-motion";

// Variants for reusable animations
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

// In component
<motion.div variants={fadeIn}>
  {/* Content */}
</motion.div>

// For lists with staggered children
<motion.ul>
  {items.map((item, index) => (
    <motion.li
      key={item.id}
      variants={fadeIn}
      transition={{ delay: index * 0.05 }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Motion Values
For more complex interactions, use motion values:
```typescript
const scale = useMotionValue(1);
const opacity = useMotionValue(1);

<motion.div
  style={{ scale, opacity }}
  whileTap={{ scale: 0.95 }}
  whileHover={{ scale: 1.05 }}
>
  {/* Content */}
</motion.div>
```

### Accessibility Considerations
- Respect `prefers-reduced-motion` media query
- Provide option to disable animations
- Ensure animations don't convey critical information alone
- Keep animation duration under 500ms for responsiveness

## Animation Library
Common animations are centralized in `src/animations/` for reuse:
- `fadeIn`, `fadeOut`, `slideIn`, `slideOut`
- `scaleIn`, `scaleOut`, `pulse`, `shake`
- `staggerChildren` variants

## Performance Optimization
- Use `layout` prop for efficient layout animations
- Leverage `useTransform` for gesture-driven animations
- Avoid animating properties that trigger layout/paint when possible
- Test on low-end devices