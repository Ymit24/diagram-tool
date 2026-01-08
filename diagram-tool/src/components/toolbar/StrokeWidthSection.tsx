import { clsx } from 'clsx'
import { CircleDashed } from 'lucide-react'

interface StrokeWidthSectionProps {
  widths: number[]
  selected: number | null
  mixed?: boolean
  onSelect: (value: number) => void
}

export function StrokeWidthSection({ widths, selected, mixed = false, onSelect }: StrokeWidthSectionProps) {
  return (
    <div>
      <div className="flex items-center mb-2.5">
        <CircleDashed className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stroke Width</span>
        {mixed && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
            Mixed
          </span>
        )}
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
              (selected === width || (selected === null && !mixed))
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
