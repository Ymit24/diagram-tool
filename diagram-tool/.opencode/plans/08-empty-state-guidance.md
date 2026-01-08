# Empty State Guidance

## Problem
The ToolOptionsPanel shows a generic "Select a drawing tool or shapes to edit" message when no selection is made, which isn't helpful for new users.

## Solution
Replace the empty state with actionable guidance: buttons to quickly start drawing or view keyboard shortcuts.

## Files to Modify
- `src/components/toolbar/ToolOptionsPanel.tsx`

## Implementation Steps

1. Replace empty state with actionable buttons:
   ```typescript
   {hasSelection ? (
     // ... existing selection UI ...
   ) : isDrawingTool ? (
     // ... existing tool options UI ...
   ) : (
     <div className="flex flex-col items-center justify-center py-8 text-center">
       <CircleDashed className="w-10 h-10 mb-3 text-gray-300" />
       <p className="text-sm text-gray-500 mb-4">Get started with a shape</p>
       <div className="space-y-2 w-full px-4">
         <button
           onClick={() => setTool('rectangle')}
           className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                      bg-gray-900 text-white rounded-lg
                      hover:bg-gray-800 transition-colors"
         >
           <Square className="w-4 h-4" />
           <span className="text-sm font-medium">Rectangle (R)</span>
         </button>
         <button
           onClick={() => setTool('circle')}
           className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                      bg-gray-100 text-gray-700 rounded-lg
                      hover:bg-gray-200 transition-colors"
         >
           <Circle className="w-4 h-4" />
           <span className="text-sm font-medium">Circle (C)</span>
         </button>
       </div>
       <button
         onClick={() => setShowHelp(true)}
         className="mt-4 text-xs text-blue-600 hover:text-blue-700 hover:underline"
       >
         View all keyboard shortcuts (?)
       </button>
     </div>
   )}
   ```

2. Add necessary imports:
   ```typescript
   import { Square, Circle } from 'lucide-react'
   // Also need setShowHelp from parent component
   ```

3. Update ToolOptionsPanel props to accept setShowHelp:
   ```typescript
   interface ToolOptionsPanelProps {
     onShowHelp?: () => void
   }

   export function ToolOptionsPanel({ onShowHelp }: ToolOptionsPanelProps) {
     // ...
   }
   ```

4. Update App.tsx to pass callback:
   ```typescript
   <ToolOptionsPanel onShowHelp={() => setShowHelp(true)} />
   ```

## Testing
- Verify empty state shows helpful buttons
- Verify clicking "Rectangle" switches tool and updates panel
- Verify clicking "Circle" switches tool and updates panel
- Verify "View all keyboard shortcuts" opens help modal
- Test panel state when switching between empty, drawing tool, and selection states

## Impact
New users have clear next steps instead of a generic message. This reduces onboarding friction and helps users discover the core functionality quickly.
