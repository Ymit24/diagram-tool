import type { DiagramShape, Selection, Viewport, ToolType, ShapeStyle } from '../types/diagram'

export const STORAGE_KEY = 'diagram-tool-data'
export const STORAGE_VERSION = 1
const DEBOUNCE_DELAY = 500

export interface PersistedState {
  version: number
  shapes: DiagramShape[]
  selection: Selection
  viewport: Viewport
  currentTool: ToolType
  currentToolOptions: ShapeStyle
  lastSaved: string
}

export function saveToStorage(data: Omit<PersistedState, 'version' | 'lastSaved'>): void {
  const persisted: PersistedState = {
    ...data,
    version: STORAGE_VERSION,
    lastSaved: new Date().toISOString(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
  } catch {
    console.error('Failed to save to localStorage')
  }
}

export function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const data = JSON.parse(raw)

    if (!isValidPersistedState(data)) {
      return null
    }

    if (data.version !== STORAGE_VERSION) {
      return null
    }

    return data
  } catch {
    return null
  }
}

function isValidPersistedState(data: unknown): data is PersistedState {
  if (typeof data !== 'object' || data === null) return false

  const state = data as Record<string, unknown>

  if (typeof state.version !== 'number') return false
  if (!Array.isArray(state.shapes)) return false
  if (typeof state.selection !== 'object') return false
  if (typeof state.viewport !== 'object') return false
  if (typeof state.currentTool !== 'string') return false
  if (typeof state.currentToolOptions !== 'object') return false
  if (typeof state.lastSaved !== 'string') return false

  return true
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    console.error('Failed to clear localStorage')
  }
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number = DEBOUNCE_DELAY
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debouncedFn = function (...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }

  debouncedFn.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debouncedFn
}
