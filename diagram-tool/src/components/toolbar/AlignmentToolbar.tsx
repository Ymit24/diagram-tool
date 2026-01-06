import { clsx } from 'clsx'
import { useDiagramStore } from '../../store/diagramStore'

interface AlignmentButtonProps {
  label: string
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}

function AlignmentButton({ label, onClick, disabled, children }: AlignmentButtonProps) {
  return (
    <button
      className={clsx(
        'flex items-center justify-center',
        'w-7 h-7',
        'transition-all duration-150',
        'rounded',
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
      )}
      onClick={onClick}
      disabled={disabled}
      title={label}
    >
      {children}
    </button>
  )
}

function AlignLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="3" y1="6" x2="15" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="15" y2="18" />
    </svg>
  )
}

function AlignCenterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="6" y1="6" x2="18" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="6" y1="18" x2="18" y2="18" />
    </svg>
  )
}

function AlignRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="9" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="9" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function AlignTopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="6" y1="3" x2="6" y2="15" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="18" y1="3" x2="18" y2="15" />
    </svg>
  )
}

function AlignMiddleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="6" y1="4" x2="6" y2="20" />
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="18" y1="4" x2="18" y2="20" />
    </svg>
  )
}

function AlignBottomIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="6" y1="9" x2="6" y2="21" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="18" y1="9" x2="18" y2="21" />
    </svg>
  )
}

function DistributeHorizontalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function DistributeVerticalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="6" y1="3" x2="6" y2="21" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="18" y1="3" x2="18" y2="21" />
    </svg>
  )
}

export function AlignmentToolbar() {
  const { selection, alignShapes, distributeShapes } = useDiagramStore()
  const canAlign = selection.shapeIds.length >= 2
  const canDistribute = selection.shapeIds.length >= 3

  return (
    <>
      <ToolbarDivider />

      <ToolbarGroup>
        <div className="flex items-center gap-0.5 px-1">
          <AlignmentButton
            label="Align Left (Ctrl+Alt+L)"
            onClick={() => alignShapes('left')}
            disabled={!canAlign}
          >
            <AlignLeftIcon />
          </AlignmentButton>
          <AlignmentButton
            label="Align Center (Ctrl+Alt+C)"
            onClick={() => alignShapes('center')}
            disabled={!canAlign}
          >
            <AlignCenterIcon />
          </AlignmentButton>
          <AlignmentButton
            label="Align Right (Ctrl+Alt+R)"
            onClick={() => alignShapes('right')}
            disabled={!canAlign}
          >
            <AlignRightIcon />
          </AlignmentButton>
        </div>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <div className="flex items-center gap-0.5 px-1">
          <AlignmentButton
            label="Align Top (Ctrl+Alt+T)"
            onClick={() => alignShapes('top')}
            disabled={!canAlign}
          >
            <AlignTopIcon />
          </AlignmentButton>
          <AlignmentButton
            label="Align Middle (Ctrl+Alt+M)"
            onClick={() => alignShapes('middle')}
            disabled={!canAlign}
          >
            <AlignMiddleIcon />
          </AlignmentButton>
          <AlignmentButton
            label="Align Bottom (Ctrl+Alt+B)"
            onClick={() => alignShapes('bottom')}
            disabled={!canAlign}
          >
            <AlignBottomIcon />
          </AlignmentButton>
        </div>
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <div className="flex items-center gap-0.5 px-1">
          <AlignmentButton
            label="Distribute Horizontally (Ctrl+Alt+Shift+H)"
            onClick={() => distributeShapes('horizontal')}
            disabled={!canDistribute}
          >
            <DistributeHorizontalIcon />
          </AlignmentButton>
          <AlignmentButton
            label="Distribute Vertically (Ctrl+Alt+Shift+V)"
            onClick={() => distributeShapes('vertical')}
            disabled={!canDistribute}
          >
            <DistributeVerticalIcon />
          </AlignmentButton>
        </div>
      </ToolbarGroup>
    </>
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
