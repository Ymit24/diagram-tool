# AGENTS.md - Diagram Tool Development Guide

This document provides instructions for AI agents working on the Diagram Tool project.

## Project Overview

A web-based diagramming tool with an infinite SVG canvas. Users can create and manipulate shapes (rectangles, circles, lines, arrows) using various selection modes and apply styling through a floating options panel.

**Tech Stack**: Vite + React + TypeScript + Bun + Tailwind CSS v4 + Zustand

## Development Phases

This project was developed in 9 sequential phases. Each phase depends on the previous one being complete:

1. **Phase 1** - Project Scaffold: Vite + React + Tailwind setup
2. **Phase 2** - UI Scaffold: Layout components
3. **Phase 3** - Core State: TypeScript types + Zustand store
4. **Phase 4** - Shape Rendering: SVG shape components
5. **Phase 5** - Tool System: Drawing and tool switching
6. **Phase 6** - Selection System: Click, box, lasso selection + move
7. **Phase 7** - Resize Handles: Drag-to-resize functionality
8. **Phase 8** - Tool Options Panel: Styling controls
9. **Phase 9** - Hotkeys: Keyboard shortcuts

## Running the Project

```bash
# Development server
bun dev

# Build for production
bun build

# Preview production build
bun preview

# Type check
bun typecheck

# Lint
bun lint
```

## Project Structure

```
diagram-tool/
├── src/
│   ├── components/
│   │   ├── canvas/          # Canvas component and related
│   │   ├── handles/         # Resize handle components
│   │   ├── shapes/          # Shape rendering components
│   │   └── toolbar/         # Toolbar and tool options
│   ├── constants/           # Color palettes, tool info, hotkeys
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind imports
├── .opencode/               # Planning documentation
│   └── plan/                # Phase-by-phase plans
├── vite.config.ts
├── tailwind.config.js (optional for v4)
├── postcss.config.js
└── package.json
```

## Code Conventions

### React Components

- Use functional components with TypeScript
- Prefer hooks (`useCallback`, `useMemo`) for performance
- Use Zustand for all state management (no useState for global state)
- Props interfaces named `ComponentNameProps`
- Event handlers prefixed with `handle` (e.g., `handleMouseDown`)

### State Management (Zustand)

All global state lives in `src/store/diagramStore.ts`. Actions follow this pattern:

```typescript
// Store structure
interface DiagramState {
  // State
  shapes: DiagramShape[]
  currentTool: ToolType
  selection: Selection
  
  // Actions
  setTool: (tool: ToolType) => void
  addShape: (shape: DiagramShape) => void
  // ...
}

// Usage in components
const { currentTool, setTool } = useDiagramStore()
```

### Type Definitions

All types in `src/types/diagram.ts`:

- `ShapeType`: 'rectangle' | 'circle' | 'line' | 'arrow'
- `ToolType`: All tool variants including selection modes
- `DiagramShape`: Union of all shape types
- `ShapeStyle`: Stroke, fill, strokeWidth, background
- `Selection`: Selected shape IDs and selection type
- `Viewport`: Pan (x, y) and zoom level
- `DrawingState`: Temporary state while drawing

### Styling

- Tailwind CSS v4 for all styling
- Use `src/index.css` with `@import "tailwindcss"`
- Custom styles in component files using Tailwind classes
- Fixed positioning for toolbars: `fixed left-4 top-16`
- Full-screen canvas: `w-full h-full overflow-hidden`

### Coordinate System

- **Screen coordinates**: Browser pixel coordinates (e.g., `e.clientX`)
- **Canvas coordinates**: Diagram units (pan/zoom applied)

Conversion utilities in `src/utils/coordinates.ts`:
- `screenToCanvas()`: Convert screen to canvas coordinates
- `canvasToScreen()`: Convert canvas to screen coordinates

### SVG Rendering

- All shapes rendered as SVG elements inside `<svg>`
- Grid pattern using `<pattern>` for visual reference
- Transforms applied via `transform="translate(x, y)"`
- Selection highlight: dashed blue outline
- Resize handles: 8-point for shapes, 2-point for lines/arrows

## Hotkeys

| Key | Action |
|-----|--------|
| V | Select (Click) tool |
| B | Select (Box) tool |
| L | Select (Lasso) tool |
| R | Rectangle tool |
| C | Circle tool |
| O | Line tool |
| A | Arrow tool |
| Delete/Backspace | Delete selected shapes |
| Escape | Deselect all |
| Space + Drag | Pan canvas |
| Ctrl/Cmd + Wheel | Zoom in/out |

## Key Files and Their Responsibilities

| File | Purpose |
|------|---------|
| `store/diagramStore.ts` | All global state and actions |
| `types/diagram.ts` | TypeScript interfaces |
| `constants/colors.ts` | Color palette definitions |
| `components/canvas/Canvas.tsx` | Main canvas with event handling |
| `components/shapes/*.tsx` | Individual shape renderers |
| `components/handles/ResizeHandles.tsx` | Resize handle UI |
| `components/toolbar/TopToolbar.tsx` | Top toolbar with tool buttons |
| `components/toolbar/ToolOptionsPanel.tsx` | Floating styling panel |
| `utils/coordinates.ts` | Screen/canvas coordinate conversion |
| `utils/hitTest.ts` | Selection hit testing |

## Common Operations

### Adding a New Shape Type

1. Add type to `ShapeType` in `types/diagram.ts`
2. Create shape interface extending `BaseShape`
3. Create component in `components/shapes/`
4. Add factory function in `utils/shape.ts`
5. Update `ShapeRenderer` switch statement
6. Update `ResizeHandles` for new shape

### Adding a New Tool

1. Add to `ToolType` in `types/diagram.ts`
2. Add to `TOOL_INFO` in `constants/tools.ts`
3. Add hotkey in `constants/hotkeys.ts`
4. Implement drawing logic in `Canvas.tsx`
5. Add tool button to `TopToolbar.tsx`

### Modifying Tool Options

1. Add field to `ShapeStyle` in `types/diagram.ts`
2. Add to `currentToolOptions` in store
3. Update `ToolOptionsPanel.tsx` with new control
4. Apply in store's `updateToolOptions` action

## Color Palette

### Stroke Colors (Default)
- Black (`#000000`)
- Gray 700 (`#374151`)
- Gray 400 (`#9CA3AF`)
- Red 500 (`#EF4444`)
- Blue 500 (`#3B82F6`)
- Green 500 (`#22C55E`)

### Fill Colors (Default)
- Transparent
- White (`#FFFFFF`)
- Red 100 (`#FECACA`)
- Blue 100 (`#BFDBFE`)
- Green 100 (`#BBF7D0`)
- Yellow 100 (`#FEF08A`)

### Stroke Widths
- 1, 2, 4, 6, 8 pixels

## Testing

Currently, this project does not have a test suite. When adding tests:

- Use Vitest for unit tests
- Place tests alongside components (e.g., `Canvas.test.tsx`)
- Test state management in isolation
- Test user interactions with React Testing Library

## Building for Production

```bash
bun build
# Output in dist/ folder
```

The build generates static assets suitable for deployment to any static host.

## Future Enhancements

- Undo/Redo system
- Export to PNG/SVG
- Shape alignment guides
- Layers/ordering (z-index)
- JSON save/load
- Multiple arrow styles
- Text annotations
- Image support
- Collaborative editing
