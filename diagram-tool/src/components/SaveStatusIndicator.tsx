import { useDiagramStore } from '../store/diagramStore'
import { useAutoSave, useRelativeTime } from '../hooks/useAutoSave'

export function SaveStatusIndicator() {
  const shapes = useDiagramStore((state) => state.shapes)
  const { lastSaved, status } = useAutoSave()
  const relativeTime = useRelativeTime(lastSaved)

  const statusText = status === 'saving' ? 'Saving...' : status === 'error' ? 'Save failed' : relativeTime

  if (shapes.length === 0 || (!statusText && status !== 'saving')) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-gray-100 transition-all duration-300">
        {status === 'saving' && (
          <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        )}
        {status === 'saved' && (
          <div className="w-2 h-2 bg-green-500 rounded-full" />
        )}
        {status === 'error' && (
          <div className="w-2 h-2 bg-red-500 rounded-full" />
        )}
        <span className={`text-xs font-medium transition-colors duration-300 ${
          status === 'error' ? 'text-red-500' : 'text-gray-500'
        }`}>
          {statusText}
        </span>
      </div>
    </div>
  )
}
