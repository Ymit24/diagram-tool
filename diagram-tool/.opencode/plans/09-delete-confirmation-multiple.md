# Delete Confirmation for Multiple Items

## Problem
No confirmation when deleting multiple shapes, making accidental bulk deletion possible without easy recovery (though undo exists).

## Solution
Add a non-blocking toast notification when deleting 2+ shapes with a quick "Undo" button for peace of mind.

## Files to Modify
- `src/store/diagramStore.ts`
- Create new component: `src/components/notifications/Toast.tsx`
- Update `src/App.tsx` to include toast container

## Implementation Steps

1. Create toast notification system:
   ```typescript
   // src/components/notifications/Toast.tsx
   interface ToastProps {
     message: string
     onUndo: () => void
     onClose: () => void
   }

   export function Toast({ message, onUndo, onClose }: ToastProps) {
     return (
       <div className="fixed bottom-24 right-6 z-50 animate-slide-up">
         <div className="flex items-center gap-3 px-4 py-3
                         bg-gray-900 text-white rounded-lg
                         shadow-lg">
           <span className="text-sm">{message}</span>
           <button
             onClick={onUndo}
             className="px-3 py-1 text-xs font-medium
                        bg-white text-gray-900 rounded
                        hover:bg-gray-100 transition-colors"
           >
             Undo
           </button>
           <button
             onClick={onClose}
             className="text-gray-400 hover:text-white transition-colors"
           >
             <X className="w-4 h-4" />
           </button>
         </div>
       </div>
     )
   }
   ```

2. Add toast state to store:
   ```typescript
   // In DiagramState interface
   toast: { message: string; show: boolean } | null

   // In actions
   showToast: (message: string) => void
   hideToast: () => void
   ```

3. Update deleteShapes to show toast for bulk deletion:
   ```typescript
   deleteShapes: (ids) => set((state) => {
     if (ids.length === 0) return state
     const shouldShowToast = ids.length > 1
     const entry = recordHistory(state, 'delete', 'Delete shapes')
     const newPast = [...state.past, entry].slice(-MAX_HISTORY)
     return {
       shapes: state.shapes.filter((s) => !ids.includes(s.id)),
       selection: { shapeIds: [], selectionType: 'none' },
       past: newPast,
       future: [],
       toast: shouldShowToast ? {
         message: `Deleted ${ids.length} shapes`,
         show: true
       } : null
     }
   })
   ```

4. Update App.tsx to render toast:
   ```typescript
   const { toast, undo, hideToast } = useDiagramStore()

   return (
     <div className="w-screen h-screen overflow-hidden bg-gray-50">
       {/* ... existing components ... */}
       {toast?.show && (
         <Toast
           message={toast.message}
           onUndo={undo}
           onClose={hideToast}
         />
       )}
     </div>
   )
   ```

## Testing
- Delete one shape: verify no toast appears
- Delete multiple shapes: verify toast appears with correct count
- Click "Undo" on toast: verify shapes are restored
- Click X on toast: verify toast disappears but undo still works
- Wait a few seconds: consider auto-dismiss (optional enhancement)

## Impact
Users have peace of mind when deleting multiple items, with a quick recovery option. This reduces anxiety about bulk operations.
