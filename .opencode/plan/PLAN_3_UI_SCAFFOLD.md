# Stage 3: UI Scaffold

## Overview
Build the basic UI layout including floating toolbar and tool options panel. Create a skeleton that can be filled in with functionality later.

## Objectives
- Create floating toolbar component (top of screen)
- Create tool options panel component (left side, context-aware)
- Set up main App layout to house canvas and UI
- Implement basic tool switching state

## Steps

### 1. Create Contexts
Create `src/contexts/ToolContext.tsx`:
```tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { ToolType } from '@/types/tools';

interface ToolContextType {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

const ToolContext = createContext<ToolContextType | undefined>(undefined);

export function ToolProvider({ children }: { children: ReactNode }) {
  const [activeTool, setActiveTool] = useState<ToolType>('select');

  return (
    <ToolContext.Provider value={{ activeTool, setActiveTool }}>
      {children}
    </ToolContext.Provider>
  );
}

export function useTool() {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useTool must be used within ToolProvider');
  }
  return context;
}
```

### 2. Create Floating Toolbar
Create `src/components/tools/ToolBar.tsx`:
```tsx
import { useTool } from '@/contexts/ToolContext';
import { ToolType } from '@/types/tools';

interface ToolButtonProps {
  tool: ToolType;
  label: string;
  activeTool: ToolType;
  onClick: () => void;
}

function ToolButton({ tool, label, activeTool, onClick }: ToolButtonProps) {
  const isActive = activeTool === tool;

  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all
        ${isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {label}
    </button>
  );
}

export default function ToolBar() {
  const { activeTool, setActiveTool } = useTool();

  const tools: { tool: ToolType; label: string; hotkey: string }[] = [
    { tool: 'select', label: 'Select', hotkey: 'V' },
    { tool: 'rectangle', label: 'Rectangle', hotkey: 'R' },
    { tool: 'circle', label: 'Circle', hotkey: 'O' },
    { tool: 'line', label: 'Line', hotkey: 'L' },
    { tool: 'arrow', label: 'Arrow', hotkey: 'A' },
    { tool: 'pan', label: 'Pan', hotkey: 'Space' },
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-2 flex gap-2 border border-gray-200">
        {tools.map(({ tool, label, hotkey }) => (
          <div key={tool} className="relative group">
            <ToolButton
              tool={tool}
              label={label}
              activeTool={activeTool}
              onClick={() => setActiveTool(tool)}
            />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2
                           text-xs bg-gray-800 text-white px-2 py-1 rounded
                           opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {hotkey}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3. Create Tool Options Panel
Create `src/components/tools/ToolOptionsPanel.tsx`:
```tsx
import { useTool } from '@/contexts/ToolContext';
import { COLOR_PALETTE, STROKE_WIDTHS } from '@/utils/colorPalette';

export default function ToolOptionsPanel() {
  const { activeTool } = useTool();

  // Show panel only when a tool is selected (not 'select')
  const showPanel = activeTool !== 'select';

  if (!showPanel) return null;

  return (
    <div className="fixed top-24 left-4 w-64 bg-white rounded-xl shadow-2xl p-4 border border-gray-200 z-40">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Options
      </h3>

      {/* Fill Color */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Fill Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Stroke Width
        </label>
        <div className="flex gap-1 flex-wrap">
          {STROKE_WIDTHS.map((width) => (
            <button
              key={width}
              className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100"
            >
              {width}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 4. Create Canvas Container
Create `src/components/canvas/CanvasContainer.tsx`:
```tsx
import { Stage, Layer } from 'react-konva';

export default function CanvasContainer() {
  return (
    <div className="h-screen w-screen bg-gray-100">
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {/* Placeholder for shapes */}
        </Layer>
      </Stage>
    </div>
  );
}
```

### 5. Update App Component
Update `src/App.tsx`:
```tsx
import { ToolProvider } from '@/contexts/ToolContext';
import ToolBar from '@/components/tools/ToolBar';
import ToolOptionsPanel from '@/components/tools/ToolOptionsPanel';
import CanvasContainer from '@/components/canvas/CanvasContainer';

export default function App() {
  return (
    <ToolProvider>
      <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
        <ToolBar />
        <ToolOptionsPanel />
        <CanvasContainer />
      </div>
    </ToolProvider>
  );
}
```

### 6. Add to main.tsx
Update `src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

## Success Criteria
- [ ] ToolContext created and working
- [ ] Floating toolbar renders at top of screen
- [ ] Tool buttons show active state
- [ ] Tool options panel appears when shape tool selected
- [ ] Tool switching works via buttons
- [ ] Layout is responsive and UI elements are positioned correctly
- [ ] No TypeScript errors

## Notes
- Panel is context-aware but not yet connected to shape properties
- Hotkey hints are shown in tooltips (actual hotkeys implemented in Stage 11)
- Panel visibility logic: show for shape tools, hide for select tool
- UI uses Tailwind's floating utilities for positioning
