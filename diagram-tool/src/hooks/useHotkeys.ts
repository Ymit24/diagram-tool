import { useEffect, useCallback } from 'react'
import { useDiagramStore } from '../store/diagramStore'
import { HOTKEYS } from '../constants/hotkeys'

export function useHotkeys() {
  const { setTool, deleteShapes, setSelection, selection, undo, redo } = useDiagramStore()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        redo()
        return
      }
    }

    const key = e.key.toLowerCase()
    const action = HOTKEYS[key]

    if (!action) return

    const toolKeys = ['v', 'b', 'l', 'p', 'r', 'c', 'o', 'a']
    if (toolKeys.includes(key) || key === 'delete' || key === 'backspace' || key === 'escape') {
      e.preventDefault()
    }

    switch (action) {
      case 'select-click':
      case 'select-box':
      case 'select-lasso':
      case 'pan':
      case 'rectangle':
      case 'circle':
      case 'line':
      case 'arrow':
        setTool(action)
        break
      case 'delete':
        deleteShapes(selection.shapeIds)
        break
      case 'deselect':
        setSelection({ shapeIds: [], selectionType: 'none' })
        break
    }
  }, [setTool, deleteShapes, setSelection, selection.shapeIds, undo, redo])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
