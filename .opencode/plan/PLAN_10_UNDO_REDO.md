# Undo/Redo System

## Goal
Implement comprehensive undo/redo functionality for diagram modifications.

## Key Design Decisions

### What to Track
- **Shapes**: add, update, delete, resize
- **Selection**: shape selection changes
- **Viewport**: Optional - pan/zoom (excluded for MVP, can add later)

### What NOT to Track
- Drawing in progress (temporary state)
- Resize handle state
- Tool switching (unless shapes are modified)

### History Strategy
- Stack-based history with `past` and `future` arrays
- Deep clone shapes array for history snapshots
- Max history depth: 50 entries (prevents memory bloat)

## Steps

### 10.1 Define History Types
Create `src/types/history.ts`:
```typescript
export interface HistoryEntry {
  type: 'add' | 'update' | 'delete' | 'batch'
  shapes: DiagramShape[]  // Complete shapes state snapshot
  timestamp: number
  description: string
}

export interface HistoryState {
  past: HistoryEntry[]
  future: HistoryEntry[]
}
```

### 10.2 Update Store with History State
Add to `DiagramState` interface in `src/store/diagramStore.ts`:
```typescript
past: HistoryEntry[]
future: HistoryEntry[]
undo: () => void
redo: () => void
canUndo: boolean
canRedo: boolean
_recordHistory: (action: string) => void
```

### 10.3 Modify Shape Actions to Record History
Update these actions to push to `past` before modifying:
- `addShape`: Record before adding
- `updateShape`: Record before updating
- `deleteShapes`: Record before deleting
- `updateSelectedShapes`: Record before batch updating
- `updateResize`: Record after resize ends (in `endResize`)

### 10.4 Implement Undo/Redo Actions
```typescript
undo: () => set((state) => {
  if (state.past.length === 0) return {}
  const previous = state.past[state.past.length - 1]
  return {
    past: state.past.slice(0, -1),
    shapes: previous.shapes,
    future: [previous, ...state.future],
  }
}),

redo: () => set((state) => {
  if (state.future.length === 0) return {}
  const next = state.future[0]
  return {
    future: state.future.slice(1),
    shapes: next.shapes,
    past: [...state.past, next],
  }
}),
```

### 10.5 Clear Future on New Actions
When any shape-modifying action is called, clear the `future` stack:
```typescript
future: []
```

### 10.6 Update TopToolbar
- Connect `handleUndo` to store's `undo` action
- Connect `handleRedo` to store's `redo` action
- Enable/disable buttons based on `canUndo`/`canRedo`
- Add tooltips showing shortcuts

### 10.7 Add Hotkeys
Update `src/hooks/useHotkeys.ts`:
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y`: Redo

### 10.8 Update Help Modal
Add undo/redo shortcuts to HotkeyHelp component.

### 10.9 Optimizations
- Debounce rapid shape updates (e.g., during drag)
- Store only diffs for large diagrams (future enhancement)
- Add visual feedback on undo/redo (optional)

## Deliverable
- Ctrl+Z / Cmd+Z to undo
- Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y to redo
- Undo/redo buttons in toolbar enabled/disabled appropriately
- All shape modifications (add, update, delete, resize) are undoable
- History depth capped at 50 entries

## Time Estimate
~45-60 minutes

## Dependencies
- Phase 9 complete

## Next Phase Preview
Phase 11 could add JSON save/load for diagram persistence.
