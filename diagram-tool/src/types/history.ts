import type { DiagramShape } from './diagram'

export type HistoryActionType = 'add' | 'update' | 'delete' | 'select'

export interface HistoryEntry {
  type: HistoryActionType
  shapes: DiagramShape[]
  selection: { shapeIds: string[]; selectionType: 'single' | 'multiple' | 'lasso' | 'none' }
  timestamp: number
  description: string
}

export interface HistoryState {
  past: HistoryEntry[]
  future: HistoryEntry[]
}
