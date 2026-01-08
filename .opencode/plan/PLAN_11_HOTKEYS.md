# Stage 11: Hotkeys

## Overview
Implement keyboard shortcuts for power users. Map common operations to keys and show hotkey hints in UI.

## Objectives
- Create hotkey system
- Implement tool switching hotkeys
- Add delete hotkey
- Add copy/paste functionality
- Add undo/redo system
- Show hotkey hints in tooltips

## Steps

### 1. Create History Context for Undo/Redo
Create `src/contexts/HistoryContext.tsx`:
```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Shape } from '@/types/shapes';

interface HistoryState {
  past: Shape[][];
  present: Shape[];
  future: Shape[][];
}

interface HistoryContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushHistory: (shapes: Shape[]) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      const newFuture = [prev.present, ...prev.future];

      return {
        past: newPast,
        present: previous,
        future: newFuture,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newPast = [...prev.past, prev.present];
      const newFuture = prev.future.slice(1);

      return {
        past: newPast,
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const pushHistory = useCallback((shapes: Shape[]) => {
    setHistory((prev) => {
      const newPast = [...prev.past, prev.present];
      const newFuture = []; // Clear future on new action

      return {
        past: newPast,
        present: shapes,
        future: newFuture,
      };
    });
  }, []);

  return (
    <HistoryContext.Provider
      value={{
        canUndo,
        canRedo,
        undo,
        redo,
        pushHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within HistoryProvider');
  }
  return context;
}
```

### 2. Create Clipboard Context for Copy/Paste
Create `src/contexts/ClipboardContext.tsx`:
```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Shape } from '@/types/shapes';
import { generateId } from '@/utils/geometry';

interface ClipboardContextType {
  clipboard: Shape[];
  copy: (shapes: Shape[]) => void;
  paste: (offsetX?: number, offsetY?: number) => Shape[];
  clear: () => void;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export function ClipboardProvider({ children }: { children: ReactNode }) {
  const [clipboard, setClipboard] = useState<Shape[]>([]);

  const copy = useCallback((shapes: Shape[]) => {
    setClipboard([...shapes]);
  }, []);

  const paste = useCallback((offsetX = 20, offsetY = 20) => {
    // Create new shapes with offset positions and new IDs
    const pastedShapes = clipboard.map((shape) => {
      const newShape = {
        ...shape,
        id: generateId(),
      };

      if (shape.type === 'rectangle' || shape.type === 'circle') {
        newShape.x += offsetX;
        newShape.y += offsetY;
      } else if (shape.type === 'line' || shape.type === 'arrow') {
        newShape.points = shape.points.map((point, index) => {
          return point + (index % 2 === 0 ? offsetX : offsetY);
        });
      }

      return newShape;
    });

    return pastedShapes;
  }, [clipboard]);

  const clear = useCallback(() => {
    setClipboard([]);
  }, []);

  return (
    <ClipboardContext.Provider
      value={{
        clipboard,
        copy,
        paste,
        clear,
      }}
    >
      {children}
    </ClipboardContext.Provider>
  );
}

export function useClipboard() {
  const context = useContext(ClipboardContext);
  if (!context) {
    throw new Error('useClipboard must be used within ClipboardProvider');
  }
  return context;
}
```

### 3. Create Hotkeys Hook
Create `src/hooks/useHotkeys.ts`:
```tsx
import { useEffect } from 'react';
import { useTool } from '@/contexts/ToolContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useClipboard } from '@/contexts/ClipboardContext';
import { useSelection } from '@/contexts/SelectionContext';
import { useShapes } from '@/contexts/ShapesContext';

export function useHotkeys() {
  const { activeTool, setActiveTool } = useTool();
  const { undo, redo, canUndo, canRedo } = useHistory();
  const { copy, paste } = useClipboard();
  const { selectedIds, deselectAll } = useSelection();
  const { shapes, deleteShape, addShape, updateShapes } = useShapes();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if ((e.target as HTMLElement).tagName === 'INPUT') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Tool switching
      if (!modKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setActiveTool('select');
            break;
          case 'r':
            setActiveTool('rectangle');
            break;
          case 'o':
            setActiveTool('circle');
            break;
          case 'l':
            setActiveTool('line');
            break;
          case 'a':
            setActiveTool('arrow');
            break;
          case 'b':
            setActiveTool('box-select');
            break;
          case ' ':
            e.preventDefault();
            setActiveTool('pan');
            break;
        }
      }

      // Delete selected shapes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedIds.forEach((id) => deleteShape(id));
        deselectAll();
      }

      // Undo/Redo
      if (modKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      }

      // Redo (Ctrl/Cmd + Y)
      if (modKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }

      // Copy
      if (modKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const selectedShapes = shapes.filter((shape) =>
          selectedIds.includes(shape.id)
        );
        copy(selectedShapes);
      }

      // Paste
      if (modKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        const pastedShapes = paste();
        pastedShapes.forEach((shape) => addShape(shape));
      }

      // Select all
      if (modKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        shapes.forEach((shape) => {
          selectShape(shape.id, true);
        });
      }

      // Deselect all
      if (e.key === 'Escape') {
        deselectAll();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Reset tool from pan after space is released
      if (e.key === ' ' && activeTool === 'pan') {
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    activeTool,
    setActiveTool,
    undo,
    redo,
    canUndo,
    canRedo,
    copy,
    paste,
    selectedIds,
    shapes,
    deleteShape,
    addShape,
    deselectAll,
    selectShape,
  ]);
}
```

