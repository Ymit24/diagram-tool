import type { Viewport } from '../types/diagram'

export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: Viewport,
  canvasRect: DOMRect
): { x: number; y: number } {
  const canvasX = (screenX - canvasRect.left - viewport.x) / viewport.zoom
  const canvasY = (screenY - canvasRect.top - viewport.y) / viewport.zoom
  return { x: canvasX, y: canvasY }
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  viewport: Viewport,
  canvasRect: DOMRect
): { x: number; y: number } {
  const screenX = canvasX * viewport.zoom + canvasRect.left + viewport.x
  const screenY = canvasY * viewport.zoom + canvasRect.top + viewport.y
  return { x: screenX, y: screenY }
}
