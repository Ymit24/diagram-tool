import type { ToolType } from '../types/diagram'

export const TOOL_INFO: Record<ToolType, { name: string; icon: string; hotkey: string }> = {
  'select-click': { name: 'Select (Click)', icon: 'cursor', hotkey: 'V' },
  'select-box': { name: 'Select (Box)', icon: 'selection', hotkey: 'B' },
  'select-lasso': { name: 'Select (Lasso)', icon: 'lasso', hotkey: 'L' },
  'rectangle': { name: 'Rectangle', icon: 'square', hotkey: 'R' },
  'line': { name: 'Line', icon: 'line', hotkey: 'O' },
  'arrow': { name: 'Arrow', icon: 'arrow', hotkey: 'A' },
}
