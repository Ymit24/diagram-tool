import type { ArrowHeadStyle } from '../../types/diagram'

interface ArrowHeadProps {
  x: number
  y: number
  angle: number
  color: string
  size: number
  style: ArrowHeadStyle
}

export function ArrowHead({ x, y, angle, color, size, style }: ArrowHeadProps) {
  const strokeColor = style === 'open' ? color : 'none'
  const fillColor = style === 'open' ? 'none' : color

  switch (style) {
    case 'filled':
      return (
        <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
          <polygon
            points={`0,0 ${-size},${-size/2} ${-size},${size/2}`}
            fill={fillColor}
          />
        </g>
      )

    case 'open':
      return (
        <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
          <polygon
            points={`0,0 ${-size},${-size/2} ${-size},${size/2}`}
            fill={fillColor}
            stroke={color}
            strokeWidth={2}
          />
        </g>
      )

    case 'stealth':
      return (
        <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
          <polygon
            points={`0,0 ${-size * 0.6},${-size * 0.3} ${-size * 0.6},${size * 0.3}`}
            fill={fillColor}
          />
        </g>
      )

    case 'diamond':
      return (
        <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
          <polygon
            points={`0,0 ${-size * 0.7},${-size * 0.35} ${-size * 1.4},0 ${-size * 0.7},${size * 0.35}`}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={style === 'diamond' && strokeColor !== 'none' ? 2 : 0}
          />
        </g>
      )

    case 'circle':
      return (
        <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
          <circle
            cx={-size * 0.5}
            cy={0}
            r={size * 0.35}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={style === 'circle' && strokeColor !== 'none' ? 2 : 0}
          />
        </g>
      )

    case 'bar':
      return (
        <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
          <line
            x1={-size * 0.8}
            y1={-size * 0.5}
            x2={-size * 0.8}
            y2={size * 0.5}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      )

    default:
      return null
  }
}
