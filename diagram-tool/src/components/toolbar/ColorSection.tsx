import { clsx } from 'clsx'
import type { ColorItem } from '../../types/diagram'

interface ColorSectionProps {
  title: string
  colors: ColorItem[]
  selected: string | null
  mixed?: boolean
  onSelect: (value: string) => void
}

function StrokeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20L20 4" />
    </svg>
  )
}

export function ColorSection({ title, colors, selected, mixed = false, onSelect }: ColorSectionProps) {
  return (
    <div>
      <div className="flex items-center mb-2.5">
        <StrokeIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</span>
        {mixed && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
            Mixed
          </span>
        )}
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
              (selected === color.value || (selected === null && !mixed))
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
