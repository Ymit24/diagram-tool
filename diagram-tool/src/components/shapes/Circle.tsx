import type { Circle as CircleType } from '../../types/diagram'
import { BaseShape } from './BaseShape'

interface CircleProps {
  shape: CircleType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Circle({ shape, selected, onClick }: CircleProps) {
  const { x, y, width, height, style } = shape
  const radius = width / 2
  const strokeHalf = style.strokeWidth / 2
  const padding = 2 + strokeHalf

  return (
    <BaseShape x={x - padding} y={y - padding} width={width + padding * 2} height={height + padding * 2} selected={selected} onClick={onClick}>
      <ellipse
        cx={radius + padding}
        cy={radius + padding}
        rx={radius}
        ry={radius}
        fill={style.fill || 'transparent'}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
    </BaseShape>
  )
}
