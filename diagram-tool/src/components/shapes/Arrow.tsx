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

  const angle = Math.atan2(y2, x2) * (180 / Math.PI)
  const arrowSize = 12

  return (
    <BaseShape x={x} y={y} width={0} height={0} selected={selected} onClick={onClick}>
      <line
        x1={0}
        y1={0}
        x2={x2}
        y2={y2}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeLinecap="round"
      />
      {(arrowEnd === 'end' || arrowEnd === 'both') && (
        <ArrowHead x={x2} y={y2} angle={angle} color={style.stroke} size={arrowSize} />
      )}
      {arrowEnd === 'both' && (
        <ArrowHead x={0} y={0} angle={angle + 180} color={style.stroke} size={arrowSize} />
      )}
    </BaseShape>
  )
}
