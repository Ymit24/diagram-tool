import { useRef, useState, useCallback } from 'react'
import type { DiagramShape } from '../../types/diagram'
import { useDiagramStore } from '../../store/diagramStore'
import { screenToCanvas } from '../../utils/coordinates'
import { createRectangle, createCircle, createLine, createArrow } from '../../utils/shape'
import { ShapeRenderer } from '../shapes'

export function Canvas() {
  const canvasRef = useRef<SVGSVGElement>(null)
  const [lassoPoints, setLassoPoints] = useState('')

  const {
    shapes,
    selection,
    viewport,
    drawing,
    currentTool,
    currentToolOptions,
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

  return (
    <div className="w-full h-full overflow-hidden bg-gray-50">
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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

        {drawing.isDrawing && drawing.tool !== 'select-click' && drawing.tool !== 'select-box' && drawing.tool !== 'select-lasso' && (() => {
          const isLineOrArrow = drawing.tool === 'line' || drawing.tool === 'arrow'
          const tempShape = {
            id: 'temp',
            type: drawing.tool as 'rectangle' | 'circle' | 'line' | 'arrow',
            x: Math.min(drawing.startX, drawing.currentX),
            y: Math.min(drawing.startY, drawing.currentY),
            width: Math.abs(drawing.currentX - drawing.startX),
            height: Math.abs(drawing.currentY - drawing.startY),
            x2: isLineOrArrow ? drawing.currentX - Math.min(drawing.startX, drawing.currentX) : 0,
            y2: isLineOrArrow ? drawing.currentY - Math.min(drawing.startY, drawing.currentY) : 0,
            rotation: 0,
            style: currentToolOptions,
          } as DiagramShape
          return <ShapeRenderer shape={tempShape} />
        })()}

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
