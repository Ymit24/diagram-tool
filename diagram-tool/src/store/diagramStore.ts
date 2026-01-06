import { create } from 'zustand'
import type {
  DiagramShape,
  ToolType,
  Selection,
  Viewport,
  DrawingState,
  ShapeStyle
} from '../types/diagram'
import type { HistoryActionType, HistoryEntry } from '../types/history'
import { alignShapes, distributeShapes, type AlignmentType, type DistributionType } from '../utils/alignment'

const MAX_HISTORY = 50

interface DiagramState {
  shapes: DiagramShape[]
  currentTool: ToolType
  currentToolOptions: ShapeStyle
  selection: Selection
  viewport: Viewport
  drawing: DrawingState
  resizingShapeId: string | null
  resizeHandle: string | null
  resizeStartShape: DiagramShape | null
  past: HistoryEntry[]
  future: HistoryEntry[]

  setTool: (tool: ToolType) => void
  setViewport: (viewport: Partial<Viewport>) => void
  addShape: (shape: DiagramShape) => void
  updateShape: (id: string, updates: Partial<DiagramShape>) => void
  deleteShapes: (ids: string[]) => void
  setSelection: (selection: Partial<Selection>) => void
  updateToolOptions: (options: Partial<ShapeStyle>) => void
  updateSelectedShapes: (updates: Partial<ShapeStyle>) => void
  startDrawing: (tool: ToolType, x: number, y: number) => void
  updateDrawing: (x: number, y: number) => void
  finishDrawing: () => void
  cancelDrawing: () => void
  startResize: (shapeId: string, handle: string) => void
  updateResize: (currentX: number, currentY: number) => void
  endResize: () => void
  undo: () => void
  redo: () => void
  clearFuture: () => void
  alignShapes: (alignment: AlignmentType) => void
  distributeShapes: (distribution: DistributionType) => void
}

const recordHistory = (state: DiagramState, type: HistoryActionType, description: string): HistoryEntry => ({
  type,
  shapes: [...state.shapes],
  selection: { ...state.selection },
  timestamp: Date.now(),
  description,
})

