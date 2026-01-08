import type { DiagramShape, ToolType, Selection } from '../../types/diagram'
import { SelectedShapeRenderer } from '../shapes'

interface Point {
  x: number
  y: number
}

interface SelectionLayerProps {
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
  lassoPointsForRender: Point[]
  onShapeClick: (e: React.MouseEvent, shapeId: string) => void
  onResizeStart: (e: React.MouseEvent, handle: string) => void
}

function buildLassoPath(points: Point[]): string {
  if (points.length === 0) return ''
  return 'M ' + points.map(p => `${p.x} ${p.y}`).join(' L ')
}

export function SelectionLayer({
  shapes,
  selection,
  drawing,
  lassoPointsForRender,
  onShapeClick,
  onResizeStart,
}: SelectionLayerProps) {
  const selectionBox = drawing.isDrawing && drawing.tool === 'select-box' && lassoPointsForRender.length >= 2
    ? {
        x: Math.min(lassoPointsForRender[0].x, lassoPointsForRender[lassoPointsForRender.length - 1].x),
        y: Math.min(lassoPointsForRender[0].y, lassoPointsForRender[lassoPointsForRender.length - 1].y),
        width: Math.abs(lassoPointsForRender[lassoPointsForRender.length - 1].x - lassoPointsForRender[0].x),
        height: Math.abs(lassoPointsForRender[lassoPointsForRender.length - 1].y - lassoPointsForRender[0].y),
      }
    : null

  const isSelectionTool = ['select-click', 'select-box', 'select-lasso'].includes(drawing.tool)

  return (
    <>
      {shapes.map((shape) => (
        <SelectedShapeRenderer
          key={shape.id}
          shape={shape}
          selected={selection.shapeIds.includes(shape.id)}
          onClick={(e) => onShapeClick(e, shape.id)}
          onResizeStart={onResizeStart}
        />
      ))}

      {isSelectionTool && drawing.isDrawing && drawing.tool === 'select-box' && selectionBox && (
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

      {isSelectionTool && drawing.isDrawing && drawing.tool === 'select-lasso' && lassoPointsForRender.length > 0 && (
        <path
          d={buildLassoPath(lassoPointsForRender) + ' Z'}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3B82F6"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
      )}
    </>
  )
}
