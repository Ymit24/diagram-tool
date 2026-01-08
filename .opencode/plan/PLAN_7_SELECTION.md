# Stage 7: Selection and Manipulation

## Overview
Implement shape selection functionality using Konva's Transformer component. Users should be able to click shapes to select them, see resize/rotate handles, and drag to move shapes.

## Objectives
- Create selection context for managing selected shapes
- Implement click selection (single and multi-select with modifier)
- Show Transformer handles for selected shapes
- Support shape dragging while selected
- Implement deselect on empty canvas click

## Steps

### 1. Create Selection Context
Create `src/contexts/SelectionContext.tsx`:
```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SelectionContextType {
  selectedIds: string[];
  selectShape: (id: string, multiSelect?: boolean) => void;
  deselectShape: (id: string) => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectShape = useCallback((id: string, multiSelect = false) => {
    setSelectedIds((prev) => {
      if (multiSelect) {
        // Toggle selection
        if (prev.includes(id)) {
          return prev.filter((selectedId) => selectedId !== id);
        }
        return [...prev, id];
      }
      // Single select
      return [id];
    });
  }, []);

  const deselectShape = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  return (
    <SelectionContext.Provider
      value={{
        selectedIds,
        selectShape,
        deselectShape,
        deselectAll,
        isSelected,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider');
  }
  return context;
}
```

### 2. Update Shape Components with Selection Support

Update `src/components/shapes/RectangleShape.tsx`:
```tsx
import { Rect } from 'react-konva';
import { Rectangle } from '@/types/shapes';
import { useSelection } from '@/contexts/SelectionContext';

interface RectangleShapeProps {
  shape: Rectangle;
  onUpdate?: (shape: Rectangle) => void;
}

export default function RectangleShape({
  shape,
  onUpdate,
}: RectangleShapeProps) {
  const { selectShape, deselectAll, isSelected } = useSelection();
  const selected = isSelected(shape.id);

  return (
    <Rect
      id={shape.id}
      x={shape.x}
      y={shape.y}
      width={shape.width}
      height={shape.height}
      fill={shape.fill || '#3B82F6'}
      stroke={shape.stroke || '#000000'}
      strokeWidth={shape.strokeWidth || 2}
      draggable
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
        onUpdate?.({
          ...shape,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    />
  );
}
```

Update `src/components/shapes/CircleShape.tsx`:
```tsx
import { Circle as KonvaCircle } from 'react-konva';
import { Circle } from '@/types/shapes';
import { useSelection } from '@/contexts/SelectionContext';

interface CircleShapeProps {
  shape: Circle;
  onUpdate?: (shape: Circle) => void;
}

export default function CircleShape({
  shape,
  onUpdate,
}: CircleShapeProps) {
  const { selectShape, isSelected } = useSelection();
  const selected = isSelected(shape.id);

  return (
    <KonvaCircle
      id={shape.id}
      x={shape.x}
      y={shape.y}
      radius={shape.radius}
      fill={shape.fill || '#3B82F6'}
      stroke={shape.stroke || '#000000'}
      strokeWidth={shape.strokeWidth || 2}
      draggable
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
        onUpdate?.({
          ...shape,
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    />
  );
}
```

### 3. Create Transformer Component
Create `src/components/canvas/TransformerLayer.tsx`:
```tsx
import { useRef, useEffect } from 'react';
import { Transformer } from 'react-konva';
import { useSelection } from '@/contexts/SelectionContext';
import { useShapes } from '@/contexts/ShapesContext';
import { Stage } from 'react-konva';

export default function TransformerLayer() {
  const trRef = useRef<any>(null);
  const { selectedIds, deselectAll } = useSelection();
  const { shapes, updateShape } = useShapes();

  // Find selected shape nodes
  useEffect(() => {
    if (selectedIds.length === 0 || !trRef.current) {
      return;
    }

    const stage = trRef.current?.getStage();
    if (!stage) return;

    const nodes: any[] = [];
    selectedIds.forEach((id) => {
      const node = stage.findOne(`#${id}`);
      if (node) {
        nodes.push(node);
      }
    });

    if (nodes.length > 0) {
      trRef.current.nodes(nodes);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds, shapes]);

  return (
    <Transformer
      ref={trRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Limit resize
        if (newBox.width < 5 || newBox.height < 5) {
          return oldBox;
        }
        return newBox;
      }}
      onTransformEnd={(e) => {
        // Update shape data after transform
        const nodes = trRef.current?.nodes() || [];
        nodes.forEach((node: any) => {
          const id = node.id();
          const shape = shapes.find((s) => s.id === id);
          if (shape) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Reset scale and update dimensions
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
    />
  );
}
```

### 4. Update InfiniteCanvas with Selection
Update `src/components/canvas/InfiniteCanvas.tsx` to handle deselect on empty click:

```tsx
// ... existing imports
import { useSelection } from '@/contexts/SelectionContext';

export default function InfiniteCanvas() {
  // ... existing code

  const { deselectAll } = useSelection();

  // ... existing code

  const handleMouseDown = (e: any) => {
    const isMiddleClick = e.evt.button === 1;
    const isSpacePressed = e.evt.getModifierState('Space');

    if (isMiddleClick || (isSpacePressed && e.evt.button === 0)) {
      return;
    }

    // Deselect on empty canvas click when using select tool
    if (e.evt.button === 0 && activeTool === 'select') {
      if (e.target === e.target.getStage()) {
        deselectAll();
        return;
      }
    }

    if (e.evt.button === 0 && (activeTool === 'rectangle' || activeTool === 'circle')) {
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        const canvasPos = screenToCanvas(pos.x, pos.y);
        startDrawing(activeTool, canvasPos.x, canvasPos.y);
      }
    }
  };

  // ... rest of the component
```

Add Transformer to Stage:

```tsx
<Layer>
  <ShapeLayer />
  <TransformerLayer />
</Layer>
```

### 5. Update App with SelectionProvider
Update `src/App.tsx`:
```tsx
import { ToolProvider } from '@/contexts/ToolContext';
import { CanvasProvider } from '@/contexts/CanvasContext';
import { ShapesProvider } from '@/contexts/ShapesContext';
import { DrawingProvider } from '@/contexts/DrawingContext';
import { SelectionProvider } from '@/contexts/SelectionContext';
import ToolBar from '@/components/tools/ToolBar';
import ToolOptionsPanel from '@/components/tools/ToolOptionsPanel';
import CanvasContainer from '@/components/canvas/CanvasContainer';

export default function App() {
  return (
    <ToolProvider>
      <CanvasProvider>
        <DrawingProvider>
          <ShapesProvider>
            <SelectionProvider>
              <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
                <ToolBar />
                <ToolOptionsPanel />
                <CanvasContainer />
              </div>
            </SelectionProvider>
          </ShapesProvider>
        </DrawingProvider>
      </CanvasProvider>
    </ToolProvider>
  );
}
```

## Success Criteria
- [ ] SelectionContext created and working
- [ ] Clicking a shape selects it
- [ ] Shift+click allows multi-selection
- [ ] Transformer handles appear on selected shapes
- [ ] Handles allow resizing shapes
- [ ] Shapes remain draggable while selected
- [ ] Clicking empty area deselects all shapes
- [ ] Shape dimensions update after resize

## Notes
- Transformer handles support resize and rotation
- Multi-select with Shift/Cmd key
- Click on shape prevents event bubbling to avoid deselect
- minimum size constraint (5px) prevents shapes from disappearing
