import { create } from 'zustand'
import type {
  DiagramShape,
  ToolType,
  Selection,
  Viewport,
  DrawingState,
  ShapeStyle
} from '../types/diagram'

interface DiagramState {
  shapes: DiagramShape[]
  currentTool: ToolType
  currentToolOptions: ShapeStyle
  selection: Selection
  viewport: Viewport
  drawing: DrawingState

  setTool: (tool: ToolType) => void
  setViewport: (viewport: Partial<Viewport>) => void
  addShape: (shape: DiagramShape) => void
  updateShape: (id: string, updates: Partial<DiagramShape>) => void
  deleteShapes: (ids: string[]) => void
  setSelection: (selection: Partial<Selection>) => void
  updateToolOptions: (options: Partial<ShapeStyle>) => void
  startDrawing: (tool: ToolType, x: number, y: number) => void
  updateDrawing: (x: number, y: number) => void
  finishDrawing: () => void
  cancelDrawing: () => void
}

export const useDiagramStore = create<DiagramState>((set) => ({
  shapes: [],
  currentTool: 'select-click',
  currentToolOptions: {
    stroke: '#000000',
    strokeWidth: 2,
    fill: 'transparent',
    background: null,
  },
  selection: { shapeIds: [], selectionType: 'none' },
  viewport: { x: 0, y: 0, zoom: 1 },
  drawing: { isDrawing: false, tool: 'select-click', startX: 0, startY: 0, currentX: 0, currentY: 0, tempShapeId: null },

  setTool: (tool) => set({ currentTool: tool }),

  setViewport: (viewport) => set((state) => ({
    viewport: { ...state.viewport, ...viewport }
  })),

  addShape: (shape) => set((state) => ({
    shapes: [...state.shapes, shape] as DiagramShape[]
  })),

  updateShape: (id, updates) => set((state) => ({
    shapes: state.shapes.map((s) => s.id === id ? { ...s, ...updates } : s) as DiagramShape[]
  })),

  deleteShapes: (ids) => set((state) => ({
    shapes: state.shapes.filter((s) => !ids.includes(s.id)) as DiagramShape[],
    selection: { shapeIds: [], selectionType: 'none' }
  })),

  setSelection: (selection) => set((state) => ({
    selection: { ...state.selection, ...selection }
  })),

  updateToolOptions: (options) => set((state) => ({
    currentToolOptions: { ...state.currentToolOptions, ...options }
  })),

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
}))
