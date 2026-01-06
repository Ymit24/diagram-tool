import type { DiagramShape } from '../types/diagram'

export function hitTestPoint(shape: DiagramShape, x: number, y: number): boolean {
  const padding = 5

  if (shape.type === 'circle') {
    const cx = shape.x + shape.width / 2
    const cy = shape.y + shape.height / 2
    const radius = shape.width / 2
    const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2))
    return distance <= radius + padding
  }

  return (
    x >= shape.x - padding &&
    x <= shape.x + shape.width + padding &&
    y >= shape.y - padding &&
    y <= shape.y + shape.height + padding
  )
}

export function hitTestBox(shape: DiagramShape, box: { x: number; y: number; width: number; height: number }): boolean {
  const shapeRight = shape.x + shape.width
  const shapeBottom = shape.y + shape.height
  const boxRight = box.x + box.width
  const boxBottom = box.y + box.height

  return (
    shape.x < boxRight &&
    shapeRight > box.x &&
    shape.y < boxBottom &&
    shapeBottom > box.y
  )
}

export function hitTestLasso(shape: DiagramShape, points: { x: number; y: number }[]): boolean {
  if (points.length < 3) return false

  const shapeCenterX = shape.x + shape.width / 2
  const shapeCenterY = shape.y + shape.height / 2

  return pointInPolygon({ x: shapeCenterX, y: shapeCenterY }, points)
}

function pointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
  let inside = false
  const x = point.x
  const y = point.y

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }

  return inside
}
