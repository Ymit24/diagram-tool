# Stage 12: Polish and Advanced Features

## Overview
Add finishing touches and advanced features to complete diagramming tool. This includes export functionality, bring to front/send to back, grid toggle, and UX improvements.

## Objectives
- Implement export to PNG
- Implement export to SVG
- Add z-index controls (bring to front/back)
- Add grid visibility toggle
- Add clear all shapes
- Improve UX with loading states and toasts
- Add help modal with hotkey reference

## Steps

### 1. Create Export Utilities
Create `src/utils/export.ts`:
```tsx
import { Stage } from 'react-konva';
import { Shape } from '@/types/shapes';

export function exportToPNG(stage: Stage): void {
  const dataURL = stage.toDataURL({
    pixelRatio: 2, // Higher quality
  });

  const link = document.createElement('a');
  link.download = `diagram-${Date.now()}.png`;
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(shapes: Shape[]): void {
  const data = JSON.stringify(shapes, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.download = `diagram-${Date.now()}.json`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<Shape[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const shapes = JSON.parse(e.target?.result as string);
        resolve(shapes);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
```

### 2. Create Export Menu Component
Create `src/components/tools/ExportMenu.tsx`:
```tsx
import { useState } from 'react';
import { Stage } from 'react-konva';

interface ExportMenuProps {
  stage: Stage | null;
  onExportPNG?: () => void;
  onExportJSON?: () => void;
  onImportJSON?: (file: File) => void;
}

export default function ExportMenu({
  stage,
  onExportPNG,
  onExportJSON,
  onImportJSON,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportPNG = () => {
    if (stage && onExportPNG) {
      onExportPNG();
    }
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    if (onExportJSON) {
      onExportJSON();
    }
    setIsOpen(false);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportJSON) {
      onImportJSON(file);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg font-medium bg-white text-gray-700 hover:bg-gray-100 transition-colors"
      >
        Export
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] z-50">
            <button
              onClick={handleExportPNG}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
            >
              Export as PNG
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors"
            >
              Export as JSON
            </button>
            <label className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors cursor-pointer block">
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}
```

### 3. Create Help Modal
Create `src/components/tools/HelpModal.tsx`:
```tsx
import { useState } from 'react';

export default function HelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  const hotkeys = [
    { key: 'V', action: 'Select tool' },
    { key: 'R', action: 'Rectangle tool' },
    { key: 'O', action: 'Circle tool' },
    { key: 'L', action: 'Line tool' },
    { key: 'A', action: 'Arrow tool' },
    { key: 'B', action: 'Box selection' },
    { key: 'Space', action: 'Pan mode (hold)' },
    { key: 'Delete/Backspace', action: 'Delete selected' },
    { key: 'Ctrl/Cmd + C', action: 'Copy' },
    { key: 'Ctrl/Cmd + V', action: 'Paste' },
    { key: 'Ctrl/Cmd + Z', action: 'Undo' },
    { key: 'Ctrl/Cmd + Y / Shift+Z', action: 'Redo' },
    { key: 'Ctrl/Cmd + A', action: 'Select all' },
    { key: 'Escape', action: 'Deselect all' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
      >
        ?
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {hotkeys.map(({ key, action }) => (
                <div
                  key={key}
                  className="flex justify-between items-center py-2 border-b border-gray-100"
                >
                  <span className="text-gray-600">{action}</span>
                  <kbd className="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

### 4. Update ToolBar with Additional Controls
Update `src/components/tools/ToolBar.tsx`:
```tsx
import { useState } from 'react';
import ExportMenu from './ExportMenu';

