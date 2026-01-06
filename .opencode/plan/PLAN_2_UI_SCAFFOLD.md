# Phase 2: UI Scaffold

## Goal
Set up the application layout with infinite canvas container, floating top toolbar, and tool options panel.

## Steps

### 2.1 Project Structure Setup
Create directory structure:
```
src/
├── components/
│   ├── canvas/
│   ├── toolbar/
│   ├── handles/
│   └── shapes/
├── hooks/
├── store/
├── types/
├── utils/
└── styles/
```

### 2.2 App Layout (App.tsx)
```tsx
// src/App.tsx
export function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-50">
      {/* Top Toolbar - Fixed */}
      <TopToolbar />

      {/* Main Canvas Area */}
      <div className="absolute inset-0 top-16">
        <Canvas />
      </div>

      {/* Left Tool Options Panel - Floating, conditionally visible */}
      <ToolOptionsPanel />
    </div>
  )
}
```

### 2.3 Infinite Canvas Container
Create `src/components/canvas/Canvas.tsx`:
- Full-width/height SVG element
- `overflow: hidden` on container
- Event handlers for mouse interactions
- Pan/zoom viewport concept

### 2.4 Top Toolbar Component
Create `src/components/toolbar/TopToolbar.tsx`:
- Fixed position at top of screen
- Tool buttons: Select, Rectangle, Circle, Line, Arrow
- Current tool indicator
- Spacer for aesthetic balance

### 2.5 Tool Options Panel Component
Create `src/components/toolbar/ToolOptionsPanel.tsx`:
- Floating panel on left side
- Initially hidden or shows "Select a tool" message
- Will populate with context-sensitive options in later phases
- Smooth show/hide transition

### 2.6 CSS/Styling Setup
- Create `src/styles/canvas.css` for canvas-specific styles
- Ensure full-screen layouts work properly
- Add cursor styling for different tools

## Deliverable
- Visual layout with toolbar at top, canvas filling rest of screen
- Floating panel on left (visible placeholder)
- No functional drawing yet, just UI scaffolding

## Time Estimate
~20-25 minutes

## Dependencies
- Phase 1 complete

## Next Phase Preview
Phase 3 will add type definitions and state management foundation.
