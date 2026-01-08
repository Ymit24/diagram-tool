import { useCallback, useEffect, useRef } from 'react'
import type { Viewport } from '../types/diagram'

interface UsePanZoomOptions {
  viewport: Viewport
  setViewport: (viewport: Partial<Viewport>) => void
  canvasRef: React.RefObject<SVGSVGElement | null>
  isPanning: boolean
  setIsPanning: (panning: boolean) => void
}

interface Point {
  x: number
  y: number
}

export function usePanZoom({
  viewport,
  setViewport,
  canvasRef,
  isPanning,
  setIsPanning,
}: UsePanZoomOptions) {
  const panStartRef = useRef<Point | null>(null)
  const panStartViewportRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        e.preventDefault()
        setIsPanning(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        setIsPanning(false)
        panStartRef.current = null
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPanning, setIsPanning])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const isTrackpadPinch = Math.abs(e.deltaX) < 10 && Math.abs(e.deltaY) > 0 && !e.shiftKey && !e.altKey
    
    if (e.ctrlKey || e.metaKey || isTrackpadPinch) {
      e.preventDefault()
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.25), 4)

      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const zoomRatio = newZoom / viewport.zoom
        setViewport({
          zoom: newZoom,
          x: mouseX - (mouseX - viewport.x) * zoomRatio,
          y: mouseY - (mouseY - viewport.y) * zoomRatio,
        })
      } else {
        setViewport({ zoom: newZoom })
      }
    } else {
      setViewport({
        x: viewport.x - e.deltaX,
        y: viewport.y - e.deltaY
      })
    }
  }, [viewport, setViewport, canvasRef])

  const handlePanStart = useCallback((clientX: number, clientY: number) => {
    panStartRef.current = { x: clientX, y: clientY }
    panStartViewportRef.current = { x: viewport.x, y: viewport.y }
  }, [viewport])

  const handlePanMove = useCallback((clientX: number, clientY: number) => {
    if (!panStartRef.current) return

    const dx = clientX - panStartRef.current.x
    const dy = clientY - panStartRef.current.y

    setViewport({
      x: panStartViewportRef.current.x + dx,
      y: panStartViewportRef.current.y + dy,
    })
  }, [setViewport])

  const handlePanEnd = useCallback(() => {
    panStartRef.current = null
  }, [])

  return {
    handleWheel,
    handlePanStart,
    handlePanMove,
    handlePanEnd,
    isPanning,
  }
}
