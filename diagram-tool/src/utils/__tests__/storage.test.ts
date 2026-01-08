import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { saveToStorage, loadFromStorage, clearStorage, debounce, STORAGE_KEY, STORAGE_VERSION } from '../storage'
import type { DiagramShape, Selection, Viewport, ToolType, ShapeStyle } from '../../types/diagram'

const createShape = (id: string): DiagramShape => ({
  id,
  type: 'rectangle',
  x: 0,
  y: 0,
  width: 100,
  height: 50,
  rotation: 0,
  style: { stroke: '#000', strokeWidth: 2, fill: null, background: null, arrowHeadStyle: 'filled' },
})

const createPersistedData = (overrides: Partial<{
  shapes: DiagramShape[]
  selection: Selection
  viewport: Viewport
  currentTool: ToolType
  currentToolOptions: ShapeStyle
}> = {}) => ({
  shapes: overrides.shapes ?? [createShape('1')],
  selection: overrides.selection ?? { shapeIds: ['1'], selectionType: 'single' },
  viewport: overrides.viewport ?? { x: 0, y: 0, zoom: 1 },
  currentTool: overrides.currentTool ?? 'select-click',
  currentToolOptions: overrides.currentToolOptions ?? {
    stroke: '#000000',
    strokeWidth: 2,
    fill: 'transparent',
    background: null,
    arrowHeadStyle: 'filled',
  },
})

const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] ?? null
  },
  setItem(key: string, value: string) {
    this.store[key] = value
  },
  removeItem(key: string) {
    delete this.store[key]
  },
  clear() {
    this.store = {}
  },
}

describe('storage', () => {
  beforeEach(() => {
    vi.spyOn(localStorageMock, 'getItem')
    vi.spyOn(localStorageMock, 'setItem')
    vi.spyOn(localStorageMock, 'removeItem')
    vi.spyOn(localStorageMock, 'clear')

    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorageMock.clear()
  })

  describe('saveToStorage and loadFromStorage', () => {
    it('saves and loads data correctly', () => {
      const data = createPersistedData({
        shapes: [createShape('1'), createShape('2')],
        selection: { shapeIds: ['1'], selectionType: 'single' },
      })

      saveToStorage(data)
      const loaded = loadFromStorage()

      expect(loaded).not.toBeNull()
      expect(loaded!.version).toBe(STORAGE_VERSION)
      expect(loaded!.shapes).toHaveLength(2)
      expect(loaded!.selection.shapeIds).toEqual(['1'])
      expect(loaded!.lastSaved).toBeDefined()
    })

    it('saves empty shapes array', () => {
      const data = createPersistedData({ shapes: [] })
      saveToStorage(data)

      const loaded = loadFromStorage()
      expect(loaded).not.toBeNull()
      expect(loaded!.shapes).toHaveLength(0)
    })

    it('returns null when no data exists', () => {
      const loaded = loadFromStorage()
      expect(loaded).toBeNull()
    })

    it('returns null for corrupted JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not valid json')
      const loaded = loadFromStorage()
      expect(loaded).toBeNull()
    })

    it('returns null for invalid schema - missing shapes', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, selection: {}, viewport: {}, currentTool: '', currentToolOptions: {}, lastSaved: '' }))
      const loaded = loadFromStorage()
      expect(loaded).toBeNull()
    })

    it('returns null for wrong version', () => {
      const data = createPersistedData()
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, version: 999 }))
      const loaded = loadFromStorage()
      expect(loaded).toBeNull()
    })

    it('handles localStorage errors gracefully', () => {
      vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })
      const data = createPersistedData()
      expect(() => saveToStorage(data)).not.toThrow()
    })
  })

  describe('clearStorage', () => {
    it('removes data from localStorage', () => {
      const data = createPersistedData()
      saveToStorage(data)
      expect(loadFromStorage()).not.toBeNull()

      clearStorage()
      expect(loadFromStorage()).toBeNull()
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('delays execution', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('only calls once for multiple rapid calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('resets timer on subsequent calls', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      vi.advanceTimersByTime(50)

      debouncedFn()
      vi.advanceTimersByTime(50)
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('passes arguments to wrapped function', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn(42, 'test')
      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledWith(42, 'test')
    })

    it('uses default delay of 500ms', () => {
      const fn = vi.fn()
      const debouncedFn = debounce(fn)

      debouncedFn()
      vi.advanceTimersByTime(400)
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })
})
