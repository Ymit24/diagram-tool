import type { DiagramShape } from '../types/diagram'

export interface ShapeBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface BoundingBox {
  minX: number
  minY: number
  maxX: number
  maxY: number
  centerX: number
  centerY: number
  width: number
  height: number
}

export function getShapeBounds(shape: DiagramShape): ShapeBounds {
  if (shape.type === 'line' || shape.type === 'arrow') {
    const minX = Math.min(shape.x, shape.x + shape.x2)
    const minY = Math.min(shape.y, shape.y + shape.y2)
    return {
      x: minX,
      y: minY,
      width: Math.abs(shape.x2),
      height: Math.abs(shape.y2),
    }
  }
  return {
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  }
}

export function getShapeCenter(shape: DiagramShape): { x: number; y: number } {
  const bounds = getShapeBounds(shape)
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }
}

export function getBoundingBox(shapes: DiagramShape[]): BoundingBox {
  if (shapes.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      centerX: 0,
      centerY: 0,
      width: 0,
      height: 0,
    }
  }

  const bounds = shapes.reduce((acc, shape) => {
    const shapeBounds = getShapeBounds(shape)
    return {
      minX: Math.min(acc.minX, shapeBounds.x),
      minY: Math.min(acc.minY, shapeBounds.y),
      maxX: Math.max(acc.maxX, shapeBounds.x + shapeBounds.width),
      maxY: Math.max(acc.maxY, shapeBounds.y + shapeBounds.height),
    }
  }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })

  return {
    ...bounds,
    centerX: (bounds.minX + bounds.maxX) / 2,
    centerY: (bounds.minY + bounds.maxY) / 2,
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
  }
}

export function getLineEndpoints(shape: DiagramShape): { baseX: number; baseY: number; headX: number; headY: number } {
  if (shape.type !== 'line' && shape.type !== 'arrow') {
    throw new Error('getLineEndpoints can only be used with line or arrow shapes')
  }

  const bboxX = Math.min(shape.x, shape.x + shape.x2)
  const bboxY = Math.min(shape.y, shape.y + shape.y2)
  const baseX = shape.x - bboxX
  const baseY = shape.y - bboxY
  const headX = baseX + shape.x2
  const headY = baseY + shape.y2

  return { baseX, baseY, headX, headY }
}

interface ResizeHandleInfo {
  x: number
  y: number
  cursor: string
  handle: string
}

export function getResizeHandles(shape: DiagramShape, _inverseScale: number): ResizeHandleInfo[] {
  if (shape.type === 'line' || shape.type === 'arrow') {
    const bboxX = Math.min(shape.x, shape.x + shape.x2)
    const bboxY = Math.min(shape.y, shape.y + shape.y2)
    return [
      { x: bboxX, y: bboxY, cursor: 'nwse-resize', handle: 'start' },
      { x: bboxX + shape.x2, y: bboxY + shape.y2, cursor: 'nwse-resize', handle: 'end' },
    ]
  }

  const { x, y, width, height } = shape
  const halfWidth = width / 2
  const halfHeight = height / 2

  return [
    { x: x, y: y, cursor: 'nw-resize', handle: 'nw' },
    { x: x + halfWidth, y: y, cursor: 'n-resize', handle: 'n' },
    { x: x + width, y: y, cursor: 'ne-resize', handle: 'ne' },
    { x: x + width, y: y + halfHeight, cursor: 'e-resize', handle: 'e' },
    { x: x + width, y: y + height, cursor: 'se-resize', handle: 'se' },
    { x: x + halfWidth, y: y + height, cursor: 's-resize', handle: 's' },
    { x: x, y: y + height, cursor: 'sw-resize', handle: 'sw' },
    { x: x, y: y + halfHeight, cursor: 'w-resize', handle: 'w' },
  ]
}
