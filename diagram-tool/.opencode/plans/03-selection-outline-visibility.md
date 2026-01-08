# Selection Outline Visibility

## Problem
The selection outline is a thin 1px stroke with a 4-2 dash pattern, making it hard to see, especially on dark-colored shapes or at high zoom levels.

## Solution
- Increase selection outline stroke to 2px
- Improve dash pattern to 6-3 for better visibility
- Add a subtle glow effect for better contrast
- Ensure outline is always visible regardless of shape color

## Files to Modify
- `src/components/shapes/BaseShape.tsx`
- `src/style.css` (add selection glow effect class)

## Implementation Steps

1. Update BaseShape selection rect:
   ```typescript
   {selected && (
     <rect
       x={0}
       y={0}
       width={width}
       height={height}
       fill="none"
       stroke="#3B82F6"
       strokeWidth={2}  // Increased from 1
       strokeDasharray="6 3"  // Changed from "4 2"
       pointerEvents="none"
       className="selection-glow"  // Add glow effect
     />
   )}
   ```

2. Add CSS glow effect in `style.css`:
   ```css
   .selection-glow {
     filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.4));
   }
   ```

3. Update existing `.selection-ring` class in style.css to match new spec:
   ```css
   .selection-ring {
     stroke: var(--color-primary);
     stroke-width: 2;
     stroke-dasharray: 6 3;
     filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.4));
   }
   ```

## Testing
- Create shapes with various fill colors (white, black, red, blue)
- Verify selection outline is clearly visible on all colors
- Test at different zoom levels (100%, 50%, 200%)
- Verify glow effect doesn't impact performance

## Impact
Selected shapes will be immediately obvious, reducing confusion about which shapes are currently selected. This is especially important when working with overlapping shapes.
