import { create } from 'zustand'
import type {
  DiagramShape,
  ToolType,
  Selection,
  Viewport,
  DrawingState,
  ShapeStyle
} from '../types/diagram'
import { alignShapes, distributeShapes, type AlignmentType, type DistributionType } from '../utils/alignment'
import { calculateResizeUpdate, applyResizeUpdate, type ResizeHandle } from '../utils/resize'
import { createHistoryEntry, pushHistory, undo as undoHistory, redo as redoHistory } from '../utils/history'

interface DiagramState {
  shapes: DiagramShape[]
  currentTool: ToolType
  currentToolOptions: ShapeStyle
  selection: Selection
  viewport: Viewport
  drawing: DrawingState
  resizingShapeId: string | null
  resizeHandle: ResizeHandle | null
  resizeStartShape: DiagramShape | null
  past: ReturnType<typeof createHistoryEntry>[]
  future: ReturnType<typeof createHistoryEntry>[]

  setTool: (tool: ToolType) => void
  setViewport: (viewport: Partial<Viewport>) => void
  addShape: (shape: DiagramShape) => void
  updateShape: (id: string, updates: Partial<DiagramShape>, skipHistory?: boolean) => void
  deleteShapes: (ids: string[]) => void
  setSelection: (selection: Partial<Selection>) => void
  updateToolOptions: (options: Partial<ShapeStyle>) => void
  updateSelectedShapes: (updates: Partial<ShapeStyle>) => void
  startDrawing: (tool: ToolType, x: number, y: number) => void
  updateDrawing: (x: number, y: number) => void
  finishDrawing: () => void
  cancelDrawing: () => void
  startResize: (shapeId: string, handle: ResizeHandle) => void
  updateResize: (currentX: number, currentY: number) => void
  endResize: () => void
  undo: () => void
  redo: () => void
  clearFuture: () => void
  alignShapes: (alignment: AlignmentType) => void
  distributeShapes: (distribution: DistributionType) => void
}

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
    const entry = createHistoryEntry(state, 'add', 'Add shape')
    return {
      shapes: [...state.shapes, shape] as DiagramShape[],
      past: pushHistory(state.past, entry),
      future: [],
    }
  }),

  updateShape: (id, updates, skipHistory = false) => set((state) => {
    let newPast = state.past
    let newFuture: typeof state.future = []
    if (!skipHistory) {
      const entry = createHistoryEntry(state, 'update', 'Update shape')
      newPast = pushHistory(state.past, entry)
      newFuture = []
    }
    return {
      shapes: state.shapes.map((s) => s.id === id ? { ...s, ...updates } : s) as DiagramShape[],
      past: newPast,
      future: newFuture,
    }
  }),

  deleteShapes: (ids) => set((state) => {
    if (ids.length === 0) return state
    const entry = createHistoryEntry(state, 'delete', 'Delete shapes')
    return {
      shapes: state.shapes.filter((s) => !ids.includes(s.id)) as DiagramShape[],
      selection: { shapeIds: [], selectionType: 'none' },
      past: pushHistory(state.past, entry),
      future: [],
    }
  }),

  setSelection: (selection) => set((state) => {
    if (state.selection.shapeIds.length === 0 && selection.shapeIds?.length === 0) {
      return state
    }
    const entry = createHistoryEntry(state, 'select', 'Select shapes')
    return {
      selection: { ...state.selection, ...selection },
      past: pushHistory(state.past, entry),
      future: [],
    }
  }),

  updateToolOptions: (options) => set((state) => ({
    currentToolOptions: { ...state.currentToolOptions, ...options }
  })),

  updateSelectedShapes: (updates) => set((state) => {
    if (state.selection.shapeIds.length === 0) return state
    const entry = createHistoryEntry(state, 'update', 'Update shapes')
    return {
      shapes: state.shapes.map((s) =>
        state.selection.shapeIds.includes(s.id)
          ? { ...s, style: { ...s.style, ...updates } }
          : s
      ) as DiagramShape[],
      past: pushHistory(state.past, entry),
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
    if (!state.resizeStartShape || !state.resizingShapeId || !state.resizeHandle) return {}

    const { constrained } = calculateResizeUpdate(
      state.resizeStartShape,
      state.resizeHandle,
      currentX,
      currentY
    )

    return {
      shapes: state.shapes.map(s => {
        if (s.id !== state.resizingShapeId) return s
        return applyResizeUpdate(s, constrained)
      }) as DiagramShape[]
    }
  }),

  endResize: () => set((state) => {
    if (!state.resizingShapeId) return state
    const entry = createHistoryEntry(state, 'update', 'Resize shape')
    return {
      resizingShapeId: null,
      resizeHandle: null,
      resizeStartShape: null,
      past: pushHistory(state.past, entry),
      future: [],
    }
  }),

  undo: () => set((state) => {
    const result = undoHistory(state.past, state.future, state.shapes, state.selection)
    if (!result) return state
    return {
      shapes: result.shapes,
      selection: result.selection,
      past: result.past,
      future: result.future,
    }
  }),

  redo: () => set((state) => {
    const result = redoHistory(state.past, state.future, state.shapes, state.selection)
    if (!result) return state
    return {
      shapes: result.shapes,
      selection: result.selection,
      past: result.past,
      future: result.future,
    }
  }),

  clearFuture: () => set({ future: [] }),

  alignShapes: (alignment) => set((state) => {
    if (state.selection.shapeIds.length < 2) return state

    const selectedShapes = state.shapes.filter(s => state.selection.shapeIds.includes(s.id))
    const updates = alignShapes(selectedShapes, alignment)

    const entry = createHistoryEntry(state, 'update', `Align ${alignment}`)
    return {
      shapes: state.shapes.map(s => {
        const update = updates.get(s.id)
        return update ? { ...s, ...update } : s
      }) as DiagramShape[],
      past: pushHistory(state.past, entry),
      future: [],
    }
  }),

  distributeShapes: (distribution) => set((state) => {
    if (state.selection.shapeIds.length < 3) return state

    const selectedShapes = state.shapes.filter(s => state.selection.shapeIds.includes(s.id))
    const updates = distributeShapes(selectedShapes, distribution)

    if (updates.size === 0) return state

    const entry = createHistoryEntry(state, 'update', `Distribute ${distribution}`)
    return {
      shapes: state.shapes.map(s => {
        const update = updates.get(s.id)
        return update ? { ...s, ...update } : s
      }) as DiagramShape[],
      past: pushHistory(state.past, entry),
      future: [],
    }
  }),
}))
