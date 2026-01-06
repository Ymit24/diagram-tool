import type { Rectangle as RectangleType } from '../../types/diagram'
import { BaseShape } from './BaseShape'

interface RectangleProps {
  shape: RectangleType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Rectangle({ shape, selected, onClick }: RectangleProps) {
  const { width, height, style } = shape

  return (
    <BaseShape x={0} y={0} width={width} height={height} selected={selected} onClick={onClick}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={style.fill || 'transparent'}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
    </BaseShape>
  )
}
