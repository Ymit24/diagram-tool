import type { Rectangle, Circle, Line, Arrow, ShapeStyle, ShapeType } from '../types/diagram'
import { v4 as uuidv4 } from 'uuid'

function createBaseShape<T extends ShapeType>(
  type: T,
  x: number,
  y: number,
  width: number,
  height: number,
  style: ShapeStyle
): T extends 'line' ? Line : T extends 'arrow' ? Arrow : T extends 'rectangle' ? Rectangle : Circle {
  return {
    id: uuidv4(),
    type,
    x,
    y,
    width,
    height,
    rotation: 0,
    style,
  } as T extends 'line' ? Line : T extends 'arrow' ? Arrow : T extends 'rectangle' ? Rectangle : Circle
}

export function createRectangle(x: number, y: number, width: number, height: number, style: ShapeStyle): Rectangle {
  return {
    ...createBaseShape('rectangle', x, y, width, height, style),
  }
}

export function createCircle(x: number, y: number, width: number, height: number, style: ShapeStyle): Circle {
  return {
    ...createBaseShape('circle', x, y, width, height, style),
  }
}

export function createLine(x: number, y: number, x2: number, y2: number, style: ShapeStyle): Line {
  const width = Math.abs(x2 - x)
  const height = Math.abs(y2 - y)
  return {
    ...createBaseShape('line', x, y, width, height, style),
    x2: x2 - x,
    y2: y2 - y,
  }
}

export function createArrow(x: number, y: number, x2: number, y2: number, style: ShapeStyle): Arrow {
  const width = Math.abs(x2 - x)
  const height = Math.abs(y2 - y)
  return {
    ...createBaseShape('arrow', x, y, width, height, style),
    x2: x2 - x,
    y2: y2 - y,
    arrowEnd: 'end',
  }
}

export function createShape(
  type: 'rectangle',
  x: number,
  y: number,
  width: number,
  height: number,
  style: ShapeStyle
): Rectangle

export function createShape(
  type: 'circle',
  x: number,
  y: number,
  width: number,
  height: number,
  style: ShapeStyle
): Circle

export function createShape(
  type: 'line' | 'arrow',
  x: number,
  y: number,
  width: number,
  height: number,
  style: ShapeStyle,
  extras?: { x2: number; y2: number }
): Line | Arrow

export function createShape(
  type: ShapeType,
  x: number,
  y: number,
  width: number,
  height: number,
  style: ShapeStyle,
  extras?: { x2: number; y2: number }
): Rectangle | Circle | Line | Arrow {
  switch (type) {
    case 'rectangle':
      return createRectangle(x, y, width, height, style)
    case 'circle':
      return createCircle(x, y, width, height, style)
    case 'line':
      if (!extras) throw new Error('x2 and y2 are required for line shapes')
      return createLine(x, y, x + extras.x2, y + extras.y2, style)
    case 'arrow':
      if (!extras) throw new Error('x2 and y2 are required for arrow shapes')
      return createArrow(x, y, x + extras.x2, y + extras.y2, style)
    default:
      throw new Error(`Unknown shape type: ${type}`)
  }
}
