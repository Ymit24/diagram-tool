# Phase 4: Shape Rendering

## Goal
Create SVG components for each shape type (Rectangle, Circle, Line, Arrow) and render them on the canvas.

## Steps

### 4.1 Shape Component Base
Create `src/components/shapes/BaseShape.tsx`:

```typescript
import { ReactNode } from 'react'
import { ShapeStyle } from '../../types/diagram'

interface BaseShapeProps {
  children: ReactNode
  x: number
  y: number
  width: number
  height: number
  style: ShapeStyle
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function BaseShape({ children, x, y, width, height, style, selected, onClick }: BaseShapeProps) {
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
```

### 4.2 Rectangle Component
Create `src/components/shapes/Rectangle.tsx`:

```typescript
import { BaseShape } from './BaseShape'
import { Rectangle as RectangleType } from '../../types/diagram'

interface RectangleProps {
  shape: RectangleType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Rectangle({ shape, selected, onClick }: RectangleProps) {
  const { x, y, width, height, style } = shape
  
  return (
    <BaseShape x={0} y={0} width={width} height={height} style={style} selected={selected} onClick={onClick}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={style.fill || 'transparent'}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
    </BaseShape>
  )
}
```

### 4.3 Circle Component
Create `src/components/shapes/Circle.tsx`:

```typescript
import { BaseShape } from './BaseShape'
import { Circle as CircleType } from '../../types/diagram'

interface CircleProps {
  shape: CircleType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Circle({ shape, selected, onClick }: CircleProps) {
  const { x, y, width, height, style } = shape
  const radius = width / 2
  
  return (
    <BaseShape x={0} y={0} width={width} height={height} style={style} selected={selected} onClick={onClick}>
      <ellipse
        cx={radius}
        cy={radius}
        rx={radius}
        ry={radius}
        fill={style.fill || 'transparent'}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
      />
    </BaseShape>
  )
}
```

### 4.4 Line Component
Create `src/components/shapes/Line.tsx`:

```typescript
import { BaseShape } from './BaseShape'
import { Line as LineType } from '../../types/diagram'

interface LineProps {
  shape: LineType
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function Line({ shape, selected, onClick }: LineProps) {
  const { x, y, width, height, x2, y2, style } = shape
  
  return (
    <BaseShape x={0} y={0} width={width} height={height} style={style} selected={selected} onClick={onClick}>
      <line
        x1={0}
        y1={0}
        x2={x2}
        y2={y2}
        stroke={style.stroke}
        strokeWidth={style.strokeWidth}
        strokeLinecap="round"
      />
    </BaseShape>
  )
}
```

### 4.5 Arrow Component
Create `src/components/shapes/Arrow.tsx`:

```typescript
import { BaseShape } from './BaseShape'
import { Arrow as ArrowType } from '../../types/diagram'

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
  const { x, y, width, height, x2, y2, arrowEnd, style } = shape
  
  const angle = Math.atan2(y2, x2) * (180 / Math.PI)
  const arrowSize = 12
  
  return (
    <BaseShape x={0} y={0} width={width} height={height} style={style} selected={selected} onClick={onClick}>
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
```

### 4.6 Shape Factory
Create `src/components/shapes/index.ts`:

```typescript
import { DiagramShape } from '../../types/diagram'
import { Rectangle } from './Rectangle'
import { Circle } from './Circle'
import { Line } from './Line'
import { Arrow } from './Arrow'

interface ShapeRendererProps {
  shape: DiagramShape
  selected?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function ShapeRenderer({ shape, selected, onClick }: ShapeRendererProps) {
  switch (shape.type) {
    case 'rectangle':
      return <Rectangle shape={shape} selected={selected} onClick={onClick} />
    case 'circle':
      return <Circle shape={shape} selected={selected} onClick={onClick} />
    case 'line':
      return <Line shape={shape} selected={selected} onClick={onClick} />
    case 'arrow':
      return <Arrow shape={shape} selected={selected} onClick={onClick} />
    default:
      return null
  }
}
```

### 4.7 Update Canvas Component
Modify `src/components/canvas/Canvas.tsx` to render shapes:

```typescript
import { useDiagramStore } from '../../store/diagramStore'
import { ShapeRenderer } from '../shapes'

export function Canvas() {
  const { shapes, selection } = useDiagramStore()
  
  return (
    <svg className="w-full h-full" onMouseDown={handleMouseDown}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#E5E7EB" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      
      {shapes.map((shape) => (
        <ShapeRenderer
          key={shape.id}
          shape={shape}
          selected={selection.shapeIds.includes(shape.id)}
        />
      ))}
    </svg>
  )
}
```

## Deliverable
- All shape components render correctly in SVG
- Grid background pattern for visual reference
- Selection outline appears on selected shapes

## Time Estimate
~30-35 minutes

## Dependencies
- Phase 3 complete

## Next Phase Preview
Phase 5 will implement the tool system with drawing functionality.
