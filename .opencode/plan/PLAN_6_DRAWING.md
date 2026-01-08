# Stage 6: Drawing Tools

## Overview
Implement the drawing functionality for rectangle and circle tools. Users should be able to select a tool and draw shapes by clicking and dragging on the canvas.

## Objectives
- Implement drawing state management (isDrawing, startPoint)
- Create preview shape while drawing
- Finalize shape on mouse up
- Handle coordinate transformations (screen to canvas space)
- Support all shape tools (rectangle, circle)

## Steps

### 1. Extend Types for Drawing State
Update `src/types/tools.ts`:
```typescript
export type ToolType = 'select' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'pan';

export interface ToolState {
  activeTool: ToolType;
  isDrawing: boolean;
  isDragging: boolean;
  isPanning: boolean;
  startPoint?: { x: number; y: number };
}

export interface DrawingState {
  isDrawing: boolean;
  currentShape?: {
    type: ToolType;
    startPoint: { x: number; y: number };
    currentPoint: { x: number; y: number };
  };
}
```

### 2. Create Drawing Context
Create `src/contexts/DrawingContext.tsx`:
```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToolType, DrawingState } from '@/types/tools';
import { generateId } from '@/utils/geometry';

interface DrawingContextType {
  drawingState: DrawingState;
  startDrawing: (tool: ToolType, x: number, y: number) => void;
  updateDrawing: (x: number, y: number) => void;
  endDrawing: () => void;
  cancelDrawing: () => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export function DrawingProvider({ children }: { children: ReactNode }) {
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    currentShape: undefined,
  });

  const startDrawing = useCallback((tool: ToolType, x: number, y: number) => {
    setDrawingState({
      isDrawing: true,
      currentShape: {
        type: tool,
        startPoint: { x, y },
        currentPoint: { x, y },
      },
    });
  }, []);

  const updateDrawing = useCallback((x: number, y: number) => {
    setDrawingState((prev) => {
      if (!prev.currentShape) return prev;
      return {
        ...prev,
        currentShape: {
          ...prev.currentShape,
          currentPoint: { x, y },
        },
      };
    });
  }, []);

  const endDrawing = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      currentShape: undefined,
    });
  }, []);

  const cancelDrawing = useCallback(() => {
    setDrawingState({
      isDrawing: false,
      currentShape: undefined,
    });
  }, []);

  return (
    <DrawingContext.Provider
      value={{
        drawingState,
        startDrawing,
        updateDrawing,
        endDrawing,
        cancelDrawing,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
}

export function useDrawing() {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error('useDrawing must be used within DrawingProvider');
  }
  return context;
}
```

### 3. Create Preview Shape Component
Create `src/components/canvas/PreviewShape.tsx`:
```tsx
import { Rect, Circle as KonvaCircle } from 'react-konva';
import { DrawingState } from '@/types/tools';
import { COLOR_PALETTE } from '@/utils/colorPalette';

interface PreviewShapeProps {
  drawingState: DrawingState;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

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

  // Calculate shape dimensions
  const x = Math.min(startPoint.x, currentPoint.x);
  const y = Math.min(startPoint.y, currentPoint.y);
  const width = Math.abs(currentPoint.x - startPoint.x);
  const height = Math.abs(currentPoint.y - startPoint.y);

  if (type === 'rectangle') {
    return (
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={0.5}
      />
    );
  }

  if (type === 'circle') {
    const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
    const centerX = (startPoint.x + currentPoint.x) / 2;
    const centerY = (startPoint.y + currentPoint.y) / 2;

    return (
      <KonvaCircle
        x={centerX}
        y={centerY}
        radius={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={0.5}
      />
    );
  }

  return null;
}
```

