import type { Line as LineType } from '../../types/diagram'
import { BaseShape } from './BaseShape'

interface LineProps {
  shape: LineType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Line({ shape, selected, onClick }: LineProps) {
  const { x, y, width, height, x2, y2, style } = shape

  const minX = Math.min(0, x2)
  const minY = Math.min(0, y2)
  const adjustedX2 = x2 - minX
  const adjustedY2 = y2 - minY

  return (
    <BaseShape x={x + minX} y={y + minY} width={width} height={height} selected={selected} onClick={onClick}>
      <line
        x1={minX === 0 ? 0 : width}
        y1={minY === 0 ? 0 : height}
        x2={adjustedX2}
        y2={adjustedY2}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeLinecap="round"
      />
    </BaseShape>
  )
}
