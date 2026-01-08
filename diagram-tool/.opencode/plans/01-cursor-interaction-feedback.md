# Cursor & Interaction Feedback

## Problem
The canvas cursor always shows as a `crosshair` even when using selection tools. This creates confusion for users about which mode they're in.

## Solution
Use context-aware cursors:
- `default` cursor for selection tools (select-click, select-box, select-lasso)
- `crosshair` cursor only for drawing tools (rectangle, circle, line, arrow)
- `grab`/`grabbing` cursor for pan tool
- `move` cursor when hovering over selected shapes
- Appropriate resize cursors when hovering over resize handles

## Files to Modify
- `src/components/canvas/Canvas.tsx`

## Implementation Steps

1. Add cursor state based on current tool:
   ```typescript
   const getCursor = () => {
     if (isPanningRef.current || currentTool === 'pan') return 'cursor-grab active:cursor-grabbing'
     if (['select-click', 'select-box', 'select-lasso'].includes(currentTool)) {
       return 'cursor-default'
     }
     return 'cursor-crosshair'
   }
   ```

2. Update SVG cursor className to use the computed cursor:
   ```typescript
   className={clsx(
     'w-full h-full',
     getCursor()
   )}
   ```

3. Add dynamic cursor for shapes (optional enhancement):
   - When hovering over a shape in select mode: `cursor-move`
   - When hovering over resize handles: already handled by ResizeHandles component

## Testing
- Verify cursor changes when switching between select and drawing tools
- Verify cursor shows as grab when pan tool is active
- Verify cursor shows as grabbing when panning with spacebar

## Impact
Users will instantly understand which tool is active, reducing cognitive load and improving the overall feel of the tool.
