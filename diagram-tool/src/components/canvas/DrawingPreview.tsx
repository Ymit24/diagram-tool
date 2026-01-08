import type { DiagramShape, ToolType, ShapeStyle } from '../../types/diagram'
import { SelectedShapeRenderer } from '../shapes'

interface DrawingPreviewProps {
  drawing: {
    isDrawing: boolean
    tool: ToolType
    startX: number
    startY: number
    currentX: number
    currentY: number
  }
  currentToolOptions: ShapeStyle
  viewport: { zoom: number }
}

export function DrawingPreview({ drawing, currentToolOptions }: DrawingPreviewProps) {
  if (!drawing.isDrawing) return null

  const isDrawingTool = ['rectangle', 'circle', 'line', 'arrow'].includes(drawing.tool)
  if (!isDrawingTool) return null

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
}
