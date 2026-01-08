import { useEffect, useRef, useState, useCallback } from 'react'
import { useDiagramStore } from '../store/diagramStore'
import { saveToStorage, debounce } from '../utils/storage'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveReturn {
  lastSaved: Date | null
  status: SaveStatus
}

export function useAutoSave(): UseAutoSaveReturn {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const shapes = useDiagramStore((state) => state.shapes)
  const selection = useDiagramStore((state) => state.selection)
  const viewport = useDiagramStore((state) => state.viewport)
  const currentTool = useDiagramStore((state) => state.currentTool)
  const currentToolOptions = useDiagramStore((state) => state.currentToolOptions)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const performSave = useCallback(() => {
    setStatus('saving')
    try {
      saveToStorage({
        shapes,
        selection,
        viewport,
        currentTool,
        currentToolOptions,
      })
      setLastSaved(new Date())
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }, [shapes, selection, viewport, currentTool, currentToolOptions])

  const debouncedSave = useCallback(debounce(performSave, 500), [performSave])

  useEffect(() => {
    if (saveTimeoutRef.current !== null) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave()
    }, 10)

    return () => {
      if (saveTimeoutRef.current !== null) {
        clearTimeout(saveTimeoutRef.current)
      }
      debouncedSave.cancel()
    }
  }, [shapes, selection, debouncedSave])

  return { lastSaved, status }
}

export function useRelativeTime(date: Date | null): string {
  if (!date) return ''

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)

  if (diffSeconds < 5) return 'Saved just now'
  if (diffSeconds < 60) return `Saved ${diffSeconds}s ago`
  if (diffMinutes < 60) return `Saved ${diffMinutes}m ago`
  if (diffHours < 24) return `Saved ${diffHours}h ago`

  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
