interface ResizeHandleProps {
  x: number
  y: number
  cursor: string
  onMouseDown: (e: React.MouseEvent, handle: string) => void
}

function ResizeHandle({ x, y, cursor, onMouseDown }: ResizeHandleProps) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{ cursor }}
      onMouseDown={(e) => onMouseDown(e, 'handle')}
    >
      <rect
        x={-4}
        y={-4}
        width={8}
        height={8}
        fill="white"
        stroke="#3B82F6"
        strokeWidth={1}
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
}

export function ResizeHandles({ shape, onResizeStart }: ResizeHandlesProps) {
  const handles: React.ReactNode[] = []

  if (shape.type === 'line' || shape.type === 'arrow') {
    handles.push(
      <ResizeHandle
        key="start"
        x={0}
        y={0}
        cursor="nwse-resize"
        onMouseDown={onResizeStart}
      />,
      <ResizeHandle
        key="end"
        x={shape.x2 || shape.width}
        y={shape.y2 || shape.height}
        cursor="nwse-resize"
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
          onMouseDown={(e) => onResizeStart(e, pos.handle)}
        />
      )
    })
  }

  return <g>{handles}</g>
}
