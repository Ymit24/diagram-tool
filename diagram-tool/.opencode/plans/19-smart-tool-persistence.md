# Smart Tool Persistence

## Problem
After creating a shape, the tool automatically switches to select mode. This is inefficient when creating many shapes of the same type.

## Solution
Keep drawing tool active for repeated shape creation. Add explicit "Select" tool button or use Escape to return to select.

## Files to Modify
- `src/components/canvas/Canvas.tsx`
- `src/constants/tools.ts`

## Implementation Steps

1. Add preference to store:
   ```typescript
   // In DiagramState interface
   persistTool: boolean
   togglePersistTool: () => void

   // In store state
   persistTool: false,

   // In actions
   togglePersistTool: () => set((state) => ({
     persistTool: !state.persistTool
   }))
   ```

2. Update finishDrawing to check persistence:
   ```typescript
   // In Canvas.tsx handleMouseUp
   const handleMouseUp = useCallback((e: React.MouseEvent) => {
     // ... existing code until shape creation ...

     if (newShape) {
       addShape(newShape)
       setSelection({ shapeIds: [newShape.id], selectionType: 'single' })
     }

     const { persistTool } = useDiagramStore.getState()

     finishDrawing()
     // Only switch to select if not persisting
     if (!persistTool) {
       setTool('select-click')
     }

     lassoPointsRef.current = []
     setLassoPointsForRender([])
   }, [currentTool, drawing, viewport, shapes, currentToolOptions, addShape, finishDrawing, setSelection])
   ```

3. Add visual indicator for persistent mode:
   ```typescript
   // In TopToolbar, add toggle button
   const { persistTool, togglePersistTool } = useDiagramStore()

   <ToolbarGroup>
     <IconButton
       icon={MousePointer2}
       label={persistTool ? "Tool Active (Click to Stop)" : "Click to Keep Tool Active"}
       onClick={togglePersistTool}
       active={persistTool}
     />
     {/* ... existing tools ... */}
   </ToolbarGroup>

   // Update IconButton to show active state
   className={clsx(
     // ... existing classes ...
     active && 'bg-blue-50 text-blue-600 border-blue-200'
   )}
   ```

4. Add escape key to return to select:
   ```typescript
   // In useHotkeys.ts
   const handleKeyDown = useCallback((e: KeyboardEvent) => {
     // ... existing logic ...

     if (e.key === 'Escape') {
       setSelection({ shapeIds: [], selectionType: 'none' })
       // Return to select mode if not already
       const { currentTool } = useDiagramStore.getState()
       if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
         setTool('select-click')
       }
       return
     }

     // ... rest of logic ...
   }, [...])
   ```

5. Add persistent mode indicator in ToolOptionsPanel:
   ```typescript
   // In ToolOptionsPanel when drawing tool is active
   <div className="flex items-center justify-between mb-4 p-2
                   bg-blue-50 rounded-md">
     <span className="text-xs text-blue-700">
       <CheckCircle className="w-3.5 h-3 inline mr-1" />
       Tool persisting - press Escape to stop
     </span>
     <button
       onClick={() => togglePersistTool()}
       className="text-xs text-blue-600 hover:text-blue-700"
     >
       Disable
     </button>
   </div>
   ```

## Testing
- Enable persistent mode: verify tool stays active after creating shape
- Create multiple shapes: verify all work without reselecting tool
- Press Escape: verify tool switches to select
- Toggle persistent mode: verify indicator changes
- Disable persistent mode: verify behavior returns to normal

## Impact
Users can quickly create multiple shapes of the same type without constant tool switching. This significantly speeds up workflow for diagrams with many similar elements.
