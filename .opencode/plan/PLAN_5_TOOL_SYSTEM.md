# Phase 5: Tool System & Drawing

## Goal
Implement tool switching, drawing logic, and shape creation through click-and-drag.

## Steps

### 5.1 Tool Constants
Create `src/constants/tools.ts`:

```typescript
import { ToolType } from '../types/diagram'

export const TOOL_INFO: Record<ToolType, { name: string; icon: string; hotkey: string }> = {
  'select-click': { name: 'Select (Click)', icon: 'cursor', hotkey: 'V' },
  'select-box': { name: 'Select (Box)', icon: 'selection', hotkey: 'B' },
  'select-lasso': { name: 'Select (Lasso)', icon: 'lasso', hotkey: 'L' },
  'rectangle': { name: 'Rectangle', icon: 'square', hotkey: 'R' },
  'circle': { name: 'Circle', icon: 'circle', hotkey: 'C' },
  'line': { name: 'Line', icon: 'line', hotkey: 'O' },
  'arrow': { name: 'Arrow', icon: 'arrow', hotkey: 'A' },
}
```

### 5.2 Coordinate Conversion Utilities
Create `src/utils/coordinates.ts`:

```typescript
import { Viewport } from '../types/diagram'

export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: Viewport,
  canvasRect: DOMRect
): { x: number; y: number } {
  const canvasX = (screenX - canvasRect.left - viewport.x) / viewport.zoom
  const canvasY = (screenY - canvasRect.top - viewport.y) / viewport.zoom
  return { x: canvasX, y: canvasY }
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  viewport: Viewport,
  canvasRect: DOMRect
): { x: number; y: number } {
  const screenX = canvasX * viewport.zoom + canvasRect.left + viewport.x
  const screenY = canvasY * viewport.zoom + canvasRect.top + viewport.y
  return { x: screenX, y: screenY }
}
```

### 5.3 Updated Canvas Component with Drawing
Create `src/components/canvas/Canvas.tsx`:

```typescript
import { useRef, useState, useCallback } from 'react'
import { useDiagramStore } from '../../store/diagramStore'
import { screenToCanvas } from '../../utils/coordinates'
import { createRectangle, createCircle, createLine, createArrow } from '../../utils/shape'
import { ShapeRenderer } from '../shapes'

export function Canvas() {
  const canvasRef = useRef<SVGSVGElement>(null)
  const [lassoPoints, setLassoPoints] = useState<string>('')
  
  const {
    shapes,
    selection,
    viewport,
    drawing,
    currentTool,
    currentToolOptions,
    setViewport,
    addShape,
    setSelection,
    startDrawing,
    updateDrawing,
    finishDrawing,
  } = useDiagramStore()

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

    if (currentTool === 'select-click') {
      // Handled by individual shape clicks
      return
    }

    if (currentTool === 'select-box') {
      setLassoPoints(`M ${x} ${y}`)
      startDrawing('select-box', x, y)
      return
    }

    if (currentTool === 'select-lasso') {
      setLassoPoints(`M ${x} ${y}`)
      startDrawing('select-lasso', x, y)
      return
    }

    // Drawing tools
    startDrawing(currentTool, x, y)
  }, [currentTool, viewport, startDrawing])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

    if (drawing.isDrawing) {
      updateDrawing(x, y)
      
      if (currentTool === 'select-box' || currentTool === 'select-lasso') {
        setLassoPoints(prev => `${prev} L ${x} ${y}`)
      }
    }
  }, [drawing.isDrawing, currentTool, viewport, updateDrawing])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!drawing.isDrawing) return
    
    if (!canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

    const { startX, startY, tool } = drawing

    // Create shape based on tool
    let newShape = null
    switch (tool) {
      case 'rectangle':
        newShape = createRectangle(
          Math.min(startX, x),
          Math.min(startY, y),
          Math.abs(x - startX),
          Math.abs(y - startY),
          currentToolOptions
        )
        break
      case 'circle':
        newShape = createCircle(
          Math.min(startX, x),
          Math.min(startY, y),
          Math.abs(x - startX),
          Math.abs(y - startY),
          currentToolOptions
        )
        break
      case 'line':
        newShape = createLine(startX, startY, x, y, currentToolOptions)
        break
      case 'arrow':
        newShape = createArrow(startX, startY, x, y, currentToolOptions)
        break
    }

    if (newShape) {
      addShape(newShape)
      setSelection({ shapeIds: [newShape.id], selectionType: 'single' })
    }

    finishDrawing()
    setLassoPoints('')
  }, [drawing, currentToolOptions, viewport, addShape, finishDrawing, setSelection])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    // Zoom handled via CSS transform on container
  }, [])

  return (
    <div className="w-full h-full overflow-hidden bg-gray-50">
      <svg
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#E5E7EB" />
          </pattern>
          <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#grid)" />
            <line x1="100" y1="0" x2="100" y2="100" stroke="#D1D5DB" strokeWidth="1" />
            <line x1="0" y1="100" x2="100" y2="100" stroke="#D1D5DB" strokeWidth="1" />
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grid-large)" />
        
        {shapes.map((shape) => (
          <ShapeRenderer
            key={shape.id}
            shape={shape}
            selected={selection.shapeIds.includes(shape.id)}
          />
        ))}

        {/* Drawing preview */}
        {drawing.isDrawing && drawing.tool !== 'select-click' && drawing.tool !== 'select-box' && drawing.tool !== 'select-lasso' && (
          <ShapeRenderer
            shape={{
              id: 'temp',
              type: drawing.tool as any,
              x: Math.min(drawing.startX, drawing.currentX),
              y: Math.min(drawing.startY, drawing.currentY),
              width: Math.abs(drawing.currentX - drawing.startX),
              height: Math.abs(drawing.currentY - drawing.startY),
              x2: drawing.tool === 'line' || drawing.tool === 'arrow' 
                ? drawing.currentX - Math.min(drawing.startX, drawing.currentX)
                : 0,
              y2: drawing.tool === 'line' || drawing.tool === 'arrow'
                ? drawing.currentY - Math.min(drawing.startY, drawing.currentY)
                : 0,
              rotation: 0,
              style: currentToolOptions,
            }}
          />
        )}

        {/* Selection box/lasso */}
        {drawing.isDrawing && (drawing.tool === 'select-box' || drawing.tool === 'select-lasso') && (
          <path
            d={lassoPoints}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3B82F6"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        )}
      </svg>
    </div>
  )
}
```

### 5.4 Shape Click Handler
Add click handler to `BaseShape.tsx` for selection:

```typescript
// Inside BaseShape component, update the onClick handler:
onClick={(e) => {
  e.stopPropagation()
  onClick?.(e)
}}
```

### 5.5 Updated Shape Components
Ensure all shape components pass onClick through to BaseShape.

## Deliverable
- Click-and-drag to draw shapes
- Real-time preview while drawing
- Box and lasso selection tools functional
- New shapes added to canvas on mouse up

## Time Estimate
~40-45 minutes

## Dependencies
- Phase 4 complete

## Next Phase Preview
Phase 6 will implement selection system with move and resize capabilities.
