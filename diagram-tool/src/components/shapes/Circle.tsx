import type { Circle as CircleType } from '../../types/diagram'
import { BaseShape } from './BaseShape'

interface CircleProps {
  shape: CircleType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Circle({ shape, selected, onClick }: CircleProps) {
  const { width, height, style } = shape

  return (
    <BaseShape x={shape.x} y={shape.y} width={width} height={height} selected={selected} onClick={onClick}>
      <ellipse
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        fill={style.fill || 'transparent'}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
    </BaseShape>
  )
}
