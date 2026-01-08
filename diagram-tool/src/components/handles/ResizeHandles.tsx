interface ResizeHandleProps {
  x: number
  y: number
  cursor: string
  handle: string
  inverseScale: number
  onMouseDown: (e: React.MouseEvent, handle: string) => void
}

function ResizeHandle({ x, y, cursor, handle, inverseScale, onMouseDown }: ResizeHandleProps) {
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
  shape: {
    x: number
    y: number
    width: number
    height: number
    type: string
    x2?: number
    y2?: number
  }
  onResizeStart: (e: React.MouseEvent, handle: string) => void
  viewport: { zoom: number }
}

export function ResizeHandles({ shape, onResizeStart, viewport }: ResizeHandlesProps) {
  const inverseScale = 1 / viewport.zoom
  const handles: React.ReactNode[] = []

  if (shape.type === 'line' || shape.type === 'arrow') {
    const bboxX = Math.min(shape.x, shape.x + (shape.x2 || 0))
    const bboxY = Math.min(shape.y, shape.y + (shape.y2 || 0))

    handles.push(
      <ResizeHandle
        key="start"
        x={bboxX}
        y={bboxY}
        cursor="nwse-resize"
        handle="start"
        inverseScale={inverseScale}
        onMouseDown={onResizeStart}
      />,
      <ResizeHandle
        key="end"
        x={bboxX + (shape.x2 || shape.width)}
        y={bboxY + (shape.y2 || shape.height)}
        cursor="nwse-resize"
        handle="end"
        inverseScale={inverseScale}
        onMouseDown={onResizeStart}
      />
    )
  } else {
    const { x, y, width, height } = shape
    const positions = [
      { x: x, y: y, cursor: 'nw-resize', handle: 'nw' },
      { x: x + width / 2, y: y, cursor: 'n-resize', handle: 'n' },
      { x: x + width, y: y, cursor: 'ne-resize', handle: 'ne' },
      { x: x + width, y: y + height / 2, cursor: 'e-resize', handle: 'e' },
      { x: x + width, y: y + height, cursor: 'se-resize', handle: 'se' },
      { x: x + width / 2, y: y + height, cursor: 's-resize', handle: 's' },
      { x: x, y: y + height, cursor: 'sw-resize', handle: 'sw' },
      { x: x, y: y + height / 2, cursor: 'w-resize', handle: 'w' },
    ]

    positions.forEach((pos) => {
      handles.push(
        <ResizeHandle
          key={pos.handle}
          x={pos.x}
          y={pos.y}
          cursor={pos.cursor}
          handle={pos.handle}
          inverseScale={inverseScale}
          onMouseDown={onResizeStart}
        />
      )
    })
  }

  return <g>{handles}</g>
}
