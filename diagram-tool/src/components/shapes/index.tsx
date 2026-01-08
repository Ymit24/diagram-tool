import type { DiagramShape } from '../../types/diagram'
import { Rectangle } from './Rectangle'
import { Circle } from './Circle'
import { Line } from './Line'
import { Arrow } from './Arrow'
import { ResizeHandles } from '../handles/ResizeHandles'
import { useDiagramStore } from '../../store/diagramStore'

interface ShapeRendererProps {
  shape: DiagramShape
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

interface SelectedShapeRendererProps extends ShapeRendererProps {
  onResizeStart?: (e: React.MouseEvent, handle: string) => void
}

export function ShapeRenderer({ shape, selected, onClick }: ShapeRendererProps) {
  switch (shape.type) {
    case 'rectangle':
      return <Rectangle shape={shape} selected={selected} onClick={onClick} />
    case 'circle':
      return <Circle shape={shape} selected={selected} onClick={onClick} />
    case 'line':
      return <Line shape={shape} selected={selected} onClick={onClick} />
    case 'arrow':
      return <Arrow shape={shape} selected={selected} onClick={onClick} />
    default:
      return null
  }
}

export function SelectedShapeRenderer({ shape, selected, onClick, onResizeStart }: SelectedShapeRendererProps) {
  const { viewport } = useDiagramStore()
  
  return (
    <g>
      <ShapeRenderer shape={shape} selected={selected} onClick={onClick} />
      {selected && onResizeStart && (
        <ResizeHandles
          shape={shape}
          onResizeStart={onResizeStart}
          viewport={viewport}
        />
      )}
    </g>
  )
}