export default function ToolBar() {
  const { activeTool, setActiveTool } = useTool();
  const { showGrid, setShowGrid } = useCanvas(); // Add showGrid to CanvasContext
  const { clearShapes } = useShapes(); // Add to ShapesContext
  const [stage, setStage] = useState<any>(null);

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all shapes?')) {
      clearShapes();
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-2 flex items-center gap-2 border border-gray-200">
        {/* Undo/Redo */}
        <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
          {/* ... undo/redo buttons from Stage 11 */}
        </div>

        {/* Tool buttons */}
        <div className="flex gap-2">
          {tools.map(({ tool, label, hotkey }) => (
            // ... tool buttons
          ))}
        </div>

        {/* Additional controls */}
        <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
          <button
            onClick={toggleGrid}
            className={`px-3 py-2 rounded-lg font-medium transition-colors ${
              showGrid ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Grid
          </button>

          <button
            onClick={handleClearAll}
            className="px-3 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Export menu */}
        <div className="pl-4 border-l border-gray-200">
          <ExportMenu
            stage={stage}
            onExportPNG={() => {
              if (stage) exportToPNG(stage);
            }}
            onExportJSON={() => {
              const { shapes } = useShapes();
              exportToJSON(shapes);
            }}
            onImportJSON={async (file) => {
              const shapes = await importFromJSON(file);
              // Add shapes to canvas
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

### 5. Add Z-Index Controls to Selection Panel
Update `src/components/tools/SelectionPropertiesPanel.tsx`:
```tsx
import { useShapes } from '@/contexts/ShapesContext';

// ... inside component
const { shapes, updateShape } = useShapes();

const handleBringToFront = () => {
  selectedShapes.forEach((shape) => {
    const currentIndex = shapes.findIndex((s) => s.id === shape.id);
    const newShapes = [...shapes];
    const [movedShape] = newShapes.splice(currentIndex, 1);
    newShapes.push(movedShape);
    // Need to update all shapes (z-index is array order)
    setShapes(newShapes);
  });
};

const handleSendToBack = () => {
  selectedShapes.forEach((shape) => {
    const currentIndex = shapes.findIndex((s) => s.id === shape.id);
    const newShapes = [...shapes];
    const [movedShape] = newShapes.splice(currentIndex, 1);
    newShapes.unshift(movedShape);
    setShapes(newShapes);
  });
};

// Add buttons in panel
<div className="mt-4 pt-4 border-t border-gray-200">
  <label className="block text-xs font-medium text-gray-600 mb-2">
    Layer Order
  </label>
  <div className="flex gap-2">
    <button
      onClick={handleBringToFront}
      className="flex-1 px-3 py-2 text-xs rounded border border-gray-200 hover:bg-gray-100"
    >
      Bring to Front
    </button>
    <button
      onClick={handleSendToBack}
      className="flex-1 px-3 py-2 text-xs rounded border border-gray-200 hover:bg-gray-100"
    >
      Send to Back
    </button>
  </div>
</div>
```

### 6. Update GridBackground to Support Toggle
Update `src/components/canvas/GridBackground.tsx`:
```tsx
interface GridBackgroundProps {
  width: number;
  height: number;
  gridSize?: number;
  visible?: boolean;
}

export default function GridBackground({
  width,
  height,
  gridSize = 20,
  visible = true,
}: GridBackgroundProps) {
  if (!visible) return null;

  // ... rest of component
}
```

### 7. Add HelpModal to App
Update `src/App.tsx`:
```tsx
import HelpModal from '@/components/tools/HelpModal';

// ... inside AppContent
<HelpModal />
```

## Success Criteria
- [ ] Export to PNG works
- [ ] Export to JSON works
- [ ] Import from JSON works
- [ ] Grid toggle shows/hides grid
- [ ] Clear all removes all shapes
- [ ] Bring to front works
- [ ] Send to back works
- [ ] Help modal shows hotkey reference
- [ ] Export menu accessible from toolbar

## Notes
- PNG export includes all layers
- JSON export allows saving/loading diagrams
- Z-index controlled by array order in shapes array
- Grid toggle stored in canvas state (optional: persist to localStorage)
- Help modal is accessible from floating button
- Clear all requires confirmation

## Optional Enhancements (Future Work)
- Save diagrams to localStorage
- SVG export (requires more complex implementation)
- Smart guides (alignment indicators)
- Custom shape properties (text, etc.)
- Group/ungroup shapes
- Shape rotation via transformer handles
- Line endpoint handles for resizing
- Custom grid size
- Dark mode
- Shape templates