### 4. Update InfiniteCanvas with Drawing Logic
Update `src/components/canvas/InfiniteCanvas.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useCanvas } from '@/contexts/CanvasContext';
import { useTool } from '@/contexts/ToolContext';
import { useDrawing } from '@/contexts/DrawingContext';
import { useShapes } from '@/contexts/ShapesContext';
import { Shape } from '@/types/shapes';
import { generateId } from '@/utils/geometry';
import GridBackground from './GridBackground';
import ShapeLayer from './ShapeLayer';
import PreviewShape from './PreviewShape';

export default function InfiniteCanvas() {
  const { canvasState, setCanvasState, handleWheel } = useCanvas();
  const { activeTool } = useTool();
  const { drawingState, startDrawing, updateDrawing, endDrawing } = useDrawing();
  const { addShape } = useShapes();
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

  // Screen to canvas coordinate transformation
  const screenToCanvas = (x: number, y: number) => {
    return {
      x: (x - canvasState.offsetX) / canvasState.scale,
      y: (y - canvasState.offsetY) / canvasState.scale,
    };
  };

  const handleMouseDown = (e: any) => {
    const isMiddleClick = e.evt.button === 1;
    const isSpacePressed = e.evt.getModifierState('Space');

    if (isMiddleClick || (isSpacePressed && e.evt.button === 0)) {
      // Panning
      return;
    }

    if (e.evt.button === 0 && (activeTool === 'rectangle' || activeTool === 'circle')) {
      // Start drawing
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        const canvasPos = screenToCanvas(pos.x, pos.y);
        startDrawing(activeTool, canvasPos.x, canvasPos.y);
      }
    }
  };

  const handleMouseMove = (e: any) => {
    const isMiddleClick = e.evt.buttons === 4;
    const isSpacePressed = e.evt.getModifierState('Space');

    if (isMiddleClick || (isSpacePressed && e.evt.buttons === 1)) {
      // Panning
      const newPos = {
        offsetX: canvasState.offsetX + e.evt.movementX,
        offsetY: canvasState.offsetY + e.evt.movementY,
      };
      setCanvasState(newPos);
      return;
    }

    if (drawingState.isDrawing) {
      // Update drawing preview
      const pos = e.target.getStage()?.getPointerPosition();
      if (pos) {
        const canvasPos = screenToCanvas(pos.x, pos.y);
        updateDrawing(canvasPos.x, canvasPos.y);
      }
    }
  };

  const handleMouseUp = () => {
    if (drawingState.isDrawing && drawingState.currentShape) {
      const { type, startPoint, currentPoint } = drawingState.currentShape;

      // Create final shape
      const shapeId = generateId();
      let newShape: Shape;

      if (type === 'rectangle') {
        const x = Math.min(startPoint.x, currentPoint.x);
        const y = Math.min(startPoint.y, currentPoint.y);
        const width = Math.abs(currentPoint.x - startPoint.x);
        const height = Math.abs(currentPoint.y - startPoint.y);

        newShape = {
          id: shapeId,
          type: 'rectangle',
          x,
          y,
          width,
          height,
          fill: '#3B82F6',
          stroke: '#000000',
          strokeWidth: 2,
        };
      } else if (type === 'circle') {
        const width = Math.abs(currentPoint.x - startPoint.x);
        const height = Math.abs(currentPoint.y - startPoint.y);
        const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
        const x = (startPoint.x + currentPoint.x) / 2;
        const y = (startPoint.y + currentPoint.y) / 2;

        newShape = {
          id: shapeId,
          type: 'circle',
          x,
          y,
          radius,
          fill: '#3B82F6',
          stroke: '#000000',
          strokeWidth: 2,
        };
      }

      if (newShape) {
        addShape(newShape);
      }
    }

    endDrawing();
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
        onMouseUp={handleMouseUp}
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
        <Layer>
          <PreviewShape drawingState={drawingState} />
        </Layer>
      </Stage>
    </div>
  );
}
```

### 5. Update App to include DrawingProvider
Update `src/App.tsx`:
```tsx
import { ToolProvider } from '@/contexts/ToolContext';
import { CanvasProvider } from '@/contexts/CanvasContext';
import { ShapesProvider } from '@/contexts/ShapesContext';
import { DrawingProvider } from '@/contexts/DrawingContext';
import ToolBar from '@/components/tools/ToolBar';
import ToolOptionsPanel from '@/components/tools/ToolOptionsPanel';
import CanvasContainer from '@/components/canvas/CanvasContainer';

export default function App() {
  return (
    <ToolProvider>
      <CanvasProvider>
        <DrawingProvider>
          <ShapesProvider>
            <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
              <ToolBar />
              <ToolOptionsPanel />
              <CanvasContainer />
            </div>
          </ShapesProvider>
        </DrawingProvider>
      </CanvasProvider>
    </ToolProvider>
  );
}
```

### 6. Remove Test Shape
Update `src/main.tsx` to remove test code:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

## Success Criteria
- [ ] DrawingContext created and working
- [ ] Selecting rectangle tool allows drawing rectangles
- [ ] Selecting circle tool allows drawing circles
- [ ] Preview shape appears while dragging
- [ ] Shape is finalized and added to state on mouse up
- [ ] Shapes are created at correct canvas coordinates
- [ ] Drawing works correctly with pan and zoom

## Notes
- Preview uses opacity 0.5 for visual feedback
- Shapes are created with default colors (will connect to options panel in Stage 10)
- Drawing is prevented when panning (space or middle-click)
- Coordinate transformation ensures shapes are placed correctly regardless of zoom/pan
