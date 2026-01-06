import type { Arrow as ArrowType } from '../../types/diagram'
import { BaseShape } from './BaseShape'

interface ArrowProps {
  shape: ArrowType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

function ArrowHead({ x, y, angle, color, size }: { x: number; y: number; angle: number; color: string; size: number }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      <polygon
        points={`0,0 ${-size},${-size/2} ${-size},${size/2}`}
        fill={color}
      />
    </g>
  )
}

export function Arrow({ shape, selected, onClick }: ArrowProps) {
  const { x, y, x2, y2, arrowEnd, style } = shape

  const bboxX = Math.min(x, x + x2)
  const bboxY = Math.min(y, y + y2)
  const baseX = x - bboxX
  const baseY = y - bboxY
  const headX = baseX + x2
  const headY = baseY + y2

  const angle = Math.atan2(y2, x2) * (180 / Math.PI)
  const arrowSize = 12
  const startAngle = Math.atan2(-y2, -x2) * (180 / Math.PI)

  return (
    <BaseShape x={bboxX} y={bboxY} width={Math.abs(x2)} height={Math.abs(y2)} selected={selected} onClick={onClick}>
      <line
        x1={baseX}
        y1={baseY}
        x2={headX}
        y2={headY}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeLinecap="round"
      />
      {(arrowEnd === 'end' || arrowEnd === 'both') && (
        <ArrowHead x={headX} y={headY} angle={angle} color={style.stroke} size={arrowSize} />
      )}
      {arrowEnd === 'both' && (
        <ArrowHead x={baseX} y={baseY} angle={startAngle} color={style.stroke} size={arrowSize} />
      )}
    </BaseShape>
  )
}
