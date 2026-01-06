import { useDiagramStore } from '../../store/diagramStore'
import { DEFAULT_STROKE_COLORS, DEFAULT_FILL_COLORS, DEFAULT_STROKE_WIDTHS } from '../../constants/colors'
import { LAYOUT } from '../../constants/layout'
import { clsx } from 'clsx'
import { Palette, CircleDashed } from 'lucide-react'

function Stroke({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20L20 4" />
    </svg>
  )
}

export function ToolOptionsPanel() {
  const { currentToolOptions, updateToolOptions, currentTool } = useDiagramStore()

  const isDrawingTool = ['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)

  return (
    <div 
      className="fixed left-4 top-20 z-40"
      style={{ width: LAYOUT.floatingPanel.width }}
    >
      <div className={clsx(
        'bg-white/95 backdrop-blur-xl',
        'border border-gray-200/50',
        'shadow-lg shadow-gray-900/5',
        'transition-all duration-300',
      )}
      style={{ borderRadius: LAYOUT.floatingToolbar.borderRadius }}
      >
        <div className={clsx(
          'flex items-center px-4',
          'border-b border-gray-100',
          'text-sm font-medium text-gray-500'
        )}
        style={{ height: LAYOUT.floatingPanel.headerHeight }}
        >
          <Palette className="w-4 h-4 mr-2" />
          Style Options
        </div>

        <div className="p-4 space-y-5">
          {isDrawingTool ? (
            <>
              <ColorSection
                title="Stroke Color"
                colors={DEFAULT_STROKE_COLORS}
                selected={currentToolOptions.stroke}
                onSelect={(stroke) => updateToolOptions({ stroke })}
              />

              <ColorSection
                title="Fill Color"
                colors={DEFAULT_FILL_COLORS}
                selected={currentToolOptions.fill || 'transparent'}
                onSelect={(fill) => updateToolOptions({ fill })}
              />

              <StrokeWidthSection
                widths={DEFAULT_STROKE_WIDTHS}
                selected={currentToolOptions.strokeWidth}
                onSelect={(strokeWidth) => updateToolOptions({ strokeWidth })}
              />
            </>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              <CircleDashed className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a drawing tool to edit styles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ColorSection({
  title,
  colors,
  selected,
  onSelect
}: {
  title: string
  colors: { name: string; value: string }[]
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div>
      <div className="flex items-center mb-2.5">
        <Stroke className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {colors.map((color) => (
          <button
            key={color.value}
            className={clsx(
              'flex items-center justify-center',
              'w-full aspect-square',
              'transition-all duration-150',
              'rounded-md border',
              selected === color.value
                ? 'border-gray-900 ring-1 ring-gray-900 ring-offset-1'
                : 'border-gray-200 hover:border-gray-300',
              'cursor-pointer'
            )}
            style={{ backgroundColor: color.value }}
            onClick={() => onSelect(color.value)}
            title={color.name}
          >
            {color.value === 'transparent' && (
              <div className="w-3 h-0.5 bg-gray-300" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function StrokeWidthSection({
  widths,
  selected,
  onSelect
}: {
  widths: number[]
  selected: number
  onSelect: (value: number) => void
}) {
  return (
    <div>
      <div className="flex items-center mb-2.5">
        <CircleDashed className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stroke Width</span>
      </div>
      <div className="flex gap-1.5">
        {widths.map((width) => (
          <button
            key={width}
            className={clsx(
              'flex-1 h-8',
              'flex items-center justify-center',
              'transition-all duration-150',
              'rounded-md border',
              selected === width
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
              'cursor-pointer'
            )}
            onClick={() => onSelect(width)}
          >
            <div 
              className="w-4 rounded-full bg-current opacity-80" 
              style={{ height: width }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
