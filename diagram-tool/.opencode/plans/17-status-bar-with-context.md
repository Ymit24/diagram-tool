# Status Bar with Context

## Problem
No indication of current state (zoom level, shape count, selection info). Users have to look around to understand context.

## Solution
Add a small status bar showing: current tool, zoom level, shape count, selection info.

## Files to Modify
- `src/components/toolbar/StatusBar.tsx` (new component)
- `src/App.tsx`

## Implementation Steps

1. Create StatusBar component:
   ```typescript
   // src/components/toolbar/StatusBar.tsx
   import { useDiagramStore } from '../../store/diagramStore'
   import { TOOL_LABELS } from '../../constants/tools'

   export function StatusBar() {
     const {
       currentTool,
       viewport,
       shapes,
       selection,
       currentToolOptions
     } = useDiagramStore()

     const toolLabel = TOOL_LABELS[currentTool] || currentTool
     const selectionText = selection.shapeIds.length > 0
       ? `${selection.shapeIds.length} selected`
       : 'No selection'

     return (
       <div className="fixed bottom-6 left-6 z-40">
         <div className="flex items-center gap-4 px-4 py-2
                         bg-white/95 backdrop-blur-xl
                         border border-gray-200/50
                         rounded-lg
                         shadow-lg shadow-gray-900/8
                         text-xs text-gray-600">
           <div className="flex items-center gap-2">
             <span className="font-medium">Tool:</span>
             <span className="text-gray-900">{toolLabel}</span>
           </div>

           <div className="w-px h-3 bg-gray-200" />

           <div className="flex items-center gap-2">
             <span className="font-medium">Zoom:</span>
             <span className="text-gray-900">{Math.round(viewport.zoom * 100)}%</span>
           </div>

           <div className="w-px h-3 bg-gray-200" />

           <div className="flex items-center gap-2">
             <span className="font-medium">Shapes:</span>
             <span className="text-gray-900">{shapes.length}</span>
           </div>

           <div className="w-px h-3 bg-gray-200" />

           <div className="flex items-center gap-2">
             <span className="font-medium">Status:</span>
             <span className={clsx(
               selection.shapeIds.length > 0 ? 'text-blue-600' : 'text-gray-500'
             )}>
               {selectionText}
             </span>
           </div>
         </div>
       </div>
     )
   }
   ```

2. Add TOOL_LABELS constant:
   ```typescript
   // In src/constants/tools.ts (create if doesn't exist)
   import type { ToolType } from '../types/diagram'

   export const TOOL_LABELS: Record<ToolType, string> = {
     'select-click': 'Select',
     'select-box': 'Box Select',
     'select-lasso': 'Lasso Select',
     'pan': 'Pan',
     'rectangle': 'Rectangle',
     'circle': 'Circle',
     'line': 'Line',
     'arrow': 'Arrow',
   }
   ```

3. Add to App.tsx:
   ```typescript
   import { StatusBar } from './components/toolbar/StatusBar'

   export function App() {
     // ... existing code ...

     return (
       <div className="w-screen h-screen overflow-hidden bg-gray-50">
         <TopToolbar />
         <ToolOptionsPanel />
         <HotkeyHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
         <Canvas />
         <StatusBar />
       </div>
     )
   }
   ```

## Testing
- Switch tools: verify tool label updates
- Zoom: verify zoom percentage updates
- Add/remove shapes: verify shape count updates
- Select shapes: verify selection text updates
- Verify status bar is legible and not intrusive

## Impact
Users always know current context without looking around. This reduces cognitive load and helps with task orientation.
