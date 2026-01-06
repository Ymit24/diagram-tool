import type { Line as LineType } from '../../types/diagram'
import { BaseShape } from './BaseShape'

interface LineProps {
  shape: LineType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Line({ shape, selected, onClick }: LineProps) {
  const { x, y, width, height, x2, y2, style } = shape

  return (
    <BaseShape x={x} y={y} width={width} height={height} selected={selected} onClick={onClick}>
      <line
        x1={0}
        y1={0}
        x2={x2}
        y2={y2}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeLinecap="round"
      />
    </BaseShape>
  )
}
