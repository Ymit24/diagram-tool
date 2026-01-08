import { useRef, useState, useCallback, useEffect } from 'react'
import { clsx } from 'clsx'
import type { DiagramShape } from '../../types/diagram'
import { useDiagramStore } from '../../store/diagramStore'
import { screenToCanvas } from '../../utils/coordinates'
import { createRectangle, createCircle, createLine, createArrow } from '../../utils/shape'
import { hitTestPoint, hitTestBox, hitTestLasso } from '../../utils/hitTest'
import { SelectedShapeRenderer } from '../shapes'
import { ZoomControls } from './ZoomControls'

interface Point { x: number; y: number }

const GRID_SIZE = 100

function InfiniteGrid({ viewport }: { viewport: { x: number; y: number; zoom: number } }) {
  const gridSize = GRID_SIZE

  const buffer = gridSize * 2
  const left = Math.floor((-viewport.x - buffer) / gridSize / viewport.zoom) * gridSize
  const right = Math.ceil((-viewport.x + window.innerWidth / viewport.zoom + buffer) / gridSize) * gridSize
  const top = Math.floor((-viewport.y - buffer) / gridSize / viewport.zoom) * gridSize
  const bottom = Math.ceil((-viewport.y + window.innerHeight / viewport.zoom + buffer) / gridSize) * gridSize

  const verticalLines = []
  for (let x = left; x <= right; x += gridSize) {
    verticalLines.push(<line key={`v${x}`} x1={x} y1={top} x2={x} y2={bottom} stroke="#E5E7EB" strokeWidth={1 / viewport.zoom} />)
  }

  const horizontalLines = []
  for (let y = top; y <= bottom; y += gridSize) {
    horizontalLines.push(<line key={`h${y}`} x1={left} y1={y} x2={right} y2={y} stroke="#E5E7EB" strokeWidth={1 / viewport.zoom} />)
  }

  return (
    <g>
      {verticalLines}
      {horizontalLines}
    </g>
  )
}

