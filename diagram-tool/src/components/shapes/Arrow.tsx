import type { Arrow as ArrowType } from '../../types/diagram'
import { BaseShape } from './BaseShape'
import { ArrowHead } from './ArrowHead'
import { getLineEndpoints } from '../../utils/shapeBounds'

interface ArrowProps {
  shape: ArrowType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Arrow({ shape, selected, onClick }: ArrowProps) {
  const { x2, y2, arrowEnd, style } = shape
  const { baseX, baseY, headX, headY } = getLineEndpoints(shape)

  const angle = Math.atan2(y2, x2) * (180 / Math.PI)
  const arrowSize = 12
  const startAngle = Math.atan2(-y2, -x2) * (180 / Math.PI)
  const arrowHeadStyle = style.arrowHeadStyle || 'filled'

  return (
    <BaseShape x={shape.x} y={shape.y} width={shape.width} height={shape.height} selected={selected} onClick={onClick}>
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
        <ArrowHead x={headX} y={headY} angle={angle} color={style.stroke} size={arrowSize} style={arrowHeadStyle} />
      )}
      {arrowEnd === 'both' && (
        <ArrowHead x={baseX} y={baseY} angle={startAngle} color={style.stroke} size={arrowSize} style={arrowHeadStyle} />
      )}
    </BaseShape>
  )
}
