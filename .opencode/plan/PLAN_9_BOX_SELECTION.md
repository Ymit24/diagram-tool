# Stage 9: Box and Lasso Selection

## Overview
Implement advanced selection tools: box selection (drag rectangle) and lasso selection (freehand polygon). Allow selecting multiple shapes at once.

## Objectives
- Implement box selection tool
- Implement lasso selection tool
- Detect shape intersection with selection area
- Update selection state
- Show selection preview during drag

## Steps

### 1. Update Tool Types
Update `src/types/tools.ts`:
```typescript
export type ToolType =
  | 'select'
  | 'box-select'
  | 'lasso-select'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'pan';

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LassoPoints {
  points: number[];
}
```

### 2. Extend Drawing Context for Selection Tools
Update `src/contexts/DrawingContext.tsx`:
```typescript
import { ToolType, DrawingState, SelectionBox, LassoPoints } from '@/types/tools';

interface DrawingContextType {
  drawingState: DrawingState;
  startDrawing: (tool: ToolType, x: number, y: number) => void;
  updateDrawing: (x: number, y: number) => void;
  endDrawing: () => void;
  cancelDrawing: () => void;
  selectionBox?: SelectionBox;
  lassoPoints?: LassoPoints;
}
```

Update state to include selection modes:
```typescript
const [drawingState, setDrawingState] = useState<DrawingState>({
  isDrawing: false,
  currentShape: undefined,
  isBoxSelecting: false,
  isLassoSelecting: false,
});
```

### 3. Create Geometry Utilities for Intersection Detection
Update `src/utils/geometry.ts`:
```typescript
import { Shape } from '@/types/shapes';

// ... existing functions

export function pointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

export function rectIntersectsRect(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

export function shapeIntersectsBox(
  shape: Shape,
  box: { x: number; y: number; width: number; height: number }
): boolean {
  if (shape.type === 'rectangle') {
    return rectIntersectsRect(
      shape.x,
      shape.y,
      shape.width,
      shape.height,
      box.x,
      box.y,
      box.width,
      box.height
    );
  }

  if (shape.type === 'circle') {
    const circleLeft = shape.x - shape.radius;
    const circleTop = shape.y - shape.radius;
    const circleWidth = shape.radius * 2;
    const circleHeight = shape.radius * 2;

    return rectIntersectsRect(
      circleLeft,
      circleTop,
      circleWidth,
      circleHeight,
      box.x,
      box.y,
      box.width,
      box.height
    );
  }

  if (shape.type === 'line' || shape.type === 'arrow') {
    // Check if either endpoint is in the box
    const [x1, y1, x2, y2] = shape.points;

    return (
      pointInRect(x1, y1, box.x, box.y, box.width, box.height) ||
      pointInRect(x2, y2, box.x, box.y, box.width, box.height)
    );
  }

  return false;
}

export function pointInPolygon(
  px: number,
  py: number,
  polygon: number[]
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 2; i < polygon.length; i += 2) {
    const xi = polygon[i];
    const yi = polygon[i + 1];
    const xj = polygon[j];
    const yj = polygon[j + 1];

    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);

    if (intersect) inside = !inside;
    j = i;
  }
  return inside;
}

export function shapeIntersectsLasso(
  shape: Shape,
  lasso: number[]
): boolean {
  if (shape.type === 'rectangle') {
    // Check all four corners
    const corners = [
      [shape.x, shape.y],
      [shape.x + shape.width, shape.y],
      [shape.x, shape.y + shape.height],
      [shape.x + shape.width, shape.y + shape.height],
    ];

    return corners.some(([x, y]) => pointInPolygon(x, y, lasso));
  }

  if (shape.type === 'circle') {
    // Check center and edge points
    const points = [
      [shape.x, shape.y],
      [shape.x + shape.radius, shape.y],
      [shape.x - shape.radius, shape.y],
      [shape.x, shape.y + shape.radius],
      [shape.x, shape.y - shape.radius],
    ];

    return points.some(([x, y]) => pointInPolygon(x, y, lasso));
  }

  if (shape.type === 'line' || shape.type === 'arrow') {
    const [x1, y1, x2, y2] = shape.points;
    return (
      pointInPolygon(x1, y1, lasso) || pointInPolygon(x2, y2, lasso)
    );
  }

  return false;
}
```

