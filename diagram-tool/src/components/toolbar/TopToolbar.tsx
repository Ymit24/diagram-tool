import { MousePointer2, Square, Circle, Minus, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'

export function TopToolbar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 px-4 flex items-center gap-1 z-50">
      <div className="flex items-center gap-1 pr-4 border-r border-gray-200">
        <ToolButton icon={MousePointer2} active label="Select (V)" />
        <ToolButton icon={Square} label="Rectangle (R)" />
        <ToolButton icon={Circle} label="Circle (C)" />
        <ToolButton icon={Minus} label="Line (O)" />
        <ToolButton icon={ArrowRight} label="Arrow (A)" />
      </div>
      <div className="flex-1" />
      <span className="text-sm text-gray-500">Phase 2: UI Scaffold</span>
    </div>
  )
}

function ToolButton({
  icon: Icon,
  active,
  label
}: {
  icon: React.ComponentType<{ className?: string }>
  active?: boolean
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
      title={label}
    >
      <Icon className="w-5 h-5" />
    </button>
  )
}
