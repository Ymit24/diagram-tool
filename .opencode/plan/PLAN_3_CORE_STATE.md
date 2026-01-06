# Phase 3: Core State Management

## Goal
Define TypeScript interfaces for shapes and set up Zustand store for application state.

## Steps

### 3.1 Type Definitions
Create `src/types/diagram.ts`:

```typescript
// Shape types
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow'

// Tool types
export type ToolType = 
  | 'select-click'
  | 'select-box'
  | 'select-lasso'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'

// Color palette type
export interface ColorItem {
  name: string
  value: string
}

// Shape style
export interface ShapeStyle {
  stroke: string           // Stroke color (hex)
  strokeWidth: number      // Line thickness in pixels
  fill: string | null      // Fill color (null = transparent)
  background: string | null // Background behind shape
}

// Base shape interface
export interface BaseShape {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  style: ShapeStyle
}

// Specific shape types
export interface Rectangle extends BaseShape {
  type: 'rectangle'
}

export interface Circle extends BaseShape {
  type: 'circle'
  // For circle, width == height (radius * 2)
}

export interface Line extends BaseShape {
  type: 'line'
  x2: number  // End point X (relative to shape x)
  y2: number  // End point Y (relative to shape y)
}

export interface Arrow extends BaseShape {
  type: 'arrow'
  x2: number
  y2: number
  arrowEnd: 'start' | 'end' | 'both' // Where arrowheads appear
}

export type DiagramShape = Rectangle | Circle | Line | Arrow

// Selection state
export interface Selection {
  shapeIds: string[]
  selectionType: 'single' | 'multiple' | 'lasso' | 'none'
}

// Viewport state (for infinite canvas)
export interface Viewport {
  x: number
  y: number
  zoom: number
}

// Drawing state (temporary shape while dragging)
export interface DrawingState {
  isDrawing: boolean
  tool: ToolType
  startX: number
  startY: number
  currentX: number
  currentY: number
  tempShapeId: string | null
}
```

### 3.2 Color Palette Definition
Create `src/constants/colors.ts`:

```typescript
export const COLOR_PALETTE = {
  // Neutrals
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',

  // Reds
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',

  // Oranges
  orange400: '#FB923C',
  orange500: '#F97316',

  // Yellows
  yellow400: '#FACC15',
  yellow500: '#EAB308',

  // Greens
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',

  // Blues
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',

  // Purples
  purple400: '#C084FC',
  purple500: '#A855F7',

  // Pinks
  pink400: '#F472B6',
  pink500: '#EC4899',
} as const

export const DEFAULT_STROKE_COLORS = [
  { name: 'Black', value: COLOR_PALETTE.black },
  { name: 'Gray 700', value: COLOR_PALETTE.gray700 },
  { name: 'Gray 400', value: COLOR_PALETTE.gray400 },
  { name: 'Red 500', value: COLOR_PALETTE.red500 },
  { name: 'Blue 500', value: COLOR_PALETTE.blue500 },
  { name: 'Green 500', value: COLOR_PALETTE.green500 },
]

export const DEFAULT_FILL_COLORS = [
  { name: 'Transparent', value: 'transparent' },
  { name: 'White', value: COLOR_PALETTE.white },
  { name: 'Red 100', value: COLOR_PALETTE.red100 },
  { name: 'Blue 100', value: COLOR_PALETTE.blue100 },
  { name: 'Green 100', value: COLOR_PALETTE.green100 },
  { name: 'Yellow 100', value: COLOR_PALETTE.yellow100 },
]

export const DEFAULT_STROKE_WIDTHS = [1, 2, 4, 6, 8]
```

### 3.3 Zustand Store
Create `src/store/diagramStore.ts`:

```typescript
import { create } from 'zustand'
import { 
  DiagramShape, 
  ToolType, 
  Selection, 
  Viewport,
  DrawingState,
  ShapeStyle 
} from '../types/diagram'

interface DiagramState {
  // Shapes on canvas
  shapes: DiagramShape[]
  
  // Current tool
  currentTool: ToolType
  
  // Tool options (for when tool is selected)
  currentToolOptions: ShapeStyle
  
  // Selection state
  selection: Selection
  
  // Canvas viewport
  viewport: Viewport
  
  // Drawing state (temp shape while dragging)
  drawing: DrawingState
  
  // Actions
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
  // Initial state
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
  
  // Actions
  setTool: (tool) => set({ currentTool: tool }),
  
  setViewport: (viewport) => set((state) => ({ 
    viewport: { ...state.viewport, ...viewport } 
  })),
  
  addShape: (shape) => set((state) => ({ 
    shapes: [...state.shapes, shape] 
  })),
  
  updateShape: (id, updates) => set((state) => ({
    shapes: state.shapes.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  
  deleteShapes: (ids) => set((state) => ({
    shapes: state.shapes.filter(s => !ids.includes(s.id)),
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
```

### 3.4 Helper Functions
Create `src/utils/shape.ts`:

```typescript
import { DiagramShape, Rectangle, Circle, Line, Arrow } from '../types/diagram'
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
  const minX = Math.min(x, x2)
  const minY = Math.min(y, y2)
  return {
    id: uuidv4(),
    type: 'line',
    x: minX,
    y: minY,
    width: Math.abs(x2 - x),
    height: Math.abs(y2 - y),
    x2: x2 - minX,
    y2: y2 - minY,
    rotation: 0,
    style,
  }
}

export function createArrow(x: number, y: number, x2: number, y2: number, style: ShapeStyle): Arrow {
  const minX = Math.min(x, x2)
  const minY = Math.min(y, y2)
  return {
    id: uuidv4(),
    type: 'arrow',
    x: minX,
    y: minY,
    width: Math.abs(x2 - x),
    height: Math.abs(y2 - y),
    x2: x2 - minX,
    y2: y2 - minY,
    arrowEnd: 'end',
    rotation: 0,
    style,
  }
}
```

## Deliverable
- Complete type definitions in `src/types/diagram.ts`
- Color palette constants in `src/constants/colors.ts`
- Zustand store with all state and actions in `src/store/diagramStore.ts`
- Shape factory functions in `src/utils/shape.ts`

## Time Estimate
~30-40 minutes

## Dependencies
- Phase 2 complete

## Next Phase Preview
Phase 4 will implement the actual shape rendering components.
