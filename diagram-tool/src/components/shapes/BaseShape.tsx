import type { ReactNode } from 'react'

interface BaseShapeProps {
  children: ReactNode
  x: number
  y: number
  width: number
  height: number
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function BaseShape({ children, x, y, width, height, selected, onClick }: BaseShapeProps) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {children}
      {selected && (
        <rect
          x={-2}
          y={-2}
          width={width + 4}
          height={height + 4}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
      )}
    </g>
  )
}
