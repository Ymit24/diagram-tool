# Phase 6: Selection System

## Goal
Implement comprehensive selection system including click selection, move shapes, and box/lasso selection refinement.

## Steps

### 6.1 Selection Hit Testing
Create `src/utils/hitTest.ts`:

```typescript
import { DiagramShape } from '../types/diagram'

export function hitTestPoint(shape: DiagramShape, x: number, y: number): boolean {
  const padding = 5 // Tolerance for easier selection
  
  if (shape.type === 'circle') {
    const cx = shape.x + shape.width / 2
    const cy = shape.y + shape.height / 2
    const radius = shape.width / 2
    const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2))
    return distance <= radius + padding
  }
  
  // For rectangle, line, arrow
  return (
    x >= shape.x - padding &&
    x <= shape.x + shape.width + padding &&
    y >= shape.y - padding &&
    y <= shape.y + shape.height + padding
  )
}

export function hitTestBox(shape: DiagramShape, box: { x: number; y: number; width: number; height: number }): boolean {
  // Shape must be completely inside selection box
  return (
    shape.x >= box.x &&
    shape.y >= box.y &&
    shape.x + shape.width <= box.x + box.width &&
    shape.y + shape.height <= box.y + box.height
  )
}
```

### 6.2 Store Updates for Dragging
Add to `src/store/diagramStore.ts`:

```typescript
// Add to interface:
isDragging: boolean
dragOffsets: Record<string, { x: number; y: number }>

// Add to initial state:
isDragging: false,
dragOffsets: {},

// Add actions:
startDrag: (shapeIds: string[], x: number, y: number) => set((state) => {
  const offsets: Record<string, { x: number; y: number }> = {}
  shapeIds.forEach(id => {
    const shape = state.shapes.find(s => s.id === id)
    if (shape) {
      offsets[id] = { x: x - shape.x, y: y - shape.y }
    }
  })
  return { isDragging: true, dragOffsets: offsets, selection: { shapeIds, selectionType: 'multiple' } }
}),

updateDrag: (x: number, y: number) => set((state) => ({
  shapes: state.shapes.map(s => {
    const offset = state.dragOffsets?.[s.id]
    if (offset && state.selection.shapeIds.includes(s.id)) {
      return { ...s, x: x - offset.x, y: y - offset.y }
    }
    return s
  })
})),

endDrag: () => set({ isDragging: false, dragOffsets: {} }),
```

### 6.3 Canvas Drag Implementation
Update `Canvas.tsx` to handle shape dragging and selection tools.

### 6.4 Box Selection Logic
Implement box selection that selects shapes within the drawn rectangle.

### 6.5 Deselect on Click
Click empty canvas area to clear selection.

## Deliverable
- Click to select single shapes
- Drag to move selected shapes
- Box selection tool
- Deselect on empty space click

## Time Estimate
~35-40 minutes

## Dependencies
- Phase 5 complete

## Next Phase Preview
Phase 7 will add resize handles.
