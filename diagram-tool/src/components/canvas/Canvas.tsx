import { useRef, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { useDiagramStore } from '../../store/diagramStore'
import { ZoomControls } from './ZoomControls'
import { InfiniteGrid } from './InfiniteGrid'
import { SelectionLayer } from './SelectionLayer'
import { DrawingPreview } from './DrawingPreview'
import { usePanZoom } from '../../hooks/usePanZoom'
import { useCanvasMouseEvents } from '../../hooks/useCanvasMouseEvents'

export function Canvas() {
  const canvasRef = useRef<SVGSVGElement>(null)
  const [isPanning, setIsPanning] = useState(false)

  const {
    shapes,
    selection,
    viewport,
    drawing,
    currentTool,
    currentToolOptions,
    resizingShapeId,
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

  const mouseActions = {
    setSelection,
    startDrawing,
    updateDrawing,
    finishDrawing,
    addShape: useDiagramStore.getState().addShape,
    updateShape,
    startResize: startResize as (shapeId: string, handle: string) => void,
    updateResize,
    endResize,
  }

  const {
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd: panZoomEnd,
  } = usePanZoom({
    viewport,
    setViewport,
    canvasRef,
    isPanning,
    setIsPanning,
  })

  const {
    lassoPointsForRender,
    hoveredShapeId,
    isDragging,
    handleMouseDown,
    handleMouseMoveWithResize,
    handleMouseUpWithResize,
    handleShapeClick,
    handleResizeMouseDown,
  } = useCanvasMouseEvents({
    viewport,
    canvasRef,
    currentTool,
    shapes,
    selection,
    drawing,
    currentToolOptions,
    resizingShapeId,
    actions: mouseActions,
  })

  const handlePanEnd = useCallback(() => {
    panZoomEnd()
  }, [panZoomEnd])

  const handleMouseMoveCombined = useCallback((e: React.MouseEvent) => {
    if (isPanning || currentTool === 'pan') {
      handlePanMove(e.clientX, e.clientY)
    } else {
      handleMouseMoveWithResize(e)
    }
  }, [isPanning, currentTool, handlePanMove, handleMouseMoveWithResize])

  const handleMouseDownCombined = useCallback((e: React.MouseEvent) => {
    if (isPanning || currentTool === 'pan') {
      handlePanStart(e.clientX, e.clientY)
    } else {
      handleMouseDown(e)
    }
  }, [isPanning, currentTool, handlePanStart, handleMouseDown])

  const handleMouseUpCombined = useCallback((e: React.MouseEvent) => {
    if (isPanning || currentTool === 'pan') {
      handlePanEnd()
    } else {
      handleMouseUpWithResize(e)
    }
  }, [isPanning, currentTool, handlePanEnd, handleMouseUpWithResize])

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (isPanning || currentTool === 'pan') {
      handlePanEnd()
    } else {
      handleMouseUpWithResize(e)
    }
  }, [isPanning, currentTool, handlePanEnd, handleMouseUpWithResize])

  const getCursor = useCallback(() => {
    if (isPanning || currentTool === 'pan') {
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
  }, [isPanning, currentTool, isDragging, selection.shapeIds, hoveredShapeId])

  return (
    <div className="w-full h-full overflow-hidden bg-gray-50 relative">
      <ZoomControls />
      <svg
        ref={canvasRef}
        width="100%"
        height="100%"
        className={clsx('w-full h-full', getCursor())}
        onMouseDown={handleMouseDownCombined}
        onMouseMove={handleMouseMoveCombined}
        onMouseUp={handleMouseUpCombined}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
          <InfiniteGrid viewport={viewport} />

          <SelectionLayer
            shapes={shapes}
            selection={selection}
            drawing={drawing}
            lassoPointsForRender={lassoPointsForRender}
            onShapeClick={handleShapeClick}
            onResizeStart={handleResizeMouseDown}
          />

          <DrawingPreview
            drawing={drawing}
            currentToolOptions={currentToolOptions}
            viewport={viewport}
          />
        </g>
      </svg>
    </div>
  )
}
