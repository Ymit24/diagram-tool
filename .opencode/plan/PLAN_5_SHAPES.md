# Stage 5: Shape System Foundation

## Overview
Implement the foundation for shapes: define shape components, create shape management system, and implement basic rectangle and circle shapes that can be created and rendered on canvas.

## Objectives
- Create shapes context for managing shape state
- Create reusable shape components (Rectangle, Circle)
- Implement shape creation on canvas
- Connect tool options panel to shape properties
- Create shape layer for rendering

## Steps

### 1. Create Shapes Context
Create `src/contexts/ShapesContext.tsx`:
```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Shape } from '@/types/shapes';

interface ShapesContextType {
  shapes: Shape[];
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  clearShapes: () => void;
}

const ShapesContext = createContext<ShapesContextType | undefined>(undefined);

export function ShapesProvider({ children }: { children: ReactNode }) {
  const [shapes, setShapes] = useState<Shape[]>([]);

  const addShape = useCallback((shape: Shape) => {
    setShapes((prev) => [...prev, shape]);
  }, []);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setShapes((prev) =>
      prev.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      )
    );
  }, []);

  const deleteShape = useCallback((id: string) => {
    setShapes((prev) => prev.filter((shape) => shape.id !== id));
  }, []);

  const clearShapes = useCallback(() => {
    setShapes([]);
  }, []);

  return (
    <ShapesContext.Provider
      value={{
        shapes,
        addShape,
        updateShape,
        deleteShape,
        clearShapes,
      }}
    >
      {children}
    </ShapesContext.Provider>
  );
}

export function useShapes() {
  const context = useContext(ShapesContext);
  if (!context) {
    throw new Error('useShapes must be used within ShapesProvider');
  }
  return context;
}
```

### 2. Create Rectangle Shape Component
Create `src/components/shapes/RectangleShape.tsx`:
```tsx
import { Rect } from 'react-konva';
import { Rectangle } from '@/types/shapes';

interface RectangleShapeProps {
  shape: Rectangle;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (shape: Rectangle) => void;
}

export default function RectangleShape({
  shape,
  isSelected,
  onSelect,
  onUpdate,
}: RectangleShapeProps) {
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
      onClick={onSelect}
      onTap={onSelect}
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

### 3. Create Circle Shape Component
Create `src/components/shapes/CircleShape.tsx`:
```tsx
import { Circle as KonvaCircle } from 'react-konva';
import { Circle } from '@/types/shapes';

interface CircleShapeProps {
  shape: Circle;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdate?: (shape: Circle) => void;
}

export default function CircleShape({
  shape,
  isSelected,
  onSelect,
  onUpdate,
}: CircleShapeProps) {
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
      onClick={onSelect}
      onTap={onSelect}
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

### 4. Create Shape Layer Component
Create `src/components/canvas/ShapeLayer.tsx`:
```tsx
import { useShapes } from '@/contexts/ShapesContext';
import RectangleShape from '../shapes/RectangleShape';
import CircleShape from '../shapes/CircleShape';

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
        return null;
      })}
    </>
  );
}
```

### 5. Update InfiniteCanvas to include ShapeLayer
Update `src/components/canvas/InfiniteCanvas.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useCanvas } from '@/contexts/CanvasContext';
import { useTool } from '@/contexts/ToolContext';
import GridBackground from './GridBackground';
import ShapeLayer from './ShapeLayer';

export default function InfiniteCanvas() {
  const { canvasState, setCanvasState, handleWheel } = useCanvas();
  const { activeTool } = useTool();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: any) => {
    const isMiddleClick = e.evt.button === 1;
    const isSpacePressed = e.evt.getModifierState('Space');

    if (isMiddleClick || (isSpacePressed && e.evt.button === 0)) {
      e.target.draggable(false);
      e.target.startDrag();
    }
  };

  const handleMouseMove = (e: any) => {
    const isMiddleClick = e.evt.buttons === 4;
    const isSpacePressed = e.evt.getModifierState('Space');

    if (isMiddleClick || (isSpacePressed && e.evt.buttons === 1)) {
      const newPos = {
        offsetX: canvasState.offsetX + e.evt.movementX,
        offsetY: canvasState.offsetY + e.evt.movementY,
      };
      setCanvasState(newPos);
    }
  };

  return (
    <div ref={containerRef} className="h-full w-full">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        scaleX={canvasState.scale}
        scaleY={canvasState.scale}
        offsetX={canvasState.offsetX}
        offsetY={canvasState.offsetY}
        draggable={activeTool === 'pan'}
        onDragEnd={(e) => {
          setCanvasState({
            ...canvasState,
            offsetX: e.target.x(),
            offsetY: e.target.y(),
          });
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          <GridBackground
            width={dimensions.width * 10}
            height={dimensions.height * 10}
            gridSize={20}
          />
        </Layer>
        <Layer>
          <ShapeLayer />
        </Layer>
      </Stage>
    </div>
  );
}
```

### 6. Update App to include ShapesProvider
Update `src/App.tsx`:
```tsx
import { ToolProvider } from '@/contexts/ToolContext';
import { CanvasProvider } from '@/contexts/CanvasContext';
import { ShapesProvider } from '@/contexts/ShapesContext';
import ToolBar from '@/components/tools/ToolBar';
import ToolOptionsPanel from '@/components/tools/ToolOptionsPanel';
import CanvasContainer from '@/components/canvas/CanvasContainer';

export default function App() {
  return (
    <ToolProvider>
      <CanvasProvider>
        <ShapesProvider>
          <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
            <ToolBar />
            <ToolOptionsPanel />
            <CanvasContainer />
          </div>
        </ShapesProvider>
      </CanvasProvider>
    </ToolProvider>
  );
}
```

### 7. Add Test Shape (temporary)
Add a test shape in `src/main.tsx` temporarily to verify rendering:
```tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { useShapes } from './contexts/ShapesContext';
import { Rectangle, generateId } from './utils/geometry';
import './index.css';

function TestApp() {
  const { addShape } = useShapes();

  useEffect(() => {
    // Add a test rectangle
    addShape({
      id: generateId(),
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#EF4444',
      stroke: '#000000',
      strokeWidth: 2,
    } as Rectangle);
  }, [addShape]);

  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>,
);
```

## Success Criteria
- [ ] ShapesContext created and working
- [ ] Rectangle component renders correctly
- [ ] Circle component renders correctly
- [ ] Shapes are draggable
- [ ] Shape position updates in state on drag
- [ ] Test rectangle appears on canvas
- [ ] Shapes render on top of grid

## Notes
- Shape components accept isSelected and onSelect props (for selection logic in Stage 7)
- Shapes use Konva's built-in draggable for movement
- Default colors provided for shapes
- Test shape will be removed when drawing tools implemented in Stage 6
