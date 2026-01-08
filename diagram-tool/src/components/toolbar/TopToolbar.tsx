import { useCallback } from 'react'
import { MousePointer2, Square, Circle, Minus, ArrowRight, Undo2, Redo2, Copy, Trash2, Section, LassoSelect, Hand } from 'lucide-react'
import { clsx } from 'clsx'
import { useDiagramStore } from '../../store/diagramStore'
import type { ToolType } from '../../types/diagram'
import { LAYOUT } from '../../constants/layout'

const SELECTION_TOOLS: { type: ToolType; icon: React.ComponentType<{ className?: string }>; label: string; shortcut: string }[] = [
  { type: 'select-click', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { type: 'select-box', icon: Section, label: 'Box Select', shortcut: 'B' },
  { type: 'select-lasso', icon: LassoSelect, label: 'Lasso Select', shortcut: 'L' },
  { type: 'pan', icon: Hand, label: 'Pan', shortcut: 'P' },
]

const DRAWING_TOOLS: { type: ToolType; icon: React.ComponentType<{ className?: string }>; label: string; shortcut: string }[] = [
  { type: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { type: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { type: 'line', icon: Minus, label: 'Line', shortcut: 'O' },
  { type: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
]

export function TopToolbar() {
  const {
    currentTool,
    setTool,
    selection,
    deleteShapes,
    undo,
    redo,
    past,
    future,
  } = useDiagramStore()

  const handleUndo = useCallback(() => {
    undo()
  }, [undo])

  const handleRedo = useCallback(() => {
    redo()
  }, [redo])

  const handleDelete = useCallback(() => {
    if (selection.shapeIds.length > 0) {
      deleteShapes(selection.shapeIds)
    }
  }, [selection.shapeIds, deleteShapes])

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div 
        className={clsx(
          'flex items-center gap-1 px-2 py-1.5',
          'bg-white/95 backdrop-blur-xl',
          'border border-gray-200/50',
          'transition-all duration-300 ease-out',
          'shadow-lg shadow-gray-900/5',
        )}
        style={{ 
          borderRadius: LAYOUT.floatingToolbar.borderRadius,
          height: LAYOUT.floatingToolbar.height,
        }}
      >
        <ToolbarGroup>
          <IconButton
            icon={Undo2}
            label="Undo"
            onClick={handleUndo}
            disabled={past.length === 0}
          />
          <IconButton
            icon={Redo2}
            label="Redo"
            onClick={handleRedo}
            disabled={future.length === 0}
          />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          {SELECTION_TOOLS.map(({ type, icon: Icon, label, shortcut }) => (
            <ToolButton
              key={type}
              icon={Icon}
              label={label}
              shortcut={shortcut}
              active={currentTool === type}
              onClick={() => setTool(type)}
            />
          ))}
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup>
          {DRAWING_TOOLS.map(({ type, icon: Icon, label, shortcut }) => (
            <ToolButton
              key={type}
              icon={Icon}
              label={label}
              shortcut={shortcut}
              active={currentTool === type}
              onClick={() => setTool(type)}
            />
          ))}
        </ToolbarGroup>

        <ToolbarGroup>
          <IconButton 
            icon={Copy} 
            label="Duplicate" 
            onClick={() => console.log('Duplicate')}
            disabled={selection.shapeIds.length !== 1}
          />
          <IconButton 
            icon={Trash2} 
            label="Delete" 
            onClick={handleDelete}
            disabled={selection.shapeIds.length === 0}
            danger
          />
        </ToolbarGroup>
      </div>
    </div>
  )
}

function IconButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  danger = false,
  size = 'normal'
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  size?: 'small' | 'normal'
}) {
  return (
    <button
      className={clsx(
        'flex items-center justify-center',
        'transition-all duration-200',
        'rounded-lg',
        size === 'small' ? 'w-7 h-7' : 'w-8 h-8',
        disabled 
          ? 'opacity-40 cursor-not-allowed' 
          : clsx(
              danger 
                ? 'text-red-500 hover:bg-red-50' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              'cursor-pointer'
            )
      )}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      <Icon className={size === 'small' ? 'w-4 h-4' : 'w-4.5 h-4.5'} />
    </button>
  )
}

function ToolButton({
  icon: Icon,
  label,
  shortcut,
  active,
  onClick
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  shortcut: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      className={clsx(
        'flex items-center justify-center',
        'w-9 h-9',
        'transition-all duration-200',
        'rounded-lg',
        'relative',
        active
          ? 'bg-gray-900 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        'cursor-pointer'
      )}
      onClick={onClick}
      title={`${label} (${shortcut})`}
    >
      <Icon className="w-4.5 h-4.5" />
      <span className={clsx(
        'absolute -bottom-3 left-1/2 -translate-x-1/2',
        'text-[10px] font-medium',
        'opacity-0 transition-opacity duration-150',
        active ? 'text-gray-900' : 'text-gray-400',
        'group-hover:opacity-100'
      )}>
        {shortcut}
      </span>
    </button>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 px-1">
      {children}
    </div>
  )
}

function ToolbarDivider() {
  return (
    <div className="w-px h-5 bg-gray-200 mx-1" />
  )
}
