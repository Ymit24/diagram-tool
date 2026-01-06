import { useDiagramStore } from '../../store/diagramStore'
import { ShapeRenderer } from '../shapes'

export function Canvas() {
  const { shapes, selection } = useDiagramStore()

  return (
    <div className="w-full h-full overflow-hidden cursor-crosshair">
      <svg className="w-full h-full">
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
    </div>
  )
}
