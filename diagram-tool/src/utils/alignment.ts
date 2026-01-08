import type { DiagramShape } from '../types/diagram'
import { getShapeBounds, getBoundingBox, type BoundingBox } from './shapeBounds'

export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
export type DistributionType = 'horizontal' | 'vertical'

export { getShapeBounds, getBoundingBox }
export type { BoundingBox }

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
