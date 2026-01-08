# Stage 8: Line and Arrow Tools

## Overview
Implement line and arrow tools. These differ from rectangle/circle because they have two endpoints rather than a bounding box.

## Objectives
- Create Line shape component
- Create Arrow shape component
- Implement line/arrow drawing
- Add arrow head marker
- Support dragging endpoints

## Steps

### 1. Update Shape Types
Update `src/types/shapes.ts` to add more line properties:
```typescript
export interface Line extends BaseShape {
  type: 'line';
  points: number[]; // [x1, y1, x2, y2]
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'bevel' | 'round' | 'miter';
}

export interface Arrow extends BaseShape {
  type: 'arrow';
  points: number[]; // [x1, y1, x2, y2]
  arrowHeadLength?: number;
  arrowHeadWidth?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'bevel' | 'round' | 'miter';
}
```

### 2. Create Line Shape Component
Create `src/components/shapes/LineShape.tsx`:
```tsx
import { Line as KonvaLine, Arrow as KonvaArrow } from 'react-konva';
import { Line, Arrow } from '@/types/shapes';
import { useSelection } from '@/contexts/SelectionContext';

interface LineShapeProps {
  shape: Line | Arrow;
  onUpdate?: (shape: Line | Arrow) => void;
}

export default function LineShape({
  shape,
  onUpdate,
}: LineShapeProps) {
  const { selectShape, isSelected } = useSelection();
  const selected = isSelected(shape.id);

  const isArrow = shape.type === 'arrow';

  return (
    <KonvaLine
      id={shape.id}
      points={shape.points}
      stroke={shape.stroke || '#000000'}
      strokeWidth={shape.strokeWidth || 2}
      lineCap={shape.lineCap || 'round'}
      lineJoin={shape.lineJoin || 'round'}
      draggable
      hitStrokeWidth={10} // Easier to click thin lines
      onClick={(e) => {
        e.cancelBubble = true;
        const multiSelect = e.evt.getModifierState('Shift') || e.evt.getModifierState('Meta');
        selectShape(shape.id, multiSelect);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        const multiSelect = e.evt.getModifierState('Shift') || e.evt.getModifierState('Meta');
        selectShape(shape.id, multiSelect);
      }}
      onDragStart={(e) => {
        e.cancelBubble = true;
      }}
      onDragEnd={(e) => {
        const dx = e.target.x();
        const dy = e.target.y();

        // Update line points by offset
        const newPoints = shape.points.map((point, index) => {
          return point + (index % 2 === 0 ? dx : dy);
        });

        e.target.x(0);
        e.target.y(0);

        onUpdate?.({
          ...shape,
          points: newPoints,
        });
      }}
    />
  );
}
```

### 3. Create Arrow Shape Component
Create `src/components/shapes/ArrowShape.tsx`:
```tsx
import { Arrow as KonvaArrow } from 'react-konva';
import { Arrow } from '@/types/shapes';
import { useSelection } from '@/contexts/SelectionContext';

interface ArrowShapeProps {
  shape: Arrow;
  onUpdate?: (shape: Arrow) => void;
}

export default function ArrowShape({
  shape,
  onUpdate,
}: ArrowShapeProps) {
  const { selectShape, isSelected } = useSelection();
  const selected = isSelected(shape.id);

  return (
    <KonvaArrow
      id={shape.id}
      points={shape.points}
      pointerLength={shape.arrowHeadLength || 20}
      pointerWidth={shape.arrowHeadWidth || 20}
      stroke={shape.stroke || '#000000'}
      strokeWidth={shape.strokeWidth || 2}
      fill={shape.stroke || '#000000'}
      lineCap={shape.lineCap || 'round'}
      lineJoin={shape.lineJoin || 'round'}
      draggable
      hitStrokeWidth={10}
      onClick={(e) => {
        e.cancelBubble = true;
        const multiSelect = e.evt.getModifierState('Shift') || e.evt.getModifierState('Meta');
        selectShape(shape.id, multiSelect);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        const multiSelect = e.evt.getModifierState('Shift') || e.evt.getModifierState('Meta');
        selectShape(shape.id, multiSelect);
      }}
      onDragStart={(e) => {
        e.cancelBubble = true;
      }}
      onDragEnd={(e) => {
        const dx = e.target.x();
        const dy = e.target.y();

        const newPoints = shape.points.map((point, index) => {
          return point + (index % 2 === 0 ? dx : dy);
        });

        e.target.x(0);
        e.target.y(0);

        onUpdate?.({
          ...shape,
          points: newPoints,
        });
      }}
    />
  );
}
```

