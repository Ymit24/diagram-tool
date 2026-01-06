# Phase 7: Resize Handles

## Goal
Add resize handles to selected shapes with drag-to-resize functionality.

## Steps

### 7.1 Resize Handle Types
Create `src/components/handles/ResizeHandles.tsx`:

```typescript
import { Circle } from '../shapes/Circle'

interface ResizeHandleProps {
  x: number
  y: number
  cursor: string
  onMouseDown: (e: React.MouseEvent, handle: string) => void
}

function ResizeHandle({ x, y, cursor, onMouseDown }: ResizeHandleProps) {
  return (
    <g 
      transform={`translate(${x}, ${y})`}
      style={{ cursor }}
      onMouseDown={(e) => onMouseDown(e, 'handle')}
    >
      <rect
        x={-4}
        y={-4}
        width={8}
        height={8}
        fill="white"
        stroke="#3B82F6"
        strokeWidth={1}
      />
    </g>
  )
}

export interface ResizeHandlesProps {
  shape: {
    x: number
    y: number
    width: number
    height: number
    type: string
    x2?: number
    y2?: number
  }
  onResizeStart: (e: React.MouseEvent, handle: string) => void
}

export function ResizeHandles({ shape, onResizeStart }: ResizeHandlesProps) {
  const handles = []
  
  if (shape.type === 'line' || shape.type === 'arrow') {
    // Line/arrow: endpoints only
    handles.push(
      <ResizeHandle
        key="start"
        x={0}
        y={0}
        cursor="nwse-resize"
        onMouseDown={onResizeStart}
      />,
      <ResizeHandle
        key="end"
        x={shape.x2 || shape.width}
        y={shape.y2 || shape.height}
        cursor="nwse-resize"
        onMouseDown={onResizeStart}
      />
    )
  } else {
    // Rectangle/circle: 8 handles
    const { x, y, width, height } = shape
    const positions = [
      { x: x, y: y, cursor: 'nw-resize' },           // top-left
      { x: x + width / 2, y: y, cursor: 'n-resize' }, // top-center
      { x: x + width, y: y, cursor: 'ne-resize' },    // top-right
      { x: x + width, y: y + height / 2, cursor: 'e-resize' }, // right
      { x: x + width, y: y + height, cursor: 'se-resize' }, // bottom-right
      { x: x + width / 2, y: y + height, cursor: 's-resize' }, // bottom-center
      { x: x, y: y + height, cursor: 'sw-resize' }, // bottom-left
      { x: x, y: y + height / 2, cursor: 'w-resize' }, // left
    ]
    
    positions.forEach((pos, i) => (
      <ResizeHandle
        key={i}
        x={pos.x}
        y={pos.y}
        cursor={pos.cursor}
        onMouseDown={onResizeStart}
      />
    ))
  }
  
  return <g>{handles}</g>
}
```

### 7.2 Resize Logic in Store
Add to `src/store/diagramStore.ts`:

```typescript
// Add to interface:
resizingShapeId: string | null
resizeHandle: string | null
resizeStartShape: DiagramShape | null

// Add to initial state:
resizingShapeId: null,
resizeHandle: null,
resizeStartShape: null,

// Add actions:
startResize: (shapeId: string, handle: string) => set((state) => {
  const shape = state.shapes.find(s => s.id === shapeId)
  return {
    resizingShapeId: shapeId,
    resizeHandle: handle,
    resizeStartShape: shape || null
  }
}),

updateResize: (currentX: number, currentY: number) => set((state) => {
  if (!state.resizeStartShape || !state.resizingShapeId) return {}
  
  const startShape = state.resizeStartShape
  const dx = currentX - startShape.x
  const dy = currentY - startShape.y
  
  // Calculate new dimensions based on handle
  // ... handle-specific resize logic
  
  return {
    shapes: state.shapes.map(s => {
      if (s.id !== state.resizingShapeId) return s
      // Apply resize calculations
      return { ...s, /* updated */ }
    })
  }
}),

endResize: () => set({
  resizingShapeId: null,
  resizeHandle: null,
  resizeStartShape: null,
}),
```

### 7.3 Connect Resize to Canvas
Update `Canvas.tsx` to handle resize operations:

```typescript
const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
  e.stopPropagation()
  if (selection.shapeIds.length === 1) {
    startResize(selection.shapeIds[0], handle)
  }
}, [selection, startResize])
```

### 7.4 Shape Renderer with Handles
Update `ShapeRenderer.tsx`:

```typescript
export function ShapeRenderer({ shape, selected, onClick }: ShapeRendererProps) {
  const Component = getShapeComponent(shape.type)
  
  return (
    <g>
      <Component shape={shape} onClick={onClick} />
      {selected && (
        <ResizeHandles
          shape={shape}
          onResizeStart={(e) => {
            // Pass to canvas handler
          }}
        />
      )}
    </g>
  )
}
```

## Deliverable
- 8 resize handles on rectangles/circles
- 2 endpoint handles on lines/arrows
- Drag handles to resize in any direction
- Real-time preview during resize

## Time Estimate
~40-45 minutes

## Dependencies
- Phase 6 complete

## Next Phase Preview
Phase 8 will implement the tool options panel with styling controls.
