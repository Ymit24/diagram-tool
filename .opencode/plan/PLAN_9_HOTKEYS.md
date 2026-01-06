# Phase 9: Keyboard Hotkeys

## Goal
Add comprehensive keyboard shortcuts for all tools and actions.

## Steps

### 9.1 Hotkey Map
Create `src/constants/hotkeys.ts`:

```typescript
import { ToolType } from '../types/diagram'

export const HOTKEYS: Record<string, ToolType | string> = {
  // Tool selection
  'v': 'select-click',
  'b': 'select-box',
  'l': 'select-lasso',
  'r': 'rectangle',
  'c': 'circle',
  'o': 'line',
  'a': 'arrow',
  
  // Actions
  'delete': 'delete',
  'backspace': 'delete',
  'escape': 'deselect',
  'space': 'pan',
}

export const HOTKEY_LABELS: Record<string, string> = {
  'v': 'Select (Click)',
  'b': 'Select (Box)',
  'l': 'Select (Lasso)',
  'r': 'Rectangle',
  'c': 'Circle',
  'o': 'Line',
  'a': 'Arrow',
  'delete': 'Delete',
  'backspace': 'Delete',
  'escape': 'Deselect',
}
```

### 9.2 Hotkey Hook
Create `src/hooks/useHotkeys.ts`:

```typescript
import { useEffect, useCallback } from 'react'
import { useDiagramStore } from '../store/diagramStore'
import { HOTKEYS } from '../constants/hotkeys'

export function useHotkeys() {
  const { setTool, deleteShapes, setSelection } = useDiagramStore()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if typing in input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    const key = e.key.toLowerCase()
    const action = HOTKEYS[key]

    if (!action) return

    // Prevent default for our hotkeys
    if (['v', 'b', 'l', 'r', 'c', 'o', 'a', 'delete', 'backspace', 'escape'].includes(key)) {
      e.preventDefault()
    }

    switch (action) {
      case 'select-click':
      case 'select-box':
      case 'select-lasso':
      case 'rectangle':
      case 'circle':
      case 'line':
      case 'arrow':
        setTool(action)
        break
        
      case 'delete':
        deleteShapes([])
        break
        
      case 'deselect':
        setSelection({ shapeIds: [], selectionType: 'none' })
        break
    }
  }, [setTool, deleteShapes, setSelection])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
```

### 9.3 Tooltips for Hotkeys
Update toolbar buttons to show hotkey tooltips:

```typescript
// In TopToolbar.tsx, add hotkey display
<button
  className="..."
  title={`${tool.name} (${tool.hotkey})`}
>
  <Icon />
  <span className="text-xs">{tool.hotkey}</span>
</button>
```

### 9.4 Canvas Keyboard Pan (Space + Drag)
Add spacebar handling to Canvas for panning:

```typescript
const [isPanning, setIsPanning] = useState(false)

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !isPanning) {
      setIsPanning(true)
    }
  }
  
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      setIsPanning(false)
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }
}, [isPanning])
```

### 9.5 Zoom Shortcuts (Ctrl/Cmd + Wheel)
Update wheel handler:

```typescript
const handleWheel = useCallback((e: React.WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(Math.max(viewport.zoom * delta, 0.1), 5)
    setViewport({ zoom: newZoom })
  } else {
    // Pan
    setViewport({ 
      x: viewport.x - e.deltaX, 
      y: viewport.y - e.deltaY 
    })
  }
}, [viewport, setViewport])
```

### 9.6 Help Modal
Create `src/components/toolbar/HotkeyHelp.tsx`:
- Show all available hotkeys
- Toggle with '?' key or help button
- Clean modal design

## Deliverable
- Tool selection via keyboard (V, B, L, R, C, O, A)
- Delete with Delete/Backspace
- Escape to deselect
- Space + drag to pan
- Ctrl + wheel to zoom
- Help modal showing all shortcuts

## Time Estimate
~25-30 minutes

## Dependencies
- Phases 1-8 complete

## Next Phase Preview
Phase 10 (optional) will add infinite canvas features like pan/zoom UI.
