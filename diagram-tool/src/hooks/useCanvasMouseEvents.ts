import { useRef, useState, useCallback } from 'react'
import type { DiagramShape, ToolType, Selection, ShapeStyle } from '../types/diagram'
import { screenToCanvas } from '../utils/coordinates'
import { hitTestPoint, hitTestBox, hitTestLasso } from '../utils/hitTest'
import { createRectangle, createCircle, createLine, createArrow } from '../utils/shape'

interface Point {
  x: number
  y: number
}

interface UseCanvasMouseEventsOptions {
  viewport: { x: number; y: number; zoom: number }
  canvasRef: React.RefObject<SVGSVGElement | null>
  currentTool: ToolType
  shapes: DiagramShape[]
  selection: Selection
  drawing: {
    isDrawing: boolean
    tool: ToolType
    startX: number
    startY: number
    currentX: number
    currentY: number
  }
  currentToolOptions: ShapeStyle
  resizingShapeId: string | null
  actions: {
    setSelection: (selection: Partial<Selection>) => void
    startDrawing: (tool: ToolType, x: number, y: number) => void
    updateDrawing: (x: number, y: number) => void
    finishDrawing: () => void
    addShape: (shape: DiagramShape) => void
    updateShape: (id: string, updates: Partial<DiagramShape>) => void
    startResize: (shapeId: string, handle: string) => void
    updateResize: (x: number, y: number) => void
    endResize: () => void
  }
}

export function useCanvasMouseEvents({
  viewport,
  canvasRef,
  currentTool,
  shapes,
  selection,
  drawing,
  currentToolOptions,
  resizingShapeId,
  actions,
}: UseCanvasMouseEventsOptions) {
  const lassoPointsRef = useRef<Point[]>([])
  const [lassoPointsForRender, setLassoPointsForRender] = useState<Point[]>([])
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<Point | null>(null)
  const lastMouseRef = useRef<Point | null>(null)
  const isDraggingRef = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

    if (currentTool === 'select-click') {
      const clickedShape = shapes.find(s => hitTestPoint(s, x, y))

      if (clickedShape) {
        const isAlreadySelected = selection.shapeIds.includes(clickedShape.id)

        if (e.shiftKey) {
          let newShapeIds
          if (isAlreadySelected) {
            newShapeIds = selection.shapeIds.filter((id: string) => id !== clickedShape.id)
          } else {
            newShapeIds = [...selection.shapeIds, clickedShape.id]
          }
          const selectionType = newShapeIds.length > 1 ? 'multiple'
                               : newShapeIds.length === 1 ? 'single'
                               : 'none'
          actions.setSelection({ shapeIds: newShapeIds, selectionType })
        } else if (!isAlreadySelected) {
          actions.setSelection({ shapeIds: [clickedShape.id], selectionType: 'single' })
        }
        dragStartRef.current = { x, y }
        lastMouseRef.current = { x, y }
        isDraggingRef.current = false
        setIsDragging(false)
      } else {
        actions.setSelection({ shapeIds: [], selectionType: 'none' })
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
      actions.startDrawing('select-box', x, y)
      return
    }

    if (currentTool === 'select-lasso') {
      lassoPointsRef.current = [{ x, y }]
      setLassoPointsForRender([{ x, y }])
      actions.startDrawing('select-lasso', x, y)
      return
    }

    actions.startDrawing(currentTool, x, y)
  }, [viewport, canvasRef, currentTool, shapes, selection, actions])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
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
          selection.shapeIds.forEach((id: string) => {
            const shape = shapes.find(s => s.id === id)
            if (shape) {
              actions.updateShape(id, { x: shape.x + dx, y: shape.y + dy })
            }
          })
          lastMouseRef.current = { x, y }
        }
      }
      return
    }

    if (currentTool === 'select-click') {
      const hoveredShape = shapes.find(s => hitTestPoint(s, x, y))
      setHoveredShapeId(hoveredShape?.id || null)
    }

    if (drawing.isDrawing) {
      actions.updateDrawing(x, y)

      if (currentTool === 'select-box' || currentTool === 'select-lasso') {
        lassoPointsRef.current.push({ x, y })
        setLassoPointsForRender([...lassoPointsRef.current])
      }
    }
  }, [viewport, canvasRef, currentTool, shapes, selection, drawing, actions])

  const handleMouseMoveWithResize = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const { x, y } = screenToCanvas(e.clientX, e.clientY, viewport, rect)

    if (resizingShapeId) {
      actions.updateResize(x, y)
      return
    }

    handleMouseMove(e)
  }, [viewport, canvasRef, resizingShapeId, actions, handleMouseMove])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    dragStartRef.current = null
    lastMouseRef.current = null
    isDraggingRef.current = false
    setIsDragging(false)

    if (!drawing.isDrawing) return

    if (!canvasRef.current) return

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
      actions.setSelection({ shapeIds: selectedIds, selectionType: selectedIds.length > 1 ? 'multiple' : 'single' })
      actions.finishDrawing()
      lassoPointsRef.current = []
      setLassoPointsForRender([])
      return
    }

    if (tool === 'select-lasso') {
      const polygon = [...lassoPointsRef.current, { x, y }]
      const selectedIds = shapes.filter(s => hitTestLasso(s, polygon)).map(s => s.id)
      actions.setSelection({ shapeIds: selectedIds, selectionType: selectedIds.length > 1 ? 'lasso' : 'single' })
      actions.finishDrawing()
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
      actions.addShape(newShape)
      actions.setSelection({ shapeIds: [newShape.id], selectionType: 'single' })
    }

    actions.finishDrawing()
    lassoPointsRef.current = []
    setLassoPointsForRender([])
  }, [viewport, canvasRef, shapes, drawing, currentToolOptions, actions])

  const handleMouseUpWithResize = useCallback((e: React.MouseEvent) => {
    if (resizingShapeId) {
      actions.endResize()
      return
    }

    handleMouseUp(e)
  }, [resizingShapeId, actions, handleMouseUp])

  const handleShapeClick = useCallback((e: React.MouseEvent, shapeId: string) => {
    e.stopPropagation()

    if (currentTool !== 'select-click') return

    if (!selection.shapeIds.includes(shapeId)) {
      actions.setSelection({ shapeIds: [shapeId], selectionType: 'single' })
    }
  }, [currentTool, selection, actions])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, handle: string) => {
    e.stopPropagation()

    if (selection.shapeIds.length === 1) {
      actions.startResize(selection.shapeIds[0], handle)
    }
  }, [selection, actions])

  return {
    lassoPointsForRender,
    hoveredShapeId,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseMoveWithResize,
    handleMouseUp,
    handleMouseUpWithResize,
    handleShapeClick,
    handleResizeMouseDown,
  }
}
