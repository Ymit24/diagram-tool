import type { Line as LineType } from '../../types/diagram'
import { BaseShape } from './BaseShape'
import { getLineEndpoints } from '../../utils/shapeBounds'

interface LineProps {
  shape: LineType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Line({ shape, selected, onClick }: LineProps) {
  const { style } = shape
  const { baseX, baseY, headX, headY } = getLineEndpoints(shape)

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
    </BaseShape>
  )
}
