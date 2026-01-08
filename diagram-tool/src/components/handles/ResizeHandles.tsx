import { getResizeHandles } from '../../utils/shapeBounds'
import type { DiagramShape } from '../../types/diagram'

interface ResizeHandleComponentProps {
  x: number
  y: number
  cursor: string
  handle: string
  inverseScale: number
  onMouseDown: (e: React.MouseEvent, handle: string) => void
}

function ResizeHandleComponent({ x, y, cursor, handle, inverseScale, onMouseDown }: ResizeHandleComponentProps) {
  const size = 8 * inverseScale
  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor }}
      onMouseDown={(e) => onMouseDown(e, handle)}
    >
      <rect
        x={-size / 2}
        y={-size / 2}
        width={size}
        height={size}
        fill="white"
        stroke="#3B82F6"
        strokeWidth={1 / (1 / inverseScale)}
      />
    </g>
  )
}

export interface ResizeHandlesProps {
  shape: DiagramShape
  onResizeStart: (e: React.MouseEvent, handle: string) => void
  viewport: { zoom: number }
}

export function ResizeHandles({ shape, onResizeStart, viewport }: ResizeHandlesProps) {
  const inverseScale = 1 / viewport.zoom
  const handles = getResizeHandles(shape, inverseScale)

  return (
    <g>
      {handles.map((handleInfo) => (
        <ResizeHandleComponent
          key={handleInfo.handle}
          x={handleInfo.x}
          y={handleInfo.y}
          cursor={handleInfo.cursor}
          handle={handleInfo.handle}
          inverseScale={inverseScale}
          onMouseDown={onResizeStart}
        />
      ))}
    </g>
  )
}