### 4. Update App to Use History and Clipboard
Update `src/App.tsx`:
```tsx
import { ToolProvider } from '@/contexts/ToolContext';
import { CanvasProvider } from '@/contexts/CanvasContext';
import { ShapesProvider } from '@/contexts/ShapesContext';
import { DrawingProvider } from '@/contexts/DrawingContext';
import { SelectionProvider } from '@/contexts/SelectionContext';
import { ShapePropertiesProvider } from '@/contexts/ShapePropertiesContext';
import { HistoryProvider } from '@/contexts/HistoryContext';
import { ClipboardProvider } from '@/contexts/ClipboardContext';
import ToolBar from '@/components/tools/ToolBar';
import ToolOptionsPanel from '@/components/tools/ToolOptionsPanel';
import SelectionPropertiesPanel from '@/components/tools/SelectionPropertiesPanel';
import CanvasContainer from '@/components/canvas/CanvasContainer';
import { useHotkeys } from '@/hooks/useHotkeys';

function AppContent() {
  useHotkeys();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
      <ToolBar />
      <ToolOptionsPanel />
      <SelectionPropertiesPanel />
      <CanvasContainer />
    </div>
  );
}

export default function App() {
  return (
    <ToolProvider>
      <CanvasProvider>
        <DrawingProvider>
          <ShapesProvider>
            <SelectionProvider>
              <ShapePropertiesProvider>
                <HistoryProvider>
                  <ClipboardProvider>
                    <AppContent />
                  </ClipboardProvider>
                </HistoryProvider>
              </ShapePropertiesProvider>
            </SelectionProvider>
          </ShapesProvider>
        </DrawingProvider>
      </CanvasProvider>
    </ToolProvider>
  );
}
```

### 5. Connect History to Shapes Updates
Update `src/contexts/ShapesContext.tsx` to push history on changes:
```tsx
import { useHistory } from '@/contexts/HistoryContext';
// ... inside ShapesProvider
const { pushHistory } = useHistory();

const addShape = useCallback((shape: Shape) => {
  setShapes((prev) => {
    const newShapes = [...prev, shape];
    pushHistory(newShapes);
    return newShapes;
  });
}, [pushHistory]);

const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
  setShapes((prev) => {
    const newShapes = prev.map((shape) =>
      shape.id === id ? { ...shape, ...updates } : shape
    );
    pushHistory(newShapes);
    return newShapes;
  });
}, [pushHistory]);

const deleteShape = useCallback((id: string) => {
  setShapes((prev) => {
    const newShapes = prev.filter((shape) => shape.id !== id);
    pushHistory(newShapes);
    return newShapes;
  });
}, [pushHistory]);
```

### 6. Add Undo/Redo Buttons to ToolBar (Optional)
Update `src/components/tools/ToolBar.tsx`:
```tsx
import { useHistory } from '@/contexts/HistoryContext';
// ... inside ToolBar
const { canUndo, canRedo, undo, redo } = useHistory();

// Add undo/redo buttons before tool buttons
<div className="flex items-center gap-2 pr-4 border-r border-gray-200">
  <button
    onClick={undo}
    disabled={!canUndo}
    className="px-3 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Undo
  </button>
  <button
    onClick={redo}
    disabled={!canRedo}
    className="px-3 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Redo
  </button>
</div>
```

## Success Criteria
- [ ] Hotkeys hook created
- [ ] Tool switching hotkeys work (V, R, O, L, A, B, Space)
- [ ] Delete hotkey removes selected shapes
- [ ] Ctrl/Cmd+Z/Y for undo/redo works
- [ ] Ctrl/Cmd+C/V for copy/paste works
- [ ] Ctrl/Cmd+A selects all
- [ ] Escape deselects all
- [ ] Space key switches to pan mode temporarily
- [ ] History tracking works
- [ ] Undo/redo buttons (optional) work correctly

## Notes
- Hotkeys ignore input fields
- Supports both Mac (Cmd) and Windows/Linux (Ctrl)
- Space for pan is temporary (switches back on keyup)
- Undo/redo history limited to 50 states (optional: implement)
- Copy/paste offsets pasted shapes by 20px
