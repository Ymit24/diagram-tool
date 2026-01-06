import { useRef, useState, useCallback } from 'react'
import type { DiagramShape } from '../../types/diagram'
import { useDiagramStore } from '../../store/diagramStore'
import { screenToCanvas } from '../../utils/coordinates'
import { createRectangle, createCircle, createLine, createArrow } from '../../utils/shape'
import { hitTestPoint, hitTestBox, hitTestLasso } from '../../utils/hitTest'
import { ShapeRenderer } from '../shapes'

interface Point { x: number; y: number }

export function Canvas() {
  const canvasRef = useRef<SVGSVGElement>(null)
  const lassoPointsRef = useRef<Point[]>([])
  const [lassoPointsForRender, setLassoPointsForRender] = useState<Point[]>([])
  const [dragStartPos, setDragStartPos] = useState<Point | null>(null)

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
    updateShape,
  } = useDiagramStore()

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

    if (currentTool === 'select-click') {
      const clickedShape = shapes.find(s => hitTestPoint(s, x, y))

      if (clickedShape) {
        if (!selection.shapeIds.includes(clickedShape.id)) {
          setSelection({ shapeIds: [clickedShape.id], selectionType: 'single' })
        }
        setDragStartPos({ x, y })
      } else {
        setSelection({ shapeIds: [], selectionType: 'none' })
      }
      return
    }

    if (currentTool === 'select-box') {
      lassoPointsRef.current = [{ x, y }]
      setLassoPointsForRender([{ x, y }])
      startDrawing('select-box', x, y)
      return
    }

    if (currentTool === 'select-lasso') {
      lassoPointsRef.current = [{ x, y }]
      setLassoPointsForRender([{ x, y }])
      startDrawing('select-lasso', x, y)
      return
    }

    startDrawing(currentTool, x, y)
  }, [currentTool, viewport, shapes, selection.shapeIds, startDrawing, setSelection])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

    if (dragStartPos && currentTool === 'select-click' && selection.shapeIds.length > 0) {
      const dx = x - dragStartPos.x
      const dy = y - dragStartPos.y

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        selection.shapeIds.forEach(id => {
          const shape = shapes.find(s => s.id === id)
          if (shape) {
            updateShape(id, { x: shape.x + dx, y: shape.y + dy })
          }
        })
        setDragStartPos({ x, y })
      }
      return
    }

    if (drawing.isDrawing) {
      updateDrawing(x, y)

      if (currentTool === 'select-box' || currentTool === 'select-lasso') {
        lassoPointsRef.current.push({ x, y })
        setLassoPointsForRender([...lassoPointsRef.current])
      }
    }
  }, [dragStartPos, currentTool, drawing.isDrawing, viewport, shapes, selection.shapeIds, updateDrawing])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    setDragStartPos(null)

    if (!drawing.isDrawing) return

    const rect = canvasRef.current.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)
    const { startX, startY, tool } = drawing

    if (tool === 'select-box') {
      const box = {
        x: Math.min(startX, x),
        y: Math.min(startY, y),
        width: Math.abs(x - startX),
        height: Math.abs(y - startY),
      }
      const selectedIds = shapes.filter(s => hitTestBox(s, box)).map(s => s.id)
      setSelection({ shapeIds: selectedIds, selectionType: selectedIds.length > 1 ? 'multiple' : 'single' })
      finishDrawing()
      lassoPointsRef.current = []
      setLassoPointsForRender([])
      return
    }

    if (tool === 'select-lasso') {
      const polygon = [...lassoPointsRef.current, { x, y }]
      const selectedIds = shapes.filter(s => hitTestLasso(s, polygon)).map(s => s.id)
      setSelection({ shapeIds: selectedIds, selectionType: selectedIds.length > 1 ? 'lasso' : 'single' })
      finishDrawing()
      lassoPointsRef.current = []
      setLassoPointsForRender([])
      return
    }

    let newShape: DiagramShape | null = null
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
    lassoPointsRef.current = []
    setLassoPointsForRender([])
  }, [drawing, viewport, shapes, currentToolOptions, addShape, finishDrawing, setSelection])

  const handleShapeClick = useCallback((e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation()

    if (currentTool !== 'select-click') return

    if (!selection.shapeIds.includes(shapeId)) {
      setSelection({ shapeIds: [shapeId], selectionType: 'single' })
    }
  }, [currentTool, selection.shapeIds, setSelection])

  const buildLassoPath = (points: Point[]): string => {
    if (points.length === 0) return ''
    return 'M ' + points.map(p => `${p.x} ${p.y}`).join(' L ')
  }

  const selectionBox = drawing.isDrawing && drawing.tool === 'select-box' && lassoPointsForRender.length >= 2 ? {
    x: Math.min(lassoPointsForRender[0].x, lassoPointsForRender[lassoPointsForRender.length - 1].x),
    y: Math.min(lassoPointsForRender[0].y, lassoPointsForRender[lassoPointsForRender.length - 1].y),
    width: Math.abs(lassoPointsForRender[lassoPointsForRender.length - 1].x - lassoPointsForRender[0].x),
    height: Math.abs(lassoPointsForRender[lassoPointsForRender.length - 1].y - lassoPointsForRender[0].y),
  } : null

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
        onMouseLeave={handleMouseUp}
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
            onClick={(e) => handleShapeClick(e, shape.id)}
          />
        ))}

        {drawing.isDrawing && drawing.tool !== 'select-click' && drawing.tool !== 'select-box' && drawing.tool !== 'select-lasso' && (() => {
          const isLineOrArrow = drawing.tool === 'line' || drawing.tool === 'arrow'
          const originX = Math.min(drawing.startX, drawing.currentX)
          const originY = Math.min(drawing.startY, drawing.currentY)
          const tempShape = {
            id: 'temp',
            type: drawing.tool as 'rectangle' | 'circle' | 'line' | 'arrow',
            x: originX,
            y: originY,
            width: Math.abs(drawing.currentX - drawing.startX),
            height: Math.abs(drawing.currentY - drawing.startY),
            x2: isLineOrArrow ? drawing.currentX - originX : 0,
            y2: isLineOrArrow ? drawing.currentY - originY : 0,
            rotation: 0,
            style: currentToolOptions,
          } as DiagramShape
          return <ShapeRenderer shape={tempShape} />
        })()}

        {drawing.isDrawing && drawing.tool === 'select-box' && selectionBox && (
          <rect
            x={selectionBox.x}
            y={selectionBox.y}
            width={selectionBox.width}
            height={selectionBox.height}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3B82F6"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        )}

        {drawing.isDrawing && drawing.tool === 'select-lasso' && lassoPointsForRender.length > 0 && (
          <path
            d={buildLassoPath(lassoPointsForRender) + ' Z'}
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
