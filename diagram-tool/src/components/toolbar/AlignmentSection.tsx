import { clsx } from 'clsx'
import { AlignCenterHorizontal, AlignStartVertical, AlignCenterVertical, AlignEndVertical, AlignStartHorizontal, AlignEndHorizontal } from 'lucide-react'
import type { AlignmentType, DistributionType } from '../../utils/alignment'

interface AlignmentSectionProps {
  canAlign: boolean
  canDistribute: boolean
  onAlign: (alignment: AlignmentType) => void
  onDistribute: (distribution: DistributionType) => void
}

interface AlignmentButtonProps {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
  title: string
}

function AlignmentButton({ onClick, disabled, children, title }: AlignmentButtonProps) {
  return (
    <button
      className={clsx(
        'flex items-center justify-center',
        'w-8 h-8',
        'transition-all duration-150',
        'rounded-md border',
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer border-gray-200'
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

interface DistributionButtonProps {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
  title: string
}

function DistributionButton({ onClick, disabled, children, title }: DistributionButtonProps) {
  return (
    <button
      className={clsx(
        'flex items-center justify-center',
        'flex-1 h-8',
        'transition-all duration-150',
        'rounded-md border text-[10px]',
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer border-gray-200'
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

export function AlignmentSection({ canAlign, canDistribute, onAlign, onDistribute }: AlignmentSectionProps) {
  return (
    <div>
      <div className="flex items-center mb-2.5">
        <AlignCenterHorizontal className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alignment</span>
      </div>
      <div className="space-y-2">
        <div className="flex gap-1">
          <AlignmentButton
            onClick={() => onAlign('top')}
            disabled={!canAlign}
            title="Align Top"
          >
            <AlignStartHorizontal className="w-4 h-4" />
          </AlignmentButton>
          <AlignmentButton
            onClick={() => onAlign('middle')}
            disabled={!canAlign}
            title="Align Middle"
          >
            <AlignCenterHorizontal className="w-4 h-4" />
          </AlignmentButton>
          <AlignmentButton
            onClick={() => onAlign('bottom')}
            disabled={!canAlign}
            title="Align Bottom"
          >
            <AlignEndHorizontal className="w-4 h-4" />
          </AlignmentButton>
        </div>
        <div className="flex gap-1">
          <AlignmentButton
            onClick={() => onAlign('left')}
            disabled={!canAlign}
            title="Align Left"
          >
            <AlignStartVertical className="w-4 h-4" />
          </AlignmentButton>
          <AlignmentButton
            onClick={() => onAlign('center')}
            disabled={!canAlign}
            title="Align Center"
          >
            <AlignCenterVertical className="w-4 h-4" />
          </AlignmentButton>
          <AlignmentButton
            onClick={() => onAlign('right')}
            disabled={!canAlign}
            title="Align Right"
          >
            <AlignEndVertical className="w-4 h-4" />
          </AlignmentButton>
        </div>
        <div className="flex gap-1 pt-1 border-t border-gray-100">
          <DistributionButton
            onClick={() => onDistribute('vertical')}
            disabled={!canDistribute}
            title="Distribute vertically - space shapes evenly top to bottom"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M8 6h8M8 12h8M8 18h8" />
            </svg>
          </DistributionButton>
          <DistributionButton
            onClick={() => onDistribute('horizontal')}
            disabled={!canDistribute}
            title="Distribute horizontally - space shapes evenly left to right"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12h20M6 8v8M12 8v8M18 8v8" />
            </svg>
          </DistributionButton>
        </div>
      </div>
    </div>
  )
}