export function Canvas() {
  const canvasRef = useRef<SVGSVGElement>(null)
  const lassoPointsRef = useRef<Point[]>([])
  const [lassoPointsForRender, setLassoPointsForRender] = useState<Point[]>([])
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const isPanningRef = useRef(false)
  const panStartRef = useRef<Point | null>(null)
  const panStartViewportRef = useRef({ x: 0, y: 0 })
  const dragStartRef = useRef<Point | null>(null)
  const lastMouseRef = useRef<Point | null>(null)
  const isDraggingRef = useRef(false)
  const [, forceUpdate] = useState({})

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
      if (e.code === 'Space' && !isPanningRef.current) {
        e.preventDefault()
        isPanningRef.current = true
        forceUpdate({})
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        isPanningRef.current = false
        panStartRef.current = null
        forceUpdate({})
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

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
    if (isPanningRef.current || currentTool === 'pan') {
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
        if (e.shiftKey) {
          const isSelected = selection.shapeIds.includes(clickedShape.id)
          let newShapeIds
          if (isSelected) {
            newShapeIds = selection.shapeIds.filter(id => id !== clickedShape.id)
          } else {
            newShapeIds = [...selection.shapeIds, clickedShape.id]
          }
          const selectionType = newShapeIds.length > 1 ? 'multiple'
                               : newShapeIds.length === 1 ? 'single'
                               : 'none'
          setSelection({ shapeIds: newShapeIds, selectionType })
        } else {
          setSelection({ shapeIds: [clickedShape.id], selectionType: 'single' })
        }
        dragStartRef.current = { x, y }
        lastMouseRef.current = { x, y }
        isDraggingRef.current = false
        setIsDragging(false)
      } else {
        setSelection({ shapeIds: [], selectionType: 'none' })
        dragStartRef.current = null
        lastMouseRef.current = null
        isDraggingRef.current = false
        setIsDragging(false)
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
    if ((isPanningRef.current || currentTool === 'pan') && panStartRef.current) {
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

    if (dragStartRef.current && lastMouseRef.current && currentTool === 'select-click' && selection.shapeIds.length > 0) {
      if (!isDraggingRef.current) {
        const thresholdDx = x - dragStartRef.current.x
        const thresholdDy = y - dragStartRef.current.y

        if (Math.abs(thresholdDx) > 3 || Math.abs(thresholdDy) > 3) {
          isDraggingRef.current = true
          setIsDragging(true)
          lastMouseRef.current = { x, y }
        }
      }

      if (isDraggingRef.current) {
        const dx = x - lastMouseRef.current.x
        const dy = y - lastMouseRef.current.y

        if (dx !== 0 || dy !== 0) {
          selection.shapeIds.forEach(id => {
            const shape = shapes.find(s => s.id === id)
            if (shape) {
              updateShape(id, { x: shape.x + dx, y: shape.y + dy })
            }
          })
          lastMouseRef.current = { x, y }
        }
      }
      return
    }

    if (!isPanningRef.current && currentTool === 'select-click') {
      const hoveredShape = shapes.find(s => hitTestPoint(s, x, y))
      setHoveredShapeId(hoveredShape?.id || null)
    }

    if (drawing.isDrawing) {
      updateDrawing(x, y)

      if (currentTool === 'select-box' || currentTool === 'select-lasso') {
        lassoPointsRef.current.push({ x, y })
        setLassoPointsForRender([...lassoPointsRef.current])
      }
    }
  }, [currentTool, drawing.isDrawing, viewport, shapes, selection.shapeIds, updateDrawing, setViewport])

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
    if (isPanningRef.current || currentTool === 'pan') {
      panStartRef.current = null
      return
    }

    if (!canvasRef.current) return

    if (isDraggingRef.current) {
      const state = useDiagramStore.getState()
      const entry = {
        type: 'update' as const,
        shapes: [...state.shapes],
        selection: { ...state.selection },
        timestamp: Date.now(),
        description: 'Move shapes',
      }
      useDiagramStore.setState({
        past: [...state.past, entry].slice(-50),
        future: [],
      })
    }

    dragStartRef.current = null
    lastMouseRef.current = null
    isDraggingRef.current = false
    setIsDragging(false)

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
  }, [currentTool, drawing, viewport, shapes, currentToolOptions, addShape, finishDrawing, setSelection])

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

  const getCursor = () => {
    if (isPanningRef.current || currentTool === 'pan') {
      return 'cursor-grab active:cursor-grabbing'
    }

    if (['select-click', 'select-box', 'select-lasso'].includes(currentTool)) {
      if (currentTool === 'select-click' && isDragging && selection.shapeIds.length > 0) {
        return 'cursor-move'
      }
      if (currentTool === 'select-click' && hoveredShapeId && selection.shapeIds.includes(hoveredShapeId)) {
        return 'cursor-move'
      }
      return 'cursor-default'
    }

    return 'cursor-crosshair'
  }

  return (
    <div className="w-full h-full overflow-hidden bg-gray-50 relative">
      <ZoomControls />
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        className={clsx(
          'w-full h-full',
          getCursor()
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveWithResize}
        onMouseUp={handleMouseUpWithResize}
        onMouseLeave={handleMouseUpWithResize}
        onWheel={handleWheel}
      >
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
          <InfiniteGrid viewport={viewport} />

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
              strokeWidth={1 / viewport.zoom}
              strokeDasharray="4 2"
            />
          )}

          {drawing.isDrawing && drawing.tool === 'select-lasso' && lassoPointsForRender.length > 0 && (
            <path
              d={buildLassoPath(lassoPointsForRender) + ' Z'}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3B82F6"
              strokeWidth={1 / viewport.zoom}
              strokeDasharray="4 2"
            />
          )}
        </g>
      </svg>
    </div>
  )
}
