import { describe, it, expect } from 'vitest'
import { getShapeBounds, getBoundingBox, getLineEndpoints, getResizeHandles } from '../shapeBounds'
import type { Rectangle, Circle, Line, Arrow } from '../../types/diagram'

const createRectangle = (overrides: Partial<Rectangle> = {}): Rectangle => ({
  id: 'rect-1',
  type: 'rectangle',
  x: 10,
  y: 20,
  width: 100,
  height: 50,
  rotation: 0,
  style: { stroke: '#000', strokeWidth: 2, fill: null, background: null, arrowHeadStyle: 'filled' },
  ...overrides,
})

const createLine = (overrides: Partial<Line> = {}): Line => ({
  id: 'line-1',
  type: 'line',
  x: 50,
  y: 50,
  width: 100,
  height: 60,
  rotation: 0,
  style: { stroke: '#000', strokeWidth: 2, fill: null, background: null, arrowHeadStyle: 'filled' },
  x2: 80,
  y2: 40,
  ...overrides,
})

describe('shapeBounds', () => {
  describe('getShapeBounds', () => {
    it('returns bounds for rectangle', () => {
      const rect = createRectangle()
      const bounds = getShapeBounds(rect)
      expect(bounds).toEqual({ x: 10, y: 20, width: 100, height: 50 })
    })

    it('returns bounds for line with positive x2, y2', () => {
      const line = createLine({ x2: 80, y2: 40 })
      const bounds = getShapeBounds(line)
      expect(bounds).toEqual({ x: 50, y: 50, width: 80, height: 40 })
    })

    it('returns bounds for line with negative x2, y2', () => {
      const line = createLine({ x2: -30, y2: -20 })
      const bounds = getShapeBounds(line)
      expect(bounds).toEqual({ x: 20, y: 30, width: 30, height: 20 })
    })
  })

  describe('getBoundingBox', () => {
    it('returns empty bounding box for empty array', () => {
      const bbox = getBoundingBox([])
      expect(bbox).toEqual({
        minX: 0, minY: 0, maxX: 0, maxY: 0,
        centerX: 0, centerY: 0, width: 0, height: 0,
      })
    })

    it('calculates bounding box for multiple shapes', () => {
      const rect1 = createRectangle({ x: 0, y: 0, width: 50, height: 50 })
      const rect2 = createRectangle({ x: 100, y: 100, width: 50, height: 50 })
      const bbox = getBoundingBox([rect1, rect2])
      expect(bbox).toEqual({
        minX: 0, minY: 0,
        maxX: 150, maxY: 150,
        centerX: 75, centerY: 75,
        width: 150, height: 150,
      })
    })
  })

  describe('getLineEndpoints', () => {
    it('returns correct endpoints for line', () => {
      const line = createLine({ x: 50, y: 50, x2: 30, y2: -20 })
      const endpoints = getLineEndpoints(line)
      expect(endpoints).toEqual({ baseX: 0, baseY: 20, headX: 30, headY: 0 })
    })
  })

  describe('getResizeHandles', () => {
    it('returns 8 handles for rectangle', () => {
      const rect = createRectangle({ x: 10, y: 20, width: 100, height: 50 })
      const handles = getResizeHandles(rect, 1)
      expect(handles).toHaveLength(8)
      expect(handles[0]).toEqual({ x: 10, y: 20, cursor: 'nw-resize', handle: 'nw' })
      expect(handles[4]).toEqual({ x: 110, y: 70, cursor: 'se-resize', handle: 'se' })
    })

    it('returns 2 handles for line', () => {
      const line = createLine({ x: 50, y: 50, x2: 80, y2: 40 })
      const handles = getResizeHandles(line, 1)
      expect(handles).toHaveLength(2)
      expect(handles[0].handle).toBe('start')
      expect(handles[1].handle).toBe('end')
    })
  })
})
