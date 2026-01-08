import { clsx } from 'clsx'
import { ArrowLeft } from 'lucide-react'
import type { ArrowHeadStyle } from '../../types/diagram'

interface ArrowStyleSectionProps {
  styles: readonly { name: string; value: string }[]
  selected: ArrowHeadStyle | null
  mixed?: boolean
  onSelect: (value: ArrowHeadStyle) => void
}

function renderPreview(style: string, size: number = 12): React.ReactNode {
  const color = '#374151'
  
  switch (style) {
    case 'filled':
      return (
        <svg viewBox="0 0 24 24" width={size * 1.5} height={size * 1.5}>
          <polygon points={`12,2 2,8 2,14 12,20 22,14 22,8`} fill={color} />
        </svg>
      )
    case 'open':
      return (
        <svg viewBox="0 0 24 24" width={size * 1.5} height={size * 1.5}>
          <polygon points={`12,2 2,8 2,14 12,20 22,14 22,8`} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      )
    case 'stealth':
      return (
        <svg viewBox="0 0 24 24" width={size * 1.5} height={size * 1.5}>
          <polygon points={`12,4 4,9 4,15 12,20 20,15 20,9`} fill={color} />
        </svg>
      )
    case 'diamond':
      return (
        <svg viewBox="0 0 24 24" width={size * 1.5} height={size * 1.5}>
          <polygon points={`12,2 4,7 4,17 12,22 20,17 20,7`} fill={color} />
        </svg>
      )
    case 'circle':
      return (
        <svg viewBox="0 0 24 24" width={size * 1.5} height={size * 1.5}>
          <circle cx="12" cy="12" r="7" fill={color} />
        </svg>
      )
    case 'bar':
      return (
        <svg viewBox="0 0 24 24" width={size * 1.5} height={size * 1.5}>
          <line x1="2" y1="6" x2="10" y2="6" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <line x1="2" y1="12" x2="10" y2="12" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <line x1="2" y1="18" x2="10" y2="18" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

export function ArrowStyleSection({ styles, selected, mixed = false, onSelect }: ArrowStyleSectionProps) {
  return (
    <div>
      <div className="flex items-center mb-2.5">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-gray-400" style={{ transform: 'rotate(0deg)' }} />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Arrow Style</span>
        {mixed && (
          <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
            Mixed
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {styles.map((style) => (
          <button
            key={style.value}
            className={clsx(
              'flex flex-col items-center justify-center',
              'h-12',
              'transition-all duration-150',
              'rounded-md border',
              (selected === style.value || (selected === null && !mixed))
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
              'cursor-pointer'
            )}
            onClick={() => onSelect(style.value as ArrowHeadStyle)}
          >
            <div className="mb-1">
              {renderPreview(style.value)}
            </div>
            <span className="text-[10px]">{style.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
