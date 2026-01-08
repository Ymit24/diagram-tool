# Keyboard Shortcut Improvements

## Problem
Alignment shortcuts are complex (Ctrl+Alt+L/C/R/T/M/B) and not discoverable in the UI. Users rarely find these powerful features.

## Solution
- Show alignment shortcuts in ToolOptionsPanel when shapes are selected
- Add easier keyboard alternatives (number keys for alignment)
- Make shortcuts visible and discoverable

## Files to Modify
- `src/components/toolbar/ToolOptionsPanel.tsx`
- `src/constants/hotkeys.ts`
- `src/hooks/useHotkeys.ts`

## Implementation Steps

1. Update AlignmentSection to show shortcuts:
   ```typescript
   function AlignmentSection({
     canAlign,
     canDistribute,
     onAlign,
     onDistribute
   }: AlignmentSectionProps) {
     const shortcuts = {
       left: '1',
       top: '2',
       right: '3',
       bottom: '4',
       center: '5',
       middle: '6',
     }

     return (
       <div>
         {/* ... header ... */}
         <div className="space-y-2">
           <div className="flex gap-1">
             <AlignmentButton
               onClick={() => onAlign('left')}
               disabled={!canAlign}
               title={`Align Left (${shortcuts.left})`}
               shortcut={shortcuts.left}
             >
               <AlignStartHorizontal className="w-4 h-4" />
               {/* Add shortcut label */}
               <span className="absolute bottom-0.5 right-0.5
                              text-[8px] text-gray-400 font-mono">
                 {shortcuts.left}
               </span>
             </AlignmentButton>
             {/* ... other buttons ... */}
           </div>
         </div>
       </div>
     )
   }
   ```

2. Update AlignmentButton to show shortcut:
   ```typescript
   function AlignmentButton({
     onClick,
     disabled,
     children,
     title,
     shortcut
   }: AlignmentButtonProps) {
     return (
       <button
         className={clsx(
           'flex items-center justify-center',
           'w-8 h-8',
           'transition-all duration-150',
           'rounded-md border relative',
           disabled
             ? 'opacity-30 cursor-not-allowed'
             : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer border-gray-200'
         )}
         onClick={onClick}
         disabled={disabled}
         title={title}
       >
         {children}
         {shortcut && (
           <span className="absolute bottom-0.5 right-0.5
                          text-[8px] text-gray-400 font-mono">
             {shortcut}
           </span>
         )}
       </button>
     )
   }
   ```

3. Add number key shortcuts in useHotkeys:
   ```typescript
   const handleKeyDown = useCallback((e: KeyboardEvent) => {
     // ... existing logic ...

     // Number key shortcuts for alignment
     if (selection.shapeIds.length >= 2 && !e.ctrlKey && !e.metaKey) {
       switch (e.key) {
         case '1':
           alignShapes('left')
           return
         case '2':
           alignShapes('top')
           return
         case '3':
           alignShapes('right')
           return
         case '4':
           alignShapes('bottom')
           return
         case '5':
           alignShapes('center')
           return
         case '6':
           alignShapes('middle')
           return
       }
     }

     // ... rest of logic ...
   }, [alignShapes, selection.shapeIds])
   ```

4. Update hotkeys documentation:
   ```typescript
   // In src/constants/hotkeys.ts
   export const ALL_HOTKEYS = [
     // ... existing ...
     { key: '1', action: 'align-left', description: 'Align left' },
     { key: '2', action: 'align-top', description: 'Align top' },
     { key: '3', action: 'align-right', description: 'Align right' },
     { key: '4', action: 'align-bottom', description: 'Align bottom' },
     { key: '5', action: 'align-center', description: 'Align center' },
     { key: '6', action: 'align-middle', description: 'Align middle' },
     // ... keep old complex shortcuts as alternatives ...
     { key: 'Ctrl+Alt+L', action: 'align-left', description: 'Align left (alternative)' },
     // ...
   ]
   ```

## Testing
- Select 2+ shapes: verify shortcuts appear on alignment buttons
- Press number keys: verify alignment works
- Verify shortcuts only work when 2+ shapes are selected
- Test that existing Ctrl+Alt shortcuts still work

## Impact
Alignment features become discoverable and accessible. Users can quickly align shapes with single keypresses.
