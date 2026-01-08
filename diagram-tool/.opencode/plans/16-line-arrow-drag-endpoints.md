# Line/Arrow Drag Endpoints

## Problem
Lines and arrows can only be resized via resize handles. Users expect to be able to grab the endpoint and drag it directly.

## Solution
- Allow dragging line/arrow endpoints by grabbing near the endpoint
- Show cursor change when hovering near endpoints
- Make line manipulation more intuitive

## Files to Modify
- `src/components/canvas/Canvas.tsx`
- `src/utils/hitTest.ts`

## Implementation Steps

1. Add endpoint hit testing:
   ```typescript
   // In src/utils/hitTest.ts
   export function hitTestLineEndpoint(
     shape: DiagramShape,
     x: number,
     y: number,
     endpoint: 'start' | 'end',
     zoom: number = 1
   ): boolean {
     if (shape.type !== 'line' && shape.type !== 'arrow') return false

     const hitRadius = 10 / Math.sqrt(zoom)
     const endpointX = endpoint === 'start'
       ? shape.x
       : shape.x + (shape.x2 || 0)
     const endpointY = endpoint === 'start'
       ? shape.y
       : shape.y + (shape.y2 || 0)

     const distance = Math.sqrt(
       Math.pow(x - endpointX, 2) + Math.pow(y - endpointY, 2)
     )

     return distance <= hitRadius
   }
   ```

2. Track which endpoint is being hovered:
   ```typescript
   // In Canvas component
   const [hoveredEndpoint, setHoveredEndpoint] = useState<{
     shapeId: string
     endpoint: 'start' | 'end'
   } | null>(null)

   const handleMouseMove = useCallback((e: React.MouseEvent) => {
     // ... existing logic ...

     // Check for endpoint hover in select-click mode
     if (currentTool === 'select-click' && !dragStartPos) {
       const rect = canvasRef.current.getBoundingClientRect()
       const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

       for (const shape of shapes) {
         if (shape.type === 'line' || shape.type === 'arrow') {
           if (hitTestLineEndpoint(shape, x, y, 'start', viewport.zoom)) {
             setHoveredEndpoint({ shapeId: shape.id, endpoint: 'start' })
             return
           }
           if (hitTestLineEndpoint(shape, x, y, 'end', viewport.zoom)) {
             setHoveredEndpoint({ shapeId: shape.id, endpoint: 'end' })
             return
           }
         }
       }
       setHoveredEndpoint(null)
     }
   }, [currentTool, viewport, shapes])
   ```

3. Update cursor based on hovered endpoint:
   ```typescript
   const getCursor = () => {
     // ... existing cursor logic ...

     if (hoveredEndpoint) {
       return 'cursor-crosshair'
     }

     // ... rest of logic ...
   }
   ```

4. Implement endpoint dragging:
   ```typescript
   const [draggingEndpoint, setDraggingEndpoint] = useState<{
     shapeId: string
     endpoint: 'start' | 'end'
   } | null>(null)

   const handleMouseDown = useCallback((e: React.MouseEvent) => {
     // ... existing logic ...

     if (currentTool === 'select-click' && hoveredEndpoint) {
       e.stopPropagation()
       setDraggingEndpoint(hoveredEndpoint)
       setDragStartPos({ x, y })
       return
     }

     // ... rest of existing logic ...
   }, [currentTool, hoveredEndpoint, ...])

   const handleMouseMove = useCallback((e: React.MouseEvent) => {
     if (draggingEndpoint) {
       const rect = canvasRef.current.getBoundingClientRect()
       const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

       const dx = x - dragStartPos.x
       const dy = y - dragStartPos.y

      const shape = shapes.find(s => s.id === draggingEndpoint.shapeId)
      if (shape && (shape.type === 'line' || shape.type === 'arrow')) {
         if (draggingEndpoint.endpoint === 'start') {
           updateShape(shape.id, {
             x: shape.x + dx,
             y: shape.y + dy
           })
         } else {
           updateShape(shape.id, {
             x2: (shape.x2 || 0) + dx,
             y2: (shape.y2 || 0) + dy
           })
         }
       }

       setDragStartPos({ x, y })
       return
     }

     // ... rest of existing logic ...
   }, [draggingEndpoint, shapes, updateShape, ...])

   const handleMouseUp = useCallback((e: React.MouseEvent) => {
     setDraggingEndpoint(null)
     // ... rest of existing logic ...
   }, [...])
   ```

5. Add visual indicator for hovered endpoint:
   ```typescript
   // In render, add endpoint indicators
   {hoveredEndpoint && (
     <g className="pointer-events-none">
       <circle
         cx={endpointX}
         cy={endpointY}
         r={6 / viewport.zoom}
         fill="#3B82F6"
         opacity={0.5}
       />
     </g>
   )}
   ```

## Testing
- Hover near line endpoint: verify cursor changes and endpoint highlights
- Drag endpoint: verify line endpoint moves with cursor
- Drag both endpoints: verify both work independently
- Verify resize handles still work alongside endpoint dragging

## Impact
Users can manipulate lines and arrows more intuitively by grabbing endpoints directly, matching mental model from other design tools.
