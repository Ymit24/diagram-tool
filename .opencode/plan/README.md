# Diagram Tool Development Plan

This document outlines the complete development plan for a web-based diagramming tool.

## Tech Stack
- **Build Tool**: Vite
- **Framework**: React + TypeScript
- **Package Manager**: Bun
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Icons**: Lucide React
- **Rendering**: SVG

## Application Features

### Core Features
- **Infinite Canvas**: SVG-based infinite canvas with pan and zoom
- **Shape Tools**: Rectangle, Circle, Line, Arrow
- **Selection Modes**: Click, Box (marquee), Lasso (freehand)
- **Transformations**: Move, Resize (8-point for shapes, 2-point for lines)
- **Styling**: Stroke color, fill color, stroke width
- **Color Palette**: Preset colors for consistency
- **Keyboard Hotkeys**: Power user shortcuts

### UI Layout
```
┌─────────────────────────────────────┐
│         Top Toolbar (Fixed)         │  ← Tool selection, current tool indicator
├─────┬───────────────────────────────┤
│     │                               │
│ To  │                               │  ← Infinite canvas area
│ ol  │                               │
│ Op  │                               │
│ ti  │                               │
│ on  │                               │
│ s   │                               │
│     │                               │
└─────┴───────────────────────────────┘
```

## Development Phases

| Phase | Name | Description | Time Est. |
|-------|------|-------------|-----------|
| 1 | Project Scaffold | Vite + React + Bun + Tailwind setup | 15-20 min |
| 2 | UI Scaffold | Layout, toolbar, canvas container | 20-25 min |
| 3 | Core State | TypeScript types, Zustand store | 30-40 min |
| 4 | Shape Rendering | SVG components for shapes | 30-35 min |
| 5 | Tool System | Drawing logic, tool switching | 40-45 min |
| 6 | Selection System | Click, box, lasso selection + move | 35-40 min |
| 7 | Resize Handles | Drag-to-resize functionality | 40-45 min |
| 8 | Tool Options Panel | Context-sensitive styling panel | 30-35 min |
| 9 | Hotkeys | Keyboard shortcuts | 25-30 min |

**Total Estimated Time**: ~4-5 hours

## Phase Files

Each phase has its own detailed plan:
- `.opencode/plan/PLAN_1_PROJECT_SCAFFOLD.md`
- `.opencode/plan/PLAN_2_UI_SCAFFOLD.md`
- `.opencode/plan/PLAN_3_CORE_STATE.md`
- `.opencode/plan/PLAN_4_SHAPE_RENDERING.md`
- `.opencode/plan/PLAN_5_TOOL_SYSTEM.md`
- `.opencode/plan/PLAN_6_SELECTION_SYSTEM.md`
- `.opencode/plan/PLAN_7_RESIZE_HANDLES.md`
- `.opencode/plan/PLAN_8_TOOL_OPTIONS.md`
- `.opencode/plan/PLAN_9_HOTKEYS.md`

## Hotkey Reference

| Key | Action |
|-----|--------|
| V | Select (Click) |
| B | Select (Box) |
| L | Select (Lasso) |
| R | Rectangle |
| C | Circle |
| O | Line |
| A | Arrow |
| Delete/Backspace | Delete selected |
| Escape | Deselect |
| Space + Drag | Pan canvas |
| Ctrl + Wheel | Zoom |

## Color Palette

### Stroke Colors
- Black, Gray 700, Gray 400, Red 500, Blue 500, Green 500

### Fill Colors
- Transparent, White, Red 100, Blue 100, Green 100, Yellow 100

### Stroke Widths
- 1px, 2px, 4px, 6px, 8px

## Implementation Order

1. Start with Phase 1 to establish the project foundation
2. Complete phases sequentially (each depends on the previous)
3. Run `bun dev` after each phase to verify progress
4. Refer to individual PLAN_X.md files for detailed instructions

## Post-Phase 9 (Future Enhancements)

- Zoom/pan UI controls
- Undo/Redo system
- Export to PNG/SVG
- Shape alignment guides
- Layers/ordering
- JSON save/load
- Multiple arrow styles
- Text annotations
- Image support
- Collaborative editing
