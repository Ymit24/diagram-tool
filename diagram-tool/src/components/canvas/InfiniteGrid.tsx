interface InfiniteGridProps {
  viewport: { x: number; y: number; zoom: number }
  gridSize?: number
}

export function InfiniteGrid({ viewport, gridSize = 100 }: InfiniteGridProps) {
  const buffer = gridSize * 2
  const left = Math.floor((-viewport.x - buffer) / gridSize / viewport.zoom) * gridSize
  const right = Math.ceil((-viewport.x + window.innerWidth / viewport.zoom + buffer) / gridSize) * gridSize
  const top = Math.floor((-viewport.y - buffer) / gridSize / viewport.zoom) * gridSize
  const bottom = Math.ceil((-viewport.y + window.innerHeight / viewport.zoom + buffer) / gridSize) * gridSize

  const verticalLines = []
  for (let x = left; x <= right; x += gridSize) {
    verticalLines.push(
      <line
        key={`v${x}`}
        x1={x}
        y1={top}
        x2={x}
        y2={bottom}
        stroke="#E5E7EB"
        strokeWidth={1 / viewport.zoom}
      />
    )
  }

  const horizontalLines = []
  for (let y = top; y <= bottom; y += gridSize) {
    horizontalLines.push(
      <line
        key={`h${y}`}
        x1={left}
        y1={y}
        x2={right}
        y2={y}
        stroke="#E5E7EB"
        strokeWidth={1 / viewport.zoom}
      />
    )
  }

  return (
    <g>
      {verticalLines}
      {horizontalLines}
    </g>
  )
}