export const useDiagramStore = create<DiagramState>((set) => ({
  shapes: [],
  currentTool: 'select-click',
  currentToolOptions: {
    stroke: '#000000',
    strokeWidth: 2,
    fill: 'transparent',
    background: null,
    arrowHeadStyle: 'filled',
  },
  selection: { shapeIds: [], selectionType: 'none' },
  viewport: { x: 0, y: 0, zoom: 1 },
  drawing: { isDrawing: false, tool: 'select-click', startX: 0, startY: 0, currentX: 0, currentY: 0, tempShapeId: null },
  resizingShapeId: null,
  resizeHandle: null,
  resizeStartShape: null,
  past: [],
  future: [],

  setTool: (tool) => set({ currentTool: tool }),

  setViewport: (viewport) => set((state) => ({
    viewport: { ...state.viewport, ...viewport }
  })),

  addShape: (shape) => set((state) => {
    const entry = recordHistory(state, 'add', 'Add shape')
    const newPast = [...state.past, entry].slice(-MAX_HISTORY)
    return {
      shapes: [...state.shapes, shape] as DiagramShape[],
      past: newPast,
      future: [],
    }
  }),

  updateShape: (id, updates) => set((state) => {
    const entry = recordHistory(state, 'update', 'Update shape')
    const newPast = [...state.past, entry].slice(-MAX_HISTORY)
    return {
      shapes: state.shapes.map((s) => s.id === id ? { ...s, ...updates } : s) as DiagramShape[],
      past: newPast,
      future: [],
    }
  }),

  deleteShapes: (ids) => set((state) => {
    if (ids.length === 0) return state
    const entry = recordHistory(state, 'delete', 'Delete shapes')
    const newPast = [...state.past, entry].slice(-MAX_HISTORY)
    return {
      shapes: state.shapes.filter((s) => !ids.includes(s.id)) as DiagramShape[],
      selection: { shapeIds: [], selectionType: 'none' },
      past: newPast,
      future: [],
    }
  }),

  setSelection: (selection) => set((state) => {
    if (state.selection.shapeIds.length === 0 && selection.shapeIds?.length === 0) {
      return state
    }
    const entry = recordHistory(state, 'select', 'Select shapes')
    const newPast = [...state.past, entry].slice(-MAX_HISTORY)
    return {
      selection: { ...state.selection, ...selection },
      past: newPast,
      future: [],
    }
  }),

  updateToolOptions: (options) => set((state) => ({
    currentToolOptions: { ...state.currentToolOptions, ...options }
  })),

  updateSelectedShapes: (updates) => set((state) => {
    if (state.selection.shapeIds.length === 0) return state
    const entry = recordHistory(state, 'update', 'Update shapes')
    const newPast = [...state.past, entry].slice(-MAX_HISTORY)
    return {
      shapes: state.shapes.map((s) =>
        state.selection.shapeIds.includes(s.id)
          ? { ...s, style: { ...s.style, ...updates } }
          : s
      ) as DiagramShape[],
      past: newPast,
      future: [],
    }
  }),

  startDrawing: (tool, x, y) => set({
    drawing: { isDrawing: true, tool, startX: x, startY: y, currentX: x, currentY: y, tempShapeId: null }
  }),

  updateDrawing: (x, y) => set((state) => ({
    drawing: { ...state.drawing, currentX: x, currentY: y }
  })),

  finishDrawing: () => set({
    drawing: { isDrawing: false, tool: 'select-click', startX: 0, startY: 0, currentX: 0, currentY: 0, tempShapeId: null }
  }),

  cancelDrawing: () => set({
    drawing: { isDrawing: false, tool: 'select-click', startX: 0, startY: 0, currentX: 0, currentY: 0, tempShapeId: null }
  }),

  startResize: (shapeId, handle) => set((state) => {
    const shape = state.shapes.find(s => s.id === shapeId)
    return {
      resizingShapeId: shapeId,
      resizeHandle: handle,
      resizeStartShape: shape || null
    }
  }),

  updateResize: (currentX, currentY) => set((state) => {
    if (!state.resizeStartShape || !state.resizingShapeId) return {}

    const startShape = state.resizeStartShape
    const startX = startShape.x
    const startY = startShape.y
    const startW = startShape.width
    const startH = startShape.height

    const updates: Record<string, number | string> = {}

    if (startShape.type === 'line' || startShape.type === 'arrow') {
      if (state.resizeHandle === 'start') {
        updates.x = currentX
        updates.y = currentY
      } else {
        updates.x2 = currentX - startX
        updates.y2 = currentY - startY
      }
    } else {
      switch (state.resizeHandle) {
        case 'nw':
          updates.x = currentX
          updates.y = currentY
          updates.width = startX + startW - currentX
          updates.height = startY + startH - currentY
          break
        case 'n':
          updates.y = currentY
          updates.height = startY + startH - currentY
          break
        case 'ne':
          updates.y = currentY
          updates.width = currentX - startX
          updates.height = startY + startH - currentY
          break
        case 'e':
          updates.width = currentX - startX
          break
        case 'se':
          updates.width = currentX - startX
          updates.height = currentY - startY
          break
        case 's':
          updates.height = currentY - startY
          break
        case 'sw':
          updates.x = currentX
          updates.width = startX + startW - currentX
          updates.height = currentY - startY
          break
        case 'w':
          updates.x = currentX
          updates.width = startX + startW - currentX
          break
      }
    }

    const constrainedUpdates: Partial<DiagramShape> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'number' && value >= 10 || (typeof value === 'number' && key !== 'width' && key !== 'height')) {
        (constrainedUpdates as Record<string, number | string>)[key] = value
      }
    }

    return {
      shapes: state.shapes.map(s => {
        if (s.id !== state.resizingShapeId) return s
        return { ...s, ...constrainedUpdates }
      }) as DiagramShape[]
    }
  }),

  endResize: () => set((state) => {
    if (!state.resizingShapeId) return state
    const entry = recordHistory(state, 'update', 'Resize shape')
    const newPast = [...state.past, entry].slice(-MAX_HISTORY)
    return {
      resizingShapeId: null,
      resizeHandle: null,
      resizeStartShape: null,
      past: newPast,
      future: [],
    }
  }),

  undo: () => set((state) => {
    if (state.past.length === 0) return state
    const entry = state.past[state.past.length - 1]
    return {
      shapes: entry.shapes,
      selection: entry.selection,
      past: state.past.slice(0, -1),
      future: [entry, ...state.future],
    }
  }),

  redo: () => set((state) => {
    if (state.future.length === 0) return state
    const entry = state.future[0]
    return {
      shapes: entry.shapes,
      selection: entry.selection,
      past: [...state.past, entry],
      future: state.future.slice(1),
    }
  }),

  clearFuture: () => set({ future: [] }),

  alignShapes: (alignment) => set((state) => {
    if (state.selection.shapeIds.length < 2) return state

    const selectedShapes = state.shapes.filter(s => state.selection.shapeIds.includes(s.id))
    const updates = alignShapes(selectedShapes, alignment)

    const entry = recordHistory(state, 'update', `Align ${alignment}`)
    return {
      shapes: state.shapes.map(s => {
        const update = updates.get(s.id)
        return update ? { ...s, ...update } : s
      }) as DiagramShape[],
      past: [...state.past, entry].slice(-MAX_HISTORY),
      future: [],
    }
  }),

  distributeShapes: (distribution) => set((state) => {
    if (state.selection.shapeIds.length < 3) return state

    const selectedShapes = state.shapes.filter(s => state.selection.shapeIds.includes(s.id))
    const updates = distributeShapes(selectedShapes, distribution)

    if (updates.size === 0) return state

    const entry = recordHistory(state, 'update', `Distribute ${distribution}`)
    return {
      shapes: state.shapes.map(s => {
        const update = updates.get(s.id)
        return update ? { ...s, ...update } : s
      }) as DiagramShape[],
      past: [...state.past, entry].slice(-MAX_HISTORY),
      future: [],
    }
  }),
}))
