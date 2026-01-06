import type { Rectangle, Circle, Line, Arrow, ShapeStyle } from '../types/diagram'
import { v4 as uuidv4 } from 'uuid'

export function createRectangle(x: number, y: number, width: number, height: number, style: ShapeStyle): Rectangle {
  return {
    id: uuidv4(),
    type: 'rectangle',
    x, y, width, height,
    rotation: 0,
    style,
  }
}

export function createCircle(x: number, y: number, width: number, height: number, style: ShapeStyle): Circle {
  return {
    id: uuidv4(),
    type: 'circle',
    x, y, width, height,
    rotation: 0,
    style,
  }
}

export function createLine(x: number, y: number, x2: number, y2: number, style: ShapeStyle): Line {
  return {
    id: uuidv4(),
    type: 'line',
    x,
    y,
    width: Math.abs(x2 - x),
    height: Math.abs(y2 - y),
    x2: x2 - x,
    y2: y2 - y,
    rotation: 0,
    style,
  }
}

export function createArrow(x: number, y: number, x2: number, y2: number, style: ShapeStyle): Arrow {
  return {
    id: uuidv4(),
    type: 'arrow',
    x,
    y,
    width: Math.abs(x2 - x),
    height: Math.abs(y2 - y),
    x2: x2 - x,
    y2: y2 - y,
    arrowEnd: 'end',
    rotation: 0,
    style,
  }
}
