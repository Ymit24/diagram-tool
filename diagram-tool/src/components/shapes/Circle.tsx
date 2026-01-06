import type { Circle as CircleType } from '../../types/diagram'
import { BaseShape } from './BaseShape'

interface CircleProps {
  shape: CircleType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Circle({ shape, selected, onClick }: CircleProps) {
  const { width, height, style } = shape
  const radius = width / 2

  return (
    <BaseShape x={0} y={0} width={width} height={height} selected={selected} onClick={onClick}>
      <ellipse
        cx={radius}
        cy={radius}
        rx={radius}
        ry={radius}
        fill={style.fill || 'transparent'}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
    </BaseShape>
  )
}
