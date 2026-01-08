import { describe, it, expect } from 'vitest'
import { createHistoryEntry, pushHistory, undo, redo, clearFuture, MAX_HISTORY } from '../history'
import type { DiagramShape, Selection } from '../../types/diagram'

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

const createState = (shapes: DiagramShape[], selection: Selection) => ({
  shapes,
  selection,
})

describe('history', () => {
  describe('createHistoryEntry', () => {
    it('creates a history entry with correct structure', () => {
      const shapes = [createShape('1')]
      const selection = { shapeIds: ['1'], selectionType: 'single' as const }
      const state = createState(shapes, selection)
      const entry = createHistoryEntry(state, 'add', 'Add shape')
      
      expect(entry).toEqual({
        type: 'add',
        shapes: shapes,
        selection: selection,
        timestamp: expect.any(Number),
        description: 'Add shape',
      })
    })
  })

  describe('pushHistory', () => {
    it('adds entry to past history', () => {
      const entry = createHistoryEntry(createState([], { shapeIds: [], selectionType: 'none' }), 'add', 'test')
      const past = pushHistory([], entry)
      expect(past).toHaveLength(1)
      expect(past[0]).toEqual(entry)
    })

    it('maintains max history limit', () => {
      let past: ReturnType<typeof pushHistory> = []
      for (let i = 0; i < MAX_HISTORY + 10; i++) {
        const entry = createHistoryEntry(
          createState([createShape(String(i))], { shapeIds: [], selectionType: 'none' }),
          'add',
          `shape-${i}`
        )
        past = pushHistory(past, entry)
      }
      expect(past).toHaveLength(MAX_HISTORY)
      expect(past[0].description).toBe('shape-10')
    })
  })

  describe('undo', () => {
    it('returns null when no history', () => {
      const result = undo([], [], [], { shapeIds: [], selectionType: 'none' })
      expect(result).toBeNull()
    })

    it('moves last entry from past to future and restores previous state', () => {
      const shapes1 = [createShape('1')]
      const shapes2 = [createShape('1'), createShape('2')]
      const selection1 = { shapeIds: ['1'], selectionType: 'single' as const }
      const selection2 = { shapeIds: ['1', '2'], selectionType: 'multiple' as const }
      
      const entry1 = createHistoryEntry(createState(shapes1, selection1), 'add', 'first')
      const entry2 = createHistoryEntry(createState(shapes2, selection2), 'add', 'second')
      
      const past = [entry1, entry2]
      const future: typeof past = []
      
      const result = undo(past, future, shapes2, selection2)
      expect(result).not.toBeNull()
      expect(result!.past).toHaveLength(1)
      expect(result!.future).toHaveLength(1)
      expect(result!.future[0]).toEqual(entry2)
    })
  })

  describe('redo', () => {
    it('returns null when no future', () => {
      const result = redo([], [], [], { shapeIds: [], selectionType: 'none' })
      expect(result).toBeNull()
    })

    it('moves first entry from future to past', () => {
      const shapes1 = [createShape('1')]
      const shapes2 = [createShape('1'), createShape('2')]
      const selection1 = { shapeIds: ['1'], selectionType: 'single' as const }
      const selection2 = { shapeIds: ['1', '2'], selectionType: 'multiple' as const }
      
      const entry1 = createHistoryEntry(createState(shapes1, selection1), 'add', 'first')
      const entry2 = createHistoryEntry(createState(shapes2, selection2), 'add', 'second')
      
      const past = [entry1]
      const future = [entry2]
      
      const result = redo(past, future, shapes1, selection1)
      expect(result).not.toBeNull()
      expect(result!.past).toHaveLength(2)
      expect(result!.future).toHaveLength(0)
      expect(result!.past[1]).toEqual(entry2)
    })
  })

  describe('clearFuture', () => {
    it('clears future history', () => {
      const entry1 = createHistoryEntry(createState([], { shapeIds: [], selectionType: 'none' }), 'add', 'first')
      const entry2 = createHistoryEntry(createState([], { shapeIds: [], selectionType: 'none' }), 'add', 'second')
      const future = [entry1, entry2]
      const result = clearFuture(future)
      expect(result).toHaveLength(0)
    })
  })
})
