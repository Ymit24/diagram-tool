import type { DiagramShape, Selection } from '../types/diagram'
import type { HistoryEntry, HistoryActionType } from '../types/history'

export const MAX_HISTORY = 50

export function createHistoryEntry(
  state: {
    shapes: DiagramShape[]
    selection: Selection
  },
  type: HistoryActionType,
  description: string
): HistoryEntry {
  return {
    type,
    shapes: [...state.shapes],
    selection: { ...state.selection },
    timestamp: Date.now(),
    description,
  }
}

export function pushHistory(
  past: HistoryEntry[],
  entry: HistoryEntry
): HistoryEntry[] {
  return [...past, entry].slice(-MAX_HISTORY)
}

export function canUndo(past: HistoryEntry[]): boolean {
  return past.length > 0
}

export function canRedo(future: HistoryEntry[]): boolean {
  return future.length > 0
}

export function undo(
  past: HistoryEntry[],
  future: HistoryEntry[],
  _shapes: DiagramShape[],
  _selection: Selection
): { past: HistoryEntry[]; future: HistoryEntry[]; shapes: DiagramShape[]; selection: Selection } | null {
  if (past.length === 0) return null

  const entry = past[past.length - 1]
  return {
    past: past.slice(0, -1),
    future: [entry, ...future],
    shapes: entry.shapes,
    selection: entry.selection,
  }
}

export function redo(
  past: HistoryEntry[],
  future: HistoryEntry[],
  _shapes: DiagramShape[],
  _selection: Selection
): { past: HistoryEntry[]; future: HistoryEntry[]; shapes: DiagramShape[]; selection: Selection } | null {
  if (future.length === 0) return null

  const entry = future[0]
  return {
    past: [...past, entry],
    future: future.slice(1),
    shapes: entry.shapes,
    selection: entry.selection,
  }
}

export function clearFuture(_future: HistoryEntry[]): HistoryEntry[] {
  return []
}
