import type { Line as LineType } from '../../types/diagram'
import { BaseShape } from './BaseShape'

interface LineProps {
  shape: LineType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Line({ shape, selected, onClick }: LineProps) {
  const { x, y, width, height, x2, y2, style } = shape

  const bboxX = Math.min(x, x + x2)
  const bboxY = Math.min(y, y + y2)
  const baseX = x - bboxX
  const baseY = y - bboxY
  const headX = baseX + x2
  const headY = baseY + y2

  return (
    <BaseShape x={bboxX} y={bboxY} width={width} height={height} selected={selected} onClick={onClick}>
      <line
        x1={baseX}
        y1={baseY}
        x2={headX}
        y2={headY}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeLinecap="round"
      />
    </BaseShape>
  )
}
