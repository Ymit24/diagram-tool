import type { DiagramShape } from '../types/diagram'

export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
export type DistributionType = 'horizontal' | 'vertical'

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

export function getShapeBounds(shape: DiagramShape): { x: number; y: number; width: number; height: number } {
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
  return { x: shape.x, y: shape.y, width: shape.width, height: shape.height }
}

export function getBoundingBox(shapes: DiagramShape[]): BoundingBox {
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

export function getCenterPoint(shape: DiagramShape): { x: number; y: number } {
  const bounds = getShapeBounds(shape)
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }
}

export function alignShapes(shapes: DiagramShape[], alignment: AlignmentType): Map<string, Partial<DiagramShape>> {
  const bounds = getBoundingBox(shapes)
  const updates = new Map<string, Partial<DiagramShape>>()

  shapes.forEach(shape => {
    const shapeBounds = getShapeBounds(shape)

    switch (alignment) {
      case 'left':
        updates.set(shape.id, { x: bounds.minX })
        break
      case 'center':
        updates.set(shape.id, { x: bounds.centerX - shapeBounds.width / 2 })
        break
      case 'right':
        updates.set(shape.id, { x: bounds.maxX - shapeBounds.width })
        break
      case 'top':
        updates.set(shape.id, { y: bounds.minY })
        break
      case 'middle':
        updates.set(shape.id, { y: bounds.centerY - shapeBounds.height / 2 })
        break
      case 'bottom':
        updates.set(shape.id, { y: bounds.maxY - shapeBounds.height })
        break
    }
  })

  return updates
}

export function distributeShapes(shapes: DiagramShape[], distribution: DistributionType): Map<string, Partial<DiagramShape>> {
  if (shapes.length < 3) return new Map()

  const sortedShapes = [...shapes].sort((a, b) => {
    if (distribution === 'horizontal') {
      return getShapeBounds(a).x - getShapeBounds(b).x
    } else {
      return getShapeBounds(a).y - getShapeBounds(b).y
    }
  })

  const bounds = getBoundingBox(shapes)
  const updates = new Map<string, Partial<DiagramShape>>()

  if (distribution === 'horizontal') {
    const totalWidth = sortedShapes.reduce((sum, shape) => {
      return sum + getShapeBounds(shape).width
    }, 0)
    const availableSpace = bounds.width - totalWidth
    const spacing = availableSpace / (sortedShapes.length - 1)

    let currentX = bounds.minX
    sortedShapes.forEach(shape => {
      const shapeBounds = getShapeBounds(shape)
      updates.set(shape.id, { x: currentX })
      currentX += shapeBounds.width + spacing
    })
  } else {
    const totalHeight = sortedShapes.reduce((sum, shape) => {
      return sum + getShapeBounds(shape).height
    }, 0)
    const availableSpace = bounds.height - totalHeight
    const spacing = availableSpace / (sortedShapes.length - 1)

    let currentY = bounds.minY
    sortedShapes.forEach(shape => {
      const shapeBounds = getShapeBounds(shape)
      updates.set(shape.id, { y: currentY })
      currentY += shapeBounds.height + spacing
    })
  }

  return updates
}
