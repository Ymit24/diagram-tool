# Stage 4: Canvas Basics - Pan and Zoom

## Overview
Implement infinite canvas functionality with pan (middle-click or space+drag) and zoom (mouse wheel). This creates the foundation for an infinite canvas experience.

## Objectives
- Create CanvasContext for managing canvas state (scale, offset)
- Implement pan functionality (middle-click, space+drag)
- Implement zoom functionality (mouse wheel with cursor anchor)
- Create visual grid background for reference
- Handle window resize

## Steps

### 1. Create Canvas Context
Create `src/contexts/CanvasContext.tsx`:
```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CanvasState } from '@/types/canvas';

interface CanvasContextType {
  canvasState: CanvasState;
  setCanvasState: (state: CanvasState) => void;
  handleWheel: (e: WheelEvent) => void;
  resetCanvas: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const stage = window as any;
    if (!stage) return;

    // Calculate new scale
    const scaleBy = 1.1;
    const oldScale = canvasState.scale;
    const newScale = e.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit zoom range
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    // Calculate pointer position
    const pointerX = e.clientX;
    const pointerY = e.clientY;

    // Calculate new offset to keep pointer at same screen position
    const newOffsetX = pointerX - (pointerX - canvasState.offsetX) * (clampedScale / oldScale);
    const newOffsetY = pointerY - (pointerY - canvasState.offsetY) * (clampedScale / oldScale);

    setCanvasState({
      scale: clampedScale,
      offsetX: newOffsetX,
      offsetY: newOffsetY,
    });
  }, [canvasState]);

  const resetCanvas = useCallback(() => {
    setCanvasState({
      scale: 1,
      offsetX: 0,
      offsetY: 0,
    });
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        canvasState,
        setCanvasState,
        handleWheel,
        resetCanvas,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within CanvasProvider');
  }
  return context;
}
```

### 2. Create Grid Background Component
Create `src/components/canvas/GridBackground.tsx`:
```tsx
import { Rect } from 'react-konva';

interface GridBackgroundProps {
  width: number;
  height: number;
  gridSize?: number;
}

export default function GridBackground({ width, height, gridSize = 20 }: GridBackgroundProps) {
  // Create grid lines
  const gridLines = [];

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    gridLines.push(
      <Rect
        key={`v-${x}`}
        x={x}
        y={0}
        width={1}
        height={height}
        fill="#E5E7EB"
        listening={false}
      />
    );
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    gridLines.push(
      <Rect
        key={`h-${y}`}
        x={0}
        y={y}
        width={width}
        height={1}
        fill="#E5E7EB"
        listening={false}
      />
    );
  }

  return <>{gridLines}</>;
}
```

### 3. Create Infinite Canvas Component
Create `src/components/canvas/InfiniteCanvas.tsx`:
```tsx
import { useEffect, useRef, useState } from 'react';
import { Stage, Layer } from 'react-konva';
import { useCanvas } from '@/contexts/CanvasContext';
import { useTool } from '@/contexts/ToolContext';
import GridBackground from './GridBackground';

export default function InfiniteCanvas() {
  const { canvasState, setCanvasState, handleWheel } = useCanvas();
  const { activeTool } = useTool();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize
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

  // Handle wheel for zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Handle pan with middle mouse button or space+drag
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
          {/* Large infinite grid */}
          <GridBackground
            width={dimensions.width * 10}
            height={dimensions.height * 10}
            gridSize={20}
          />
        </Layer>
      </Stage>
    </div>
  );
}
```

### 4. Update CanvasContainer
Update `src/components/canvas/CanvasContainer.tsx`:
```tsx
import { CanvasProvider } from '@/contexts/CanvasContext';
import InfiniteCanvas from './InfiniteCanvas';

export default function CanvasContainer() {
  return (
    <CanvasProvider>
      <InfiniteCanvas />
    </CanvasProvider>
  );
}
```

### 5. Update App
Update `src/App.tsx` to wrap with CanvasProvider:
```tsx
import { ToolProvider } from '@/contexts/ToolContext';
import { CanvasProvider } from '@/contexts/CanvasContext';
import ToolBar from '@/components/tools/ToolBar';
import ToolOptionsPanel from '@/components/tools/ToolOptionsPanel';
import CanvasContainer from '@/components/canvas/CanvasContainer';

export default function App() {
  return (
    <ToolProvider>
      <CanvasProvider>
        <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
          <ToolBar />
          <ToolOptionsPanel />
          <CanvasContainer />
        </div>
      </CanvasProvider>
    </ToolProvider>
  );
}
```

## Success Criteria
- [ ] CanvasContext created and working
- [ ] Mouse wheel zooms in/out centered on cursor
- [ ] Middle-click or space+drag pans the canvas
- [ ] Pan tool (from toolbar) allows dragging the canvas
- [ ] Grid background is visible
- [ ] Window resize handled correctly
- [ ] Zoom is clamped between 0.1x and 5x

## Notes
- Grid uses gray-200 (#E5E7EB) for subtle visibility
- Infinite grid is larger than viewport (10x) to simulate infinite canvas
- Pan and zoom are decoupled for better user control
- Space+drag prevents drawing when panning