### 4. Create Selection Preview Component
Create `src/components/canvas/SelectionPreview.tsx`:
```tsx
import { Rect, Line as KonvaLine } from 'react-konva';
import { DrawingState } from '@/types/tools';

interface SelectionPreviewProps {
  drawingState: DrawingState;
}

export default function SelectionPreview({ drawingState }: SelectionPreviewProps) {
  if (!drawingState.isDrawing || !drawingState.currentShape) {
    return null;
  }

  const { type, startPoint, currentPoint } = drawingState.currentShape;

  if (type === 'box-select') {
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="#3B82F6"
        strokeWidth={2}
        fill="#3B82F6"
        fillOpacity={0.1}
        dash={[5, 5]}
      />
    );
  }

  if (type === 'lasso-select') {
    return (
      <KonvaLine
        points={[
          startPoint.x, startPoint.y,
          currentPoint.x, currentPoint.y,
        ]}
        stroke="#3B82F6"
        strokeWidth={2}
        lineCap="round"
        lineJoin="round"
        dash={[5, 5]}
      />
    );
  }

  return null;
}
```

### 5. Update ToolBar with Selection Modes
Update `src/components/tools/ToolBar.tsx`:
```tsx
const tools: { tool: ToolType; label: string; hotkey: string }[] = [
  { tool: 'select', label: 'Select', hotkey: 'V' },
  { tool: 'box-select', label: 'Box', hotkey: 'B' },
  { tool: 'lasso-select', label: 'Lasso', hotkey: 'L' },
  { tool: 'rectangle', label: 'Rectangle', hotkey: 'R' },
  { tool: 'circle', label: 'Circle', hotkey: 'O' },
  { tool: 'line', label: 'Line', hotkey: 'L' },
  { tool: 'arrow', label: 'Arrow', hotkey: 'A' },
  { tool: 'pan', label: 'Pan', hotkey: 'Space' },
];
```

### 6. Update InfiniteCanvas with Selection Logic
Update `src/components/canvas/InfiniteCanvas.tsx`:

Add import:
```tsx
import { useSelection } from '@/contexts/SelectionContext';
import { shapeIntersectsBox, shapeIntersectsLasso } from '@/utils/geometry';
```

Get shapes and selection:
```tsx
const { shapes } = useShapes();
const { selectShape, deselectAll } = useSelection();
```

Update handleMouseDown:
```tsx
if (e.evt.button === 0 && activeTool === 'select') {
  if (e.target === e.target.getStage()) {
    deselectAll();
    return;
  }
}

if (e.evt.button === 0 && (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line' || activeTool === 'arrow' || activeTool === 'box-select' || activeTool === 'lasso-select')) {
  const pos = e.target.getStage()?.getPointerPosition();
  if (pos) {
    const canvasPos = screenToCanvas(pos.x, pos.y);
    startDrawing(activeTool, canvasPos.x, canvasPos.y);
  }
}
```

Update handleMouseUp:
```tsx
if (drawingState.isDrawing && drawingState.currentShape) {
  const { type, startPoint, currentPoint } = drawingState.currentShape;

  if (type === 'box-select') {
    // Find intersecting shapes
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    const intersectingShapes = shapes.filter((shape) =>
      shapeIntersectsBox(shape, { x, y, width, height })
    );

    intersectingShapes.forEach((shape) => {
      selectShape(shape.id, true);
    });
  } else if (type === 'lasso-select') {
    // For now, use simple lasso (just start and end points)
    // Could be extended to collect all points during drag
    const lassoPoints = [
      startPoint.x, startPoint.y,
      currentPoint.x, startPoint.y,
      currentPoint.x, currentPoint.y,
      startPoint.x, currentPoint.y,
    ];

    const intersectingShapes = shapes.filter((shape) =>
      shapeIntersectsLasso(shape, lassoPoints)
    );

    intersectingShapes.forEach((shape) => {
      selectShape(shape.id, true);
    });
  } else {
    // Existing shape creation logic
    // ... (rectangle, circle, line, arrow)
  }
}

endDrawing();
```

### 7. Add Selection Preview Layer
Update Stage layers:
```tsx
<Layer>
  <ShapeLayer />
  <TransformerLayer />
  <SelectionPreview drawingState={drawingState} />
</Layer>
```

## Success Criteria
- [ ] Box selection tool works
- [ ] Shapes within selection box are selected
- [ ] Lasso selection tool works
- [ ] Shapes within lasso area are selected
- [ ] Selection preview shows during drag
- [ ] Multi-select accumulates selected shapes
- [ ] Existing click selection still works

## Notes
- Box selection uses dashed line preview
- Lasso selection simplified (uses 4 points) for basic implementation
- Can extend lasso to collect all drag points in future
- Selection is additive (uses multi-select logic)
