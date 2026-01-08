# Shape Selection Priority

## Problem
When shapes overlap, clicking always selects the top-most shape. There's no way to access shapes underneath without moving the top one first.

## Solution
- Add cycle-through functionality: repeated clicks cycle through overlapping shapes
- Show outline on hover for shape preview before selection

## Files to Modify
- `src/components/canvas/Canvas.tsx`
- `src/utils/hitTest.ts`

## Implementation Steps

1. Track click cycle for overlapping shapes:
   ```typescript
   // In Canvas component
   const clickCycleRef = useRef<Map<string, number>>(new Map())

   const handleMouseDown = useCallback((e: React.MouseEvent) => {
     if (isPanningRef.current || currentTool === 'pan') {
       // ... existing pan logic ...
       return
     }

     if (!canvasRef.current) return

     const rect = canvasRef.current.getBoundingClientRect()
     const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

     if (currentTool === 'select-click') {
       // Find all shapes at click position
       const clickedShapes = shapes.filter(s =>
         hitTestPoint(s, x, y, viewport.zoom)
       )

       if (clickedShapes.length > 0) {
         // Determine cycle position
         const cycleKey = `${x.toFixed(0)}-${y.toFixed(0)}`
         const cyclePosition = clickCycleRef.current.get(cycleKey) || 0
         const selectedShape = clickedShapes[cyclePosition % clickedShapes.length]

         // Update cycle for next click
         clickCycleRef.current.set(cycleKey, cyclePosition + 1)

         // Select the shape
         if (!selection.shapeIds.includes(selectedShape.id)) {
           setSelection({ shapeIds: [selectedShape.id], selectionType: 'single' })
         }
         setDragStartPos({ x, y })
       } else {
         setSelection({ shapeIds: [], selectionType: 'none' })
         // Clear cycle for this position
         clickCycleRef.current.clear()
       }
       return
     }

     // ... rest of existing logic ...
   }, [currentTool, viewport, shapes, selection.shapeIds, startDrawing, setSelection])

   // Clear cycle on mouse up to prevent unintended cycling
   const handleMouseUp = useCallback((e: React.MouseEvent) => {
     clickCycleRef.current.clear()
     // ... rest of existing logic ...
   }, [...])
   ```

2. Add hover preview for shapes:
   ```typescript
   const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null)

   const handleMouseMove = useCallback((e: React.MouseEvent) => {
     // ... existing logic ...

     // Check for shape hover in select-click mode
     if (currentTool === 'select-click' && !dragStartPos) {
       const rect = canvasRef.current.getBoundingClientRect()
       const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

       const hoveredShape = shapes.find(s => hitTestPoint(s, x, y, viewport.zoom))
       setHoveredShapeId(hoveredShape?.id || null)
     }
   }, [currentTool, viewport, shapes])

   // Add hover preview in render
   {hoveredShapeId && !selection.shapeIds.includes(hoveredShapeId) && (
     <g className="pointer-events-none">
       <rect
         // ... shape bounds ...
         fill="none"
         stroke="#3B82F6"
         strokeWidth={2}
         strokeDasharray="4 2"
         opacity={0.5}
       />
     </g>
   )}
   ```

## Testing
- Create overlapping shapes
- Click once: verify top shape is selected
- Click again: verify next shape in stack is selected
- Move mouse over shapes: verify hover preview appears
- Click elsewhere: verify cycle is reset

## Impact
Users can access any shape in a stack without moving others, making it easier to work with complex diagrams.
