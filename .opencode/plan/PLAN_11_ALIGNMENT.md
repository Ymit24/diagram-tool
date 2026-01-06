# Alignment Features

## Goal
Add shape alignment and distribution commands for organizing selected shapes.

## Alignment Types

### Basic Alignment (8 options)
| Operation | Description | Shortcut |
|-----------|-------------|----------|
| Align Left | Left edges to leftmost shape | `Ctrl+Alt+L` |
| Align Center | Centers to vertical axis | `Ctrl+Alt+C` |
| Align Right | Right edges to rightmost shape | `Ctrl+Alt+R` |
| Align Top | Top edges to topmost shape | `Ctrl+Alt+T` |
| Align Middle | Horizontally centered | `Ctrl+Alt+M` |
| Align Bottom | Bottom edges to bottommost shape | `Ctrl+Alt+B` |
| Distribute Horizontally | Equal horizontal spacing | `Ctrl+Alt+Shift+H` |
| Distribute Vertically | Equal vertical spacing | `Ctrl+Alt+Shift+V` |

### Reference Options
- **First Selected**: Use first shape as reference (default)
- **Last Selected**: Use last shape as reference
- **Bounding Box**: Use overall selection bounding box

## Steps

### 11.1 Add Alignment Utility Functions
Create `src/utils/alignment.ts`:
```typescript
export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  centerX: number
  centerY: number
  width: number
  height: number
}

export function getBoundingBox(shapes: DiagramShape[]): BoundingBox {
  const bounds = shapes.reduce((acc, shape) => ({
    minX: Math.min(acc.minX, shape.x),
    minY: Math.min(acc.minY, shape.y),
    maxX: Math.max(acc.maxX, shape.x + shape.width),
    maxY: Math.max(acc.maxY, shape.y + shape.height),
  }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })

  return {
    ...bounds,
    centerX: (bounds.minX + bounds.maxX) / 2,
    centerY: (bounds.minY + bounds.maxY) / 2,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  }
}

export function alignLeft(shapes: DiagramShape[], reference: BoundingBox): Partial<DiagramShape>[]
export function alignCenter(shapes: DiagramShape[], reference: BoundingBox): Partial<DiagramShape>[]
// ... etc for all alignment types
```

### 11.2 Add Alignment Actions to Store
Add to `DiagramState` in `src/store/diagramStore.ts`:
```typescript
alignShapes: (alignment: AlignmentType) => void
distributeShapes: (distribution: DistributionType) => void
```

Implementation:
```typescript
alignShapes: (alignment) => set((state) => {
  if (state.selection.shapeIds.length < 2) return state

  const selectedShapes = state.shapes.filter(s => state.selection.shapeIds.includes(s.id))
  const bounds = getBoundingBox(selectedShapes)

  const updates: Record<string, Partial<DiagramShape>> = {}
  selectedShapes.forEach(shape => {
    switch (alignment) {
      case 'left':
        updates[shape.id] = { x: bounds.minX }
        break
      case 'center':
        updates[shape.id] = { x: bounds.centerX - shape.width / 2 }
        break
      case 'right':
        updates[shape.id] = { x: bounds.maxX - shape.width }
        break
      // ... etc
    }
  })

  const entry = recordHistory(state, 'update', `Align ${alignment}`)
  return {
    shapes: state.shapes.map(s => updates[s.id] ? { ...s, ...updates[s.id] } : s) as DiagramShape[],
    past: [...state.past, entry].slice(-MAX_HISTORY),
    future: [],
  }
}),
```

### 11.3 Create Alignment Toolbar Component
Create `src/components/toolbar/AlignmentToolbar.tsx`:
- 2x4 grid of alignment buttons (horizontal row, vertical row)
- Only visible when 2+ shapes selected
- Buttons disabled when < 2 shapes selected
- Icon-based buttons with tooltips

Icons (using simple SVG):
- Align Left: `|←|`
- Align Center: `|↔|`
- Align Right: `|→|`
- Align Top: `↑`
- Align Middle: `↕`
- Align Bottom: `↓`
- Distribute H: `≡` with arrows
- Distribute V: `≡` with arrows

### 11.4 Add Alignment Toolbar to TopToolbar
- Add after the selection/drawing tool groups
- Only show when `selection.shapeIds.length >= 2`
- Conditionally render entire group

### 11.5 Add Keyboard Shortcuts
Update `src/hooks/useHotkeys.ts`:
```typescript
if (e.ctrlKey && e.altKey) {
  switch (e.key) {
    case 'l': alignShapes('left'); break
    case 'c': alignShapes('center'); break
    case 'r': alignShapes('right'); break
    case 't': alignShapes('top'); break
    case 'm': alignShapes('middle'); break
    case 'b': alignShapes('bottom'); break
  }
}
if (e.ctrlKey && e.altKey && e.shiftKey) {
  switch (e.key) {
    case 'h': distributeShapes('horizontal'); break
    case 'v': distributeShapes('vertical'); break
  }
}
```

### 11.6 Update Help Modal
Add alignment shortcuts to HotkeyHelp component.

## Implementation Notes

### Handling Lines/Arrows
Lines and arrows have `x2, y2` instead of width/height. For alignment:
- Use center point for positioning
- For lines: calculate centerX = x + x2/2, centerY = y + y2/2
- Adjust both start point and endpoint when aligning

### Bounding Box Calculation
```typescript
function getShapeBounds(shape: DiagramShape): { x: number; y: number; width: number; height: number } {
  if (shape.type === 'line' || shape.type === 'arrow') {
    return {
      x: Math.min(shape.x, shape.x + shape.x2),
      y: Math.min(shape.y, shape.y + shape.y2),
      width: Math.abs(shape.x2),
      height: Math.abs(shape.y2),
    }
  }
  return { x: shape.x, y: shape.y, width: shape.width, height: shape.height }
}
```

## Deliverable
- 8 alignment/distribution operations
- Visual toolbar with alignment buttons
- Keyboard shortcuts (Ctrl+Alt+Arrow keys)
- Undo/redo support for all alignment operations
- Proper handling of lines/arrows

## Time Estimate
~45-60 minutes

## Dependencies
- Phase 10 (Undo/Redo) complete

## Next Phase Preview
Phase 12 could add JSON save/load for diagram persistence.
