# Resize Handle Visibility

## Problem
Resize handles are only 8x8px with a thin 1px stroke, making them difficult to grab, especially on smaller shapes or when zoomed out.

## Solution
- Increase handle size to 10x10px for better visibility
- Add a subtle shadow for depth
- Ensure handles have a minimum visual weight at all zoom levels

## Files to Modify
- `src/components/handles/ResizeHandles.tsx`

## Implementation Steps

1. Update handle dimensions:
   ```typescript
   // Change from 8x8 to 10x10
   width={10}
   height={10}
   x={-5}  // Half of width
   y={-5}  // Half of height
   ```

2. Add shadow to handles:
   ```typescript
   <rect
     x={-5}
     y={-5}
     width={10}
     height={10}
     fill="white"
     stroke="#3B82F6"
     strokeWidth={2}
     filter="drop-shadow(0 1px 2px rgba(0,0,0,0.15))"
   />
   ```

3. Consider handle size relative to zoom level (optional):
   - Scale handles inversely with zoom when zoom < 0.5
   - Ensures handles remain clickable at any zoom level

## Testing
- Create a small shape (50x50px) and verify handles are easily clickable
- Zoom out to 50% and verify handles are still grabbable
- Verify handles have good contrast against both light and dark fills

## Impact
Users will have an easier time selecting resize handles, especially on small shapes or when zoomed out. This reduces frustration and makes precise adjustments more fluid.
