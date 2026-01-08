import { describe, it, expect } from 'vitest'
import { calculateResizeUpdate, applyResizeUpdate, getCursorForHandle } from '../resize'
import type { Rectangle, Line } from '../../types/diagram'

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

describe('resize', () => {
  describe('calculateResizeUpdate', () => {
    describe('rectangle resize', () => {
      it('handles nw corner resize', () => {
        const rect = createRectangle()
        const result = calculateResizeUpdate(rect, 'nw', 5, 10)
        expect(result.updates).toEqual({
          x: 5,
          y: 10,
          width: 105,
          height: 60,
        })
      })

      it('handles se corner resize', () => {
        const rect = createRectangle()
        const result = calculateResizeUpdate(rect, 'se', 120, 80)
        expect(result.updates).toEqual({
          width: 110,
          height: 60,
        })
      })

      it('handles e edge resize', () => {
        const rect = createRectangle()
        const result = calculateResizeUpdate(rect, 'e', 150, 0)
        expect(result.updates).toEqual({
          width: 140,
        })
      })

      it('returns undefined for width/height below minimum', () => {
        const rect = createRectangle()
        const result = calculateResizeUpdate(rect, 'se', 15, 25)
        expect(result.constrained.width).toBeUndefined()
        expect(result.constrained.height).toBeUndefined()
      })

      it('constrains x/y to non-negative values', () => {
        const rect = createRectangle()
        const result = calculateResizeUpdate(rect, 'nw', 5, 10)
        expect(result.constrained.x).toBe(5)
        expect(result.constrained.y).toBe(10)
      })
    })

    describe('line resize', () => {
      it('handles start point resize', () => {
        const line = createLine()
        const result = calculateResizeUpdate(line, 'start', 30, 40)
        expect(result.updates).toEqual({
          x: 30,
          y: 40,
        })
      })

      it('handles end point resize', () => {
        const line = createLine()
        const result = calculateResizeUpdate(line, 'end', 150, 100)
        expect(result.updates).toEqual({
          x2: 100,
          y2: 50,
        })
      })
    })
  })

  describe('applyResizeUpdate', () => {
    it('applies resize updates to rectangle', () => {
      const rect = createRectangle()
      const updates = { x: 5, y: 10, width: 150, height: 80 }
      const result = applyResizeUpdate(rect, updates)
      expect(result).toEqual({
        ...rect,
        ...updates,
      })
    })

    it('applies partial updates', () => {
      const rect = createRectangle()
      const updates = { width: 200 }
      const result = applyResizeUpdate(rect, updates)
      expect(result.width).toBe(200)
      expect(result.x).toBe(10)
    })
  })

  describe('getCursorForHandle', () => {
    it('returns correct cursor for corner handles', () => {
      expect(getCursorForHandle('nw')).toBe('nw-resize')
      expect(getCursorForHandle('se')).toBe('se-resize')
    })

    it('returns correct cursor for edge handles', () => {
      expect(getCursorForHandle('n')).toBe('n-resize')
      expect(getCursorForHandle('e')).toBe('e-resize')
      expect(getCursorForHandle('w')).toBe('w-resize')
      expect(getCursorForHandle('s')).toBe('s-resize')
    })

    it('returns correct cursor for line handles', () => {
      expect(getCursorForHandle('start')).toBe('nwse-resize')
      expect(getCursorForHandle('end')).toBe('nwse-resize')
    })
  })
})
