import type { DiagramShape } from '../types/diagram'

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'start' | 'end'

export interface ResizeUpdate {
  x?: number
  y?: number
  width?: number
  height?: number
  x2?: number
  y2?: number
}

export interface ResizeResult {
  updates: ResizeUpdate
  constrained: Partial<DiagramShape>
}

const MIN_SIZE = 10

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export function calculateResizeUpdate(
  shape: DiagramShape,
  handle: ResizeHandle,
  currentX: number,
  currentY: number
): ResizeResult {
  const startX = shape.x
  const startY = shape.y
  const startW = shape.width
  const startH = shape.height

  const updates: ResizeUpdate = {}
  let constrained: Partial<DiagramShape> = {}

  if (shape.type === 'line' || shape.type === 'arrow') {
    if (handle === 'start') {
      updates.x = currentX
      updates.y = currentY
    } else {
      updates.x2 = currentX - startX
      updates.y2 = currentY - startY
    }
    constrained = { x: updates.x, y: updates.y, x2: updates.x2, y2: updates.y2 }
  } else {
    switch (handle) {
      case 'nw':
        updates.x = currentX
        updates.y = currentY
        updates.width = startX + startW - currentX
        updates.height = startY + startH - currentY
        break
      case 'n':
        updates.y = currentY
        updates.height = startY + startH - currentY
        break
      case 'ne':
        updates.y = currentY
        updates.width = currentX - startX
        updates.height = startY + startH - currentY
        break
      case 'e':
        updates.width = currentX - startX
        break
      case 'se':
        updates.width = currentX - startX
        updates.height = currentY - startY
        break
      case 's':
        updates.height = currentY - startY
        break
      case 'sw':
        updates.x = currentX
        updates.width = startX + startW - currentX
        updates.height = currentY - startY
        break
      case 'w':
        updates.x = currentX
        updates.width = startX + startW - currentX
        break
    }

    constrained = {
      x: isValidNumber(updates.x) && updates.x >= 0 ? updates.x : undefined,
      y: isValidNumber(updates.y) && updates.y >= 0 ? updates.y : undefined,
      width: isValidNumber(updates.width) && updates.width >= MIN_SIZE ? updates.width : undefined,
      height: isValidNumber(updates.height) && updates.height >= MIN_SIZE ? updates.height : undefined,
    }
  }

  return { updates, constrained }
}

export function applyResizeUpdate<T extends DiagramShape>(
  shape: T,
  constrained: Partial<DiagramShape>
): T {
  return {
    ...shape,
    ...constrained,
  } as T
}

export function getCursorForHandle(handle: ResizeHandle): string {
  const cursorMap: Record<ResizeHandle, string> = {
    nw: 'nw-resize',
    n: 'n-resize',
    ne: 'ne-resize',
    e: 'e-resize',
    se: 'se-resize',
    s: 's-resize',
    sw: 'sw-resize',
    w: 'w-resize',
    start: 'nwse-resize',
    end: 'nwse-resize',
  }
  return cursorMap[handle] || 'default'
}
