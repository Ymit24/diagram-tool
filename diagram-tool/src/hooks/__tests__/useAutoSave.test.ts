import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, cleanup, act } from '@testing-library/react'
import { useAutoSave, useRelativeTime, type SaveStatus } from '../useAutoSave'
import * as storageUtils from '../../utils/storage'
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

vi.mock('../../store/diagramStore', () => ({
  useDiagramStore: vi.fn(),
}))

import { useDiagramStore } from '../../store/diagramStore'

describe('useAutoSave', () => {
  describe('useRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns empty string for null date', () => {
      expect(useRelativeTime(null)).toBe('')
    })

    it('returns "Saved just now" for dates within 5 seconds', () => {
      const now = new Date()
      expect(useRelativeTime(now)).toBe('Saved just now')

      const fourSecondsAgo = new Date(now.getTime() - 4000)
      expect(useRelativeTime(fourSecondsAgo)).toBe('Saved just now')
    })

    it('returns seconds ago for dates within 60 seconds', () => {
      const now = new Date()
      const tenSecondsAgo = new Date(now.getTime() - 10000)
      expect(useRelativeTime(tenSecondsAgo)).toBe('Saved 10s ago')

      const thirtySecondsAgo = new Date(now.getTime() - 30000)
      expect(useRelativeTime(thirtySecondsAgo)).toBe('Saved 30s ago')
    })

    it('returns minutes ago for dates within 60 minutes', () => {
      const now = new Date()
      const twoMinutesAgo = new Date(now.getTime() - 120000)
      expect(useRelativeTime(twoMinutesAgo)).toBe('Saved 2m ago')

      const thirtyMinutesAgo = new Date(now.getTime() - 1800000)
      expect(useRelativeTime(thirtyMinutesAgo)).toBe('Saved 30m ago')
    })

    it('returns hours ago for dates within 24 hours', () => {
      const now = new Date()
      const twoHoursAgo = new Date(now.getTime() - 7200000)
      expect(useRelativeTime(twoHoursAgo)).toBe('Saved 2h ago')

      const twelveHoursAgo = new Date(now.getTime() - 43200000)
      expect(useRelativeTime(twelveHoursAgo)).toBe('Saved 12h ago')
    })

    it('returns time for older dates', () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 86400000 - 3600000)
      const timeString = yesterday.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      const result = useRelativeTime(yesterday)
      expect(result).toContain(timeString)
    })
  })

  describe('useAutoSave hook', () => {
    let saveToStorageMock: ReturnType<typeof vi.fn>
    const storeStateRef = {
      shapes: [createShape('1')] as DiagramShape[],
      selection: { shapeIds: ['1'], selectionType: 'single' } as Selection,
      viewport: { x: 0, y: 0, zoom: 1 } as Viewport,
      currentTool: 'select-click' as ToolType,
      currentToolOptions: {
        stroke: '#000000',
        strokeWidth: 2,
        fill: 'transparent',
        background: null,
        arrowHeadStyle: 'filled',
      } as ShapeStyle,
    }

    beforeEach(() => {
      vi.useFakeTimers()
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
      })

      storeStateRef.shapes = [createShape('1')]
      storeStateRef.selection = { shapeIds: ['1'], selectionType: 'single' }
      storeStateRef.viewport = { x: 0, y: 0, zoom: 1 }
      storeStateRef.currentTool = 'select-click'
      storeStateRef.currentToolOptions = {
        stroke: '#000000',
        strokeWidth: 2,
        fill: 'transparent',
        background: null,
        arrowHeadStyle: 'filled',
      }

      saveToStorageMock = vi.fn()
      vi.spyOn(storageUtils, 'saveToStorage').mockImplementation(saveToStorageMock)
      ;(useDiagramStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => selector(storeStateRef))
    })

    afterEach(() => {
      vi.useRealTimers()
      vi.restoreAllMocks()
      cleanup()
      localStorageMock.clear()
    })

    describe('initial state', () => {
      it('returns idle status before any save', () => {
        const { result } = renderHook(() => useAutoSave())
        expect(result.current.status).toBe('idle')
      })

      it('returns null lastSaved initially', () => {
        const { result } = renderHook(() => useAutoSave())
        expect(result.current.lastSaved).toBeNull()
      })
    })

    describe('status transitions - success path', () => {
      it('transitions from idle to saving to saved on successful save', () => {
        const { result } = renderHook(() => useAutoSave())

        expect(result.current.status).toBe('idle')

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        expect(result.current.status).toBe('idle')

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(result.current.status).toBe('saved')
      })

      it('sets lastSaved timestamp on successful save', () => {
        const { result } = renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(result.current.lastSaved).not.toBeNull()
        expect(result.current.lastSaved).toBeInstanceOf(Date)
      })
    })

    describe('status transitions - error path', () => {
      it('transitions to error when save fails', () => {
        saveToStorageMock.mockImplementation(() => {
          throw new Error('Save failed')
        })

        const { result } = renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(result.current.status).toBe('error')
      })

      it('keeps lastSaved null on error', () => {
        saveToStorageMock.mockImplementation(() => {
          throw new Error('Save failed')
        })

        const { result } = renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(result.current.lastSaved).toBeNull()
      })
    })

    describe('debounce behavior', () => {
      it('triggers save after debounce delay', () => {
        renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        expect(saveToStorageMock).not.toHaveBeenCalled()

        act(() => {
          vi.advanceTimersByTime(400)
        })

        expect(saveToStorageMock).not.toHaveBeenCalled()

        act(() => {
          vi.advanceTimersByTime(200)
        })

        expect(saveToStorageMock).toHaveBeenCalledTimes(1)
      })

      it('calls save only once for multiple rapid state changes', () => {
        renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
          storeStateRef.shapes.push(createShape('3'))
          storeStateRef.shapes.push(createShape('4'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(saveToStorageMock).toHaveBeenCalledTimes(1)
      })

      it('cancels pending save on hook unmount', () => {
        const { unmount } = renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        unmount()

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(saveToStorageMock).not.toHaveBeenCalled()
      })
    })

    describe('store state dependencies', () => {
      it('triggers save when shapes change', () => {
        renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(saveToStorageMock).toHaveBeenCalledTimes(1)
      })

      it('triggers save when selection changes', () => {
        renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.selection = { shapeIds: ['1', '2'], selectionType: 'multiple' }
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(saveToStorageMock).toHaveBeenCalledTimes(1)
      })

      it('triggers save when viewport changes', () => {
        renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.viewport = { x: 100, y: 100, zoom: 1.5 }
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(saveToStorageMock).toHaveBeenCalledTimes(1)
      })

      it('triggers save when tool options change', () => {
        renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.currentToolOptions = { ...storeStateRef.currentToolOptions, stroke: '#ff0000' }
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(saveToStorageMock).toHaveBeenCalledTimes(1)
      })
    })

    describe('lastSaved updates', () => {
      it('sets lastSaved after successful save', () => {
        const { result } = renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(result.current.lastSaved).not.toBeNull()
      })

      it('does not update lastSaved on error', () => {
        saveToStorageMock.mockImplementation(() => {
          throw new Error('Save failed')
        })

        const { result } = renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(result.current.lastSaved).toBeNull()
      })
    })

    describe('error handling', () => {
      it('transitions to error status when save fails', () => {
        saveToStorageMock.mockImplementation(() => {
          throw new Error('Save failed')
        })

        const { result } = renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(result.current.status).toBe('error')
      })

      it('handles saveToStorage throwing non-Error exceptions', () => {
        saveToStorageMock.mockImplementation(() => {
          throw 'string error'
        })

        const { result } = renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(result.current.status).toBe('error')
      })
    })

    describe('save invocation', () => {
      it('calls saveToStorage on state change', () => {
        renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(saveToStorageMock).toHaveBeenCalledTimes(1)
      })

      it('passes shapes array to saveToStorage', () => {
        renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.shapes.push(createShape('2'))
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(saveToStorageMock).toHaveBeenCalledWith(
          expect.objectContaining({
            shapes: expect.any(Array),
          })
        )
      })

      it('passes selection object to saveToStorage', () => {
        renderHook(() => useAutoSave())

        act(() => {
          storeStateRef.selection = { shapeIds: ['1', '2'], selectionType: 'multiple' }
        })

        act(() => {
          vi.advanceTimersByTime(600)
        })

        expect(saveToStorageMock).toHaveBeenCalledWith(
          expect.objectContaining({
            selection: expect.any(Object),
          })
        )
      })
    })
  })
})

describe('SaveStatus type', () => {
  it('accepts all valid status values', () => {
    const statuses: SaveStatus[] = ['idle', 'saving', 'saved', 'error']
    expect(statuses).toHaveLength(4)
  })
})
