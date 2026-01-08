# Better Hit Testing

## Problem
The hit testing area is only 5px padding, making it difficult to select shapes, especially thin lines or small shapes when zoomed out.

## Solution
- Increase hit testing padding to 8px
- Implement adaptive padding based on zoom level
- Add special handling for thin lines to increase their hit area

## Files to Modify
- `src/utils/hitTest.ts`

## Implementation Steps

1. Update hitTestPoint to use adaptive padding:
   ```typescript
   export function hitTestPoint(shape: DiagramShape, x: number, y: number, zoom: number = 1): boolean {
     // Adaptive padding: larger at low zoom, smaller at high zoom
     const basePadding = 8
     const adaptivePadding = basePadding / Math.sqrt(zoom)
     const padding = Math.max(adaptivePadding, 4)

     return (
       x >= shape.x - padding &&
       x <= shape.x + shape.width + padding &&
       y >= shape.y - padding &&
       y <= shape.y + shape.height + padding
     )
   }
   ```

2. Add line-specific hit testing for lines and arrows:
   ```typescript
   export function hitTestLine(
     shape: DiagramShape,
     x: number,
     y: number,
     zoom: number = 1
   ): boolean {
     if (shape.type !== 'line' && shape.type !== 'arrow') return false

     const padding = 10 / Math.sqrt(zoom)
     const { x: x1, y: y1 } = shape
     const x2 = shape.x + (shape.x2 || 0)
     const y2 = shape.y + (shape.y2 || 0)

     // Distance from point to line segment
     const distance = pointToLineDistance(x, y, x1, y1, x2, y2)
     return distance <= padding
   }

   function pointToLineDistance(
     px: number, py: number,
     x1: number, y1: number,
     x2: number, y2: number
   ): number {
     const A = px - x1
     const B = py - y1
     const C = x2 - x1
     const D = y2 - y1

     const dot = A * C + B * D
     const lenSq = C * C + D * D
     let param = -1

     if (lenSq !== 0) param = dot / lenSq

     let xx, yy

     if (param < 0) {
       xx = x1
       yy = y1
     } else if (param > 1) {
       xx = x2
       yy = y2
     } else {
       xx = x1 + param * C
       yy = y1 + param * D
     }

   const dx = px - xx
   const dy = py - yy
   return Math.sqrt(dx * dx + dy * dy)
 }
   ```

3. Update Canvas to pass zoom to hitTestPoint:
   ```typescript
   const clickedShape = shapes.find(s =>
     s.type === 'line' || s.type === 'arrow'
       ? hitTestLine(s, x, y, viewport.zoom)
       : hitTestPoint(s, x, y, viewport.zoom)
   )
   ```

## Testing
- Click on small shapes and verify they're easily selectable
- Click near thin lines and verify they're selectable
- Test at different zoom levels
- Verify hit areas don't overlap excessively

## Impact
Users will have an easier time selecting shapes, especially small ones and thin lines. This reduces frustration and makes the tool feel more responsive.
