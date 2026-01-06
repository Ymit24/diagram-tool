import type { DiagramShape, ShapeStyle, ArrowHeadStyle } from '../types/diagram'

export function getSelectedShapes(shapes: DiagramShape[], selection: { shapeIds: string[] }): DiagramShape[] {
  return shapes.filter(shape => selection.shapeIds.includes(shape.id))
}

interface CommonProperties {
  stroke: string | null
  strokeWidth: number | null
  fill: string | null
  arrowHeadStyle: ArrowHeadStyle | null
  allArrows: boolean
}

export function getCommonProperties(shapes: DiagramShape[]): CommonProperties {
  if (shapes.length === 0) {
    return {
      stroke: null,
      strokeWidth: null,
      fill: null,
      arrowHeadStyle: null,
      allArrows: false,
    }
  }

  const first = shapes[0].style
  let commonStroke: string | null = first.stroke
  let commonStrokeWidth: number | null = first.strokeWidth
  let commonFill: string | null = first.fill
  let commonArrowHeadStyle: ArrowHeadStyle | null = first.arrowHeadStyle
  let allArrows = shapes.every(s => s.type === 'arrow')

  for (const shape of shapes) {
    if (shape.style.stroke !== commonStroke) commonStroke = null
    if (shape.style.strokeWidth !== commonStrokeWidth) commonStrokeWidth = null
    if (shape.style.fill !== commonFill) commonFill = null
    if (allArrows && shape.type === 'arrow' && shape.style.arrowHeadStyle !== commonArrowHeadStyle) {
      commonArrowHeadStyle = null
    }
  }

  return {
    stroke: commonStroke,
    strokeWidth: commonStrokeWidth,
    fill: commonFill,
    arrowHeadStyle: commonArrowHeadStyle,
    allArrows,
  }
}

export function getShapeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    rectangle: 'Rectangle',
    circle: 'Circle',
    line: 'Line',
    arrow: 'Arrow',
  }
  return labels[type] || type
}

export function applyPropertyToShapes(
  shapes: DiagramShape[],
  property: keyof ShapeStyle,
  value: string | number
): Partial<DiagramShape>[] {
  return shapes.map(shape => ({
    id: shape.id,
    style: {
      ...shape.style,
      [property]: value,
    },
  }))
}
