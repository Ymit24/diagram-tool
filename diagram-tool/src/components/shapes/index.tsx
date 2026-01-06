import type { DiagramShape } from '../../types/diagram'
import { Rectangle } from './Rectangle'
import { Line } from './Line'
import { Arrow } from './Arrow'

interface ShapeRendererProps {
  shape: DiagramShape
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function ShapeRenderer({ shape, selected, onClick }: ShapeRendererProps) {
  switch (shape.type) {
    case 'rectangle':
      return <Rectangle shape={shape} selected={selected} onClick={onClick} />
    case 'line':
      return <Line shape={shape} selected={selected} onClick={onClick} />
    case 'arrow':
      return <Arrow shape={shape} selected={selected} onClick={onClick} />
    default:
      return null
  }
}
