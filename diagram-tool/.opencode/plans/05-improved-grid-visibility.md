# Improved Grid Visibility

## Problem
The grid lines are very light (#E5E7EB) and use a single pattern, making it hard to see and use for alignment, especially on high-resolution displays or with certain screen settings.

## Solution
- Make grid lines slightly darker (#D1D5DB)
- Add major grid lines every 5th line for better spatial reference
- Ensure grid remains subtle but useful

## Files to Modify
- `src/components/canvas/Canvas.tsx`
- `src/constants/layout.ts`

## Implementation Steps

1. Add grid constants:
   ```typescript
   const GRID_SIZE = 100
   const MAJOR_GRID_INTERVAL = 5  // Every 5th line is major
   ```

2. Update InfiniteGrid component to draw major/minor lines:
   ```typescript
   const verticalLines = []
   const horizontalLines = []

   for (let x = left; x <= right; x += gridSize) {
     const isMajor = (x / gridSize) % MAJOR_GRID_INTERVAL === 0
     verticalLines.push(
       <line
         key={`v${x}`}
         x1={x}
         y1={top}
         x2={x}
         y2={bottom}
         stroke={isMajor ? "#C4C7CD" : "#D1D5DB"}
         strokeWidth={isMajor ? 1.5 / viewport.zoom : 1 / viewport.zoom}
         opacity={isMajor ? 1 : 0.7}
       />
     )
   }
   // Repeat for horizontal lines
   ```

3. Update CANVAS_GRID constants:
   ```typescript
   export const CANVAS_GRID = {
     majorInterval: 5,
     minorLineColor: '#D1D5DB',
     majorLineColor: '#C4C7CD',
     minorStrokeWidth: 1,
     majorStrokeWidth: 1.5,
   } as const
   ```

## Testing
- Verify grid is more visible but not distracting
- Verify major grid lines are clearly distinguishable
- Test at different zoom levels to ensure grid remains useful
- Verify grid opacity/scale adapts properly to zoom

## Impact
Users will have better spatial awareness and an easier time aligning shapes. The major grid lines provide visual "milestones" that help with positioning and scale perception.
