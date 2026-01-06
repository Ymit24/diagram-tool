import { MousePointer2, Section, LassoSelect, Square, Circle, Minus, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { useDiagramStore } from '../../store/diagramStore'
import type { ToolType } from '../../types/diagram'

const TOOLS: { type: ToolType; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { type: 'select-click', icon: MousePointer2, label: 'Select (Click) - V' },
  { type: 'select-box', icon: Section, label: 'Select (Box) - B' },
  { type: 'select-lasso', icon: LassoSelect, label: 'Select (Lasso) - L' },
  { type: 'rectangle', icon: Square, label: 'Rectangle - R' },
  { type: 'circle', icon: Circle, label: 'Circle - C' },
  { type: 'line', icon: Minus, label: 'Line - O' },
  { type: 'arrow', icon: ArrowRight, label: 'Arrow - A' },
]

export function TopToolbar() {
  const { currentTool, setTool } = useDiagramStore()

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 px-4 flex items-center gap-1 z-50">
      <div className="flex items-center gap-1 pr-4 border-r border-gray-200">
        {TOOLS.map(({ type, icon: Icon, label }) => (
          <ToolButton
            key={type}
            icon={Icon}
            active={currentTool === type}
            onClick={() => setTool(type)}
            label={label}
          />
        ))}
      </div>
      <div className="flex-1" />
      <span className="text-sm text-gray-500">Phase 6: Selection System</span>
    </div>
  )
}

function ToolButton({
  icon: Icon,
  active,
  onClick,
  label
}: {
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
  onClick?: () => void
  label: string
}) {
  return (
    <button
      className={clsx(
        'p-2 rounded-lg transition-colors',
        active
          ? 'bg-blue-100 text-blue-600'
          : 'hover:bg-gray-100 text-gray-600'
      )}
      onClick={onClick}
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}
