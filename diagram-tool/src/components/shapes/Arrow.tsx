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

  const minX = Math.min(0, x2)
  const minY = Math.min(0, y2)
  const width = Math.abs(x2)
  const height = Math.abs(y2)
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
      {(arrowEnd === 'end' || arrowEnd === 'both') && (
        <ArrowHead x={adjustedX2} y={adjustedY2} angle={angle} color={style.stroke} size={arrowSize} />
      )}
      {arrowEnd === 'both' && (
        <ArrowHead x={minX === 0 ? 0 : width} y={minY === 0 ? 0 : height} angle={angle + 180} color={style.stroke} size={arrowSize} />
      )}
    </BaseShape>
  )
}
