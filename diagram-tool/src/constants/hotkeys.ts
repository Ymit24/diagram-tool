import type { ToolType } from '../types/diagram'

export const HOTKEYS: Record<string, ToolType | string> = {
  'v': 'select-click',
  'b': 'select-box',
  'l': 'select-lasso',
  'r': 'rectangle',
  'c': 'circle',
  'o': 'line',
  'a': 'arrow',
  'delete': 'delete',
  'backspace': 'delete',
  'escape': 'deselect',
}

export const HOTKEY_LABELS: Record<string, string> = {
  'v': 'Select (Click)',
  'b': 'Select (Box)',
  'l': 'Select (Lasso)',
  'r': 'Rectangle',
  'c': 'Circle',
  'o': 'Line',
  'a': 'Arrow',
  'delete': 'Delete',
  'backspace': 'Delete',
  'escape': 'Deselect',
  '?': 'Show Help',
}

export const ALL_HOTKEYS = [
  { key: 'V', action: 'select-click', description: 'Click to select shapes' },
  { key: 'B', action: 'select-box', description: 'Draw a box to select shapes' },
  { key: 'L', action: 'select-lasso', description: 'Draw a lasso to select shapes' },
  { key: 'R', action: 'rectangle', description: 'Draw rectangles' },
  { key: 'C', action: 'circle', description: 'Draw circles' },
  { key: 'O', action: 'line', description: 'Draw lines' },
  { key: 'A', action: 'arrow', description: 'Draw arrows' },
  { key: 'Delete / Backspace', action: 'delete', description: 'Delete selected shapes' },
  { key: 'Escape', action: 'deselect', description: 'Deselect all shapes' },
  { key: 'Space + Drag', action: 'pan', description: 'Pan the canvas' },
  { key: 'Ctrl/Cmd + Wheel', action: 'zoom', description: 'Zoom in/out' },
  { key: '?', action: 'help', description: 'Show keyboard shortcuts' },
]
