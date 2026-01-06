import { useRef, useState, useCallback, useEffect } from 'react'
import { clsx } from 'clsx'
import type { DiagramShape } from '../../types/diagram'
import { useDiagramStore } from '../../store/diagramStore'
import { screenToCanvas } from '../../utils/coordinates'
import { createRectangle, createCircle, createLine, createArrow } from '../../utils/shape'
import { hitTestPoint, hitTestBox, hitTestLasso } from '../../utils/hitTest'
import { SelectedShapeRenderer } from '../shapes'
import { ZoomControls } from './ZoomControls'
import { CANVAS_GRID } from '../../constants/layout'

interface Point { x: number; y: number }

export function Canvas() {
  const canvasRef = useRef<SVGSVGElement>(null)
  const lassoPointsRef = useRef<Point[]>([])
  const [lassoPointsForRender, setLassoPointsForRender] = useState<Point[]>([])
  const [dragStartPos, setDragStartPos] = useState<Point | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef<Point | null>(null)
  const panStartViewportRef = useRef({ x: 0, y: 0 })

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
    startResize,
    updateResize,
    endResize,
    setViewport,
  } = useDiagramStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        e.preventDefault()
        setIsPanning(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPanning(false)
        panStartRef.current = null
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPanning])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.min(Math.max(viewport.zoom * delta, 0.1), 5)
      setViewport({ zoom: newZoom })
    } else {
      setViewport({
        x: viewport.x - e.deltaX,
        y: viewport.y - e.deltaY
      })
    }
  }, [viewport, setViewport])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      panStartRef.current = { x: e.clientX, y: e.clientY }
      panStartViewportRef.current = { x: viewport.x, y: viewport.y }
      return
    }

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
  }, [isPanning, currentTool, viewport, shapes, selection.shapeIds, startDrawing, setSelection])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x
      const dy = e.clientY - panStartRef.current.y
      setViewport({
        x: panStartViewportRef.current.x + dx,
        y: panStartViewportRef.current.y + dy,
      })
      return
    }

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
  }, [isPanning, dragStartPos, currentTool, drawing.isDrawing, viewport, shapes, selection.shapeIds, updateDrawing, setViewport])

  const handleMouseMoveWithResize = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

    const {
      resizingShapeId,
      resizeStartShape,
    } = useDiagramStore.getState()

    if (resizingShapeId && resizeStartShape) {
      updateResize(x, y)
      return
    }

    handleMouseMove(e)
  }, [handleMouseMove, updateResize, viewport])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      panStartRef.current = null
      return
    }

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

  const handleMouseUpWithResize = useCallback((e: React.MouseEvent) => {
    const {
      resizingShapeId,
    } = useDiagramStore.getState()

    if (resizingShapeId) {
      endResize()
      return
    }

    handleMouseUp(e)
  }, [handleMouseUp, endResize])

  const handleShapeClick = useCallback((e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation()

    if (currentTool !== 'select-click') return

    if (!selection.shapeIds.includes(shapeId)) {
      setSelection({ shapeIds: [shapeId], selectionType: 'single' })
    }
  }, [currentTool, selection.shapeIds, setSelection])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation()

    if (selection.shapeIds.length === 1) {
      startResize(selection.shapeIds[0], handle)
    }
  }, [selection, startResize])

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
    <div className="w-full h-full overflow-hidden bg-gray-50 relative">
      <ZoomControls />
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        className={clsx(
          'w-full h-full',
          isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveWithResize}
        onMouseUp={handleMouseUpWithResize}
        onMouseLeave={handleMouseUpWithResize}
        onWheel={handleWheel}
      >
        <defs>
          <pattern id="grid" width={CANVAS_GRID.smallGridSize} height={CANVAS_GRID.smallGridSize} patternUnits="userSpaceOnUse">
            <circle cx={CANVAS_GRID.smallDotSize} cy={CANVAS_GRID.smallDotSize} r={CANVAS_GRID.smallDotSize} fill={CANVAS_GRID.dotColor} />
          </pattern>
          <pattern id="grid-large" width={CANVAS_GRID.largeGridSize} height={CANVAS_GRID.largeGridSize} patternUnits="userSpaceOnUse">
            <rect width={CANVAS_GRID.largeGridSize} height={CANVAS_GRID.largeGridSize} fill="url(#grid)" />
            <line x1={CANVAS_GRID.largeGridSize} y1="0" x2={CANVAS_GRID.largeGridSize} y2={CANVAS_GRID.largeGridSize} stroke={CANVAS_GRID.lineColor} strokeWidth="1" />
            <line x1="0" y1={CANVAS_GRID.largeGridSize} x2={CANVAS_GRID.largeGridSize} y2={CANVAS_GRID.largeGridSize} stroke={CANVAS_GRID.lineColor} strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid-large)" />

        {shapes.map((shape) => (
          <SelectedShapeRenderer
            key={shape.id}
            shape={shape}
            selected={selection.shapeIds.includes(shape.id)}
            onClick={(e) => handleShapeClick(e, shape.id)}
            onResizeStart={handleResizeMouseDown}
          />
        ))}

        {drawing.isDrawing && drawing.tool !== 'select-click' && drawing.tool !== 'select-box' && drawing.tool !== 'select-lasso' && (() => {
          const isLineOrArrow = drawing.tool === 'line' || drawing.tool === 'arrow'
          const deltaX = drawing.currentX - drawing.startX
          const deltaY = drawing.currentY - drawing.startY
          const tempShape = {
            id: 'temp',
            type: drawing.tool as 'rectangle' | 'circle' | 'line' | 'arrow',
            x: isLineOrArrow ? drawing.startX : Math.min(drawing.startX, drawing.currentX),
            y: isLineOrArrow ? drawing.startY : Math.min(drawing.startY, drawing.currentY),
            width: Math.abs(deltaX),
            height: Math.abs(deltaY),
            x2: isLineOrArrow ? deltaX : 0,
            y2: isLineOrArrow ? deltaY : 0,
            rotation: 0,
            style: currentToolOptions,
          } as DiagramShape
          return <SelectedShapeRenderer shape={tempShape} />
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
