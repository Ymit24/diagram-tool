# Drawing Experience Improvements

## Problem
No visual feedback about dimensions while drawing rectangles or circles, making it hard to create precisely sized shapes.

## Solution
Show a dimension tooltip (width x height) near the cursor while drawing rectangles or circles.

## Files to Modify
- `src/components/canvas/Canvas.tsx`

## Implementation Steps

1. Add dimension tooltip component:
   ```typescript
   function DimensionTooltip({
     x, y, width, height, type
   }: {
     x: number
     y: number
     width: number
     height: number
     type: 'rectangle' | 'circle'
   }) {
     const displayWidth = Math.round(width)
     const displayHeight = Math.round(height)

     return (
       <g className="pointer-events-none">
         <rect
           x={x + width / 2 - 40}
           y={y + height + 15}
           width={80}
           height={24}
           rx={4}
           fill="rgba(17, 24, 39, 0.9)"
         />
         <text
           x={x + width / 2}
           y={y + height + 31}
           textAnchor="middle"
           fill="white"
           fontSize={11}
           fontFamily="system-ui"
         >
           {displayWidth} × {displayHeight}
         </text>
       </g>
     )
   }
   ```

2. Add dimension tooltip to drawing preview:
   ```typescript
   // In the drawing shape rendering section:
   {drawing.isDrawing && drawing.tool !== 'select-click' &&
    drawing.tool !== 'select-box' && drawing.tool !== 'select-lasso' && (() => {
     const isLineOrArrow = drawing.tool === 'line' || drawing.tool === 'arrow'
     const deltaX = drawing.currentX - drawing.startX
     const deltaY = drawing.currentY - drawing.startY
     const tempShape = {
       // ... existing tempShape ...
     } as DiagramShape

     return (
       <>
         <SelectedShapeRenderer shape={tempShape} />
         {/* Show dimensions for rectangle and circle */}
         {(drawing.tool === 'rectangle' || drawing.tool === 'circle') && (
           <DimensionTooltip
             x={Math.min(drawing.startX, drawing.currentX)}
             y={Math.min(drawing.startY, drawing.currentY)}
             width={Math.abs(deltaX)}
             height={Math.abs(deltaY)}
             type={drawing.tool as 'rectangle' | 'circle'}
           />
         )}
       </>
     )
   })()}
   ```

3. Consider adding line length tooltip for lines/arrows:
   ```typescript
   // Add for lines:
   {drawing.tool === 'line' && (
     <LineLengthTooltip
       x={drawing.startX + deltaX / 2}
       y={drawing.startY + deltaY / 2}
       length={Math.round(Math.sqrt(deltaX * deltaX + deltaY * deltaY))}
     />
   )}
   ```

## Testing
- Draw a rectangle: verify dimensions tooltip appears
- Draw a circle: verify dimensions tooltip appears
- Verify tooltip follows cursor appropriately
- Verify tooltip doesn't interfere with drawing

## Impact
Users can create more precisely sized shapes without guessing or creating then measuring. This improves accuracy and efficiency.
