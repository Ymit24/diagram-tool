export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow'

export type ArrowHeadStyle = 'filled' | 'open' | 'stealth' | 'diamond' | 'circle' | 'bar'

export type ToolType =
  | 'select-click'
  | 'select-box'
  | 'select-lasso'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'

export interface ColorItem {
  name: string
  value: string
}

export interface ShapeStyle {
  stroke: string
  strokeWidth: number
  fill: string | null
  background: string | null
  arrowHeadStyle: ArrowHeadStyle
}

export interface BaseShape {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  style: ShapeStyle
}

export interface Rectangle extends BaseShape {
  type: 'rectangle'
}

export interface Circle extends BaseShape {
  type: 'circle'
}

export interface Line extends BaseShape {
  type: 'line'
  x2: number
  y2: number
}

export interface Arrow extends BaseShape {
  type: 'arrow'
  x2: number
  y2: number
  arrowEnd: 'start' | 'end' | 'both'
}

export type DiagramShape = Rectangle | Circle | Line | Arrow

export interface Selection {
  shapeIds: string[]
  selectionType: 'single' | 'multiple' | 'lasso' | 'none'
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface DrawingState {
  isDrawing: boolean
  tool: ToolType
  startX: number
  startY: number
  currentX: number
  currentY: number
  tempShapeId: string | null
}
