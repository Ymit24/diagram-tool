import { useDiagramStore } from '../../store/diagramStore'
import { Maximize2, Minimize2, Grid3X3 } from 'lucide-react'
import { clsx } from 'clsx'
import { LAYOUT } from '../../constants/layout'

export function ZoomControls() {
  const { viewport, setViewport, shapes } = useDiagramStore()

  const handleZoomIn = () => {
    setViewport({ zoom: Math.min(viewport.zoom * 1.2, 5) })
  }

  const handleZoomOut = () => {
    setViewport({ zoom: Math.max(viewport.zoom / 1.2, 0.1) })
  }

  const handleZoomReset = () => {
    setViewport({ zoom: 1, x: 0, y: 0 })
  }

  const handleFitToScreen = () => {
    if (shapes.length === 0) {
      handleZoomReset()
      return
    }

    const bounds = shapes.reduce((acc, shape) => ({
      minX: Math.min(acc.minX, shape.x),
      minY: Math.min(acc.minY, shape.y),
      maxX: Math.max(acc.maxX, shape.x + shape.width),
      maxY: Math.max(acc.maxY, shape.y + shape.height),
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })

    if (bounds.minX === Infinity) {
      handleZoomReset()
      return
    }

    const contentWidth = bounds.maxX - bounds.minX + 200
    const contentHeight = bounds.maxY - bounds.minY + 200
    const scaleX = window.innerWidth * 0.8 / contentWidth
    const scaleY = window.innerHeight * 0.8 / contentHeight
    const newZoom = Math.min(scaleX, scaleY, 2)

    setViewport({
      zoom: newZoom,
      x: (window.innerWidth - (bounds.maxX + bounds.minX) * newZoom) / 2,
      y: (window.innerHeight - (bounds.maxY + bounds.minY) * newZoom) / 2,
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className={clsx(
        'flex items-center gap-1',
        'bg-white/95 backdrop-blur-xl',
        'border border-gray-200/50',
        'shadow-lg shadow-gray-900/8',
        'transition-all duration-200',
      )}
      style={{ 
        borderRadius: LAYOUT.zoomControls.borderRadius,
        height: LAYOUT.zoomControls.height,
      }}
      >
        <ControlButton 
          icon={Minimize2} 
          onClick={handleZoomOut}
          title="Zoom Out"
        />
        <button
          className={clsx(
            'flex items-center justify-center',
            'h-full px-3',
            'text-xs font-medium',
            'text-gray-600',
            'hover:text-gray-900',
            'cursor-pointer',
            'border-x border-gray-100'
          )}
          onClick={handleZoomReset}
          title="Reset Zoom"
        >
          {Math.round(viewport.zoom * 100)}%
        </button>
        <ControlButton 
          icon={Maximize2} 
          onClick={handleZoomIn}
          title="Zoom In"
        />
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ControlButton 
          icon={Grid3X3} 
          onClick={handleFitToScreen}
          title="Fit to Screen"
        />
      </div>
    </div>
  )
}

function ControlButton({
  icon: Icon,
  onClick,
  title
}: {
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  title: string
}) {
  return (
    <button
      className={clsx(
        'flex items-center justify-center',
        'w-8 h-full',
        'text-gray-500 hover:text-gray-900',
        'transition-colors duration-150',
        'cursor-pointer hover:bg-gray-50',
        'rounded-md'
      )}
      onClick={onClick}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