### 4. Update PreviewShape for Lines and Arrows
Update `src/components/canvas/PreviewShape.tsx`:
```tsx
import { Rect, Circle as KonvaCircle, Line as KonvaLine, Arrow as KonvaArrow } from 'react-konva';
// ... existing imports

export default function PreviewShape({
  drawingState,
  fillColor = '#3B82F6',
  strokeColor = '#000000',
  strokeWidth = 2,
}: PreviewShapeProps) {
  if (!drawingState.isDrawing || !drawingState.currentShape) {
    return null;
  }

  const { type, startPoint, currentPoint } = drawingState.currentShape;

  if (type === 'rectangle') {
    // ... existing rectangle code
  }

  if (type === 'circle') {
    // ... existing circle code
  }

  if (type === 'line') {
    return (
      <KonvaLine
        points={[startPoint.x, startPoint.y, currentPoint.x, currentPoint.y]}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={0.5}
        lineCap="round"
        lineJoin="round"
      />
    );
  }

  if (type === 'arrow') {
    return (
      <KonvaArrow
        points={[startPoint.x, startPoint.y, currentPoint.x, currentPoint.y]}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill={strokeColor}
        opacity={0.5}
        pointerLength={20}
        pointerWidth={20}
        lineCap="round"
        lineJoin="round"
      />
    );
  }

  return null;
}
```

### 5. Update ShapeLayer to Include Lines and Arrows
Update `src/components/canvas/ShapeLayer.tsx`:
```tsx
import { useShapes } from '@/contexts/ShapesContext';
import RectangleShape from '../shapes/RectangleShape';
import CircleShape from '../shapes/CircleShape';
import LineShape from '../shapes/LineShape';
import ArrowShape from '../shapes/ArrowShape';

export default function ShapeLayer() {
  const { shapes, updateShape } = useShapes();

  return (
    <>
      {shapes.map((shape) => {
        if (shape.type === 'rectangle') {
          return (
            <RectangleShape
              key={shape.id}
              shape={shape}
              onUpdate={updateShape}
            />
          );
        }
        if (shape.type === 'circle') {
          return (
            <CircleShape
              key={shape.id}
              shape={shape}
              onUpdate={updateShape}
            />
          );
        }
        if (shape.type === 'line') {
          return (
            <LineShape
              key={shape.id}
              shape={shape}
              onUpdate={updateShape}
            />
          );
        }
        if (shape.type === 'arrow') {
          return (
            <ArrowShape
              key={shape.id}
              shape={shape}
              onUpdate={updateShape}
            />
          );
        }
        return null;
      })}
    </>
  );
}
```

### 6. Update InfiniteCanvas to Support Line/Arrow Drawing
Update `src/components/canvas/InfiniteCanvas.tsx` handleMouseUp:
```tsx
const handleMouseUp = () => {
  if (drawingState.isDrawing && drawingState.currentShape) {
    const { type, startPoint, currentPoint } = drawingState.currentShape;

    const shapeId = generateId();
    let newShape: Shape;

    if (type === 'rectangle') {
      // ... existing rectangle code
    } else if (type === 'circle') {
      // ... existing circle code
    } else if (type === 'line') {
      newShape = {
        id: shapeId,
        type: 'line',
        x: 0,
        y: 0,
        points: [startPoint.x, startPoint.y, currentPoint.x, currentPoint.y],
        stroke: '#000000',
        strokeWidth: 2,
        lineCap: 'round',
        lineJoin: 'round',
      };
    } else if (type === 'arrow') {
      newShape = {
        id: shapeId,
        type: 'arrow',
        x: 0,
        y: 0,
        points: [startPoint.x, startPoint.y, currentPoint.x, currentPoint.y],
        stroke: '#000000',
        strokeWidth: 2,
        arrowHeadLength: 20,
        arrowHeadWidth: 20,
        lineCap: 'round',
        lineJoin: 'round',
      };
    }

    if (newShape) {
      addShape(newShape);
    }
  }

  endDrawing();
};
```

Update handleMouseDown to support line/arrow:
```tsx
if (e.evt.button === 0 && (activeTool === 'rectangle' || activeTool === 'circle' || activeTool === 'line' || activeTool === 'arrow')) {
  const pos = e.target.getStage()?.getPointerPosition();
  if (pos) {
    const canvasPos = screenToCanvas(pos.x, pos.y);
    startDrawing(activeTool, canvasPos.x, canvasPos.y);
  }
}
```

### 7. Update Transformer for Line Support
Update `src/components/canvas/TransformerLayer.tsx` to handle lines (lines can't be transformed the same way, so we may need custom endpoint handles):

```tsx
onTransformEnd={(e) => {
  const nodes = trRef.current?.nodes() || [];
  nodes.forEach((node: any) => {
    const id = node.id();
    const shape = shapes.find((s) => s.id === id);
    if (shape && shape.type !== 'line' && shape.type !== 'arrow') {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      const updates: any = {
        x: node.x(),
        y: node.y(),
      };

      if (shape.type === 'rectangle') {
        updates.width = Math.max(5, node.width() * scaleX);
        updates.height = Math.max(5, node.height() * scaleY);
      } else if (shape.type === 'circle') {
        updates.radius = Math.max(5, node.radius() * scaleX);
      }

      updateShape(id, updates);
    }
  });
}}
```

## Success Criteria
- [ ] Line tool creates lines
- [ ] Arrow tool creates arrows with arrowhead
- [ ] Lines and arrows are draggable
- [ ] Lines and arrows can be selected
- [ ] Preview appears while drawing
- [ ] Lines and arrows render correctly

## Notes
- Lines use hitStrokeWidth for easier selection
- Arrow head is drawn by KonvaArrow component
- Lines/Arrows don't support transform resizing yet (would need custom endpoint handles)
- Can add endpoint handles in future stage if needed
