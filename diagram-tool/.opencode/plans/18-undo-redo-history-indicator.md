# Undo/Redo History Indicator

## Problem
No visual feedback about available undo/redo steps. Users don't know if they can undo/redo.

## Solution
Add small badges showing number of available undo/redo steps.

## Files to Modify
- `src/components/toolbar/TopToolbar.tsx`

## Implementation Steps

1. Update undo/redo buttons to show count:
   ```typescript
   // In TopToolbar component
   function IconButton({
     icon: Icon,
     label,
     onClick,
     disabled = false,
     danger = false,
     size = 'normal',
     badge
   }: IconButtonProps) {
     return (
       <button
         className={clsx(
           'flex items-center justify-center',
           'transition-all duration-200',
           'rounded-lg relative',
           size === 'small' ? 'w-7 h-7' : 'w-8 h-8',
           disabled
             ? 'opacity-40 cursor-not-allowed'
             : clsx(
                 danger
                   ? 'text-red-500 hover:bg-red-50'
                   : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                 'cursor-pointer'
               )
         )}
         onClick={onClick}
         disabled={disabled}
         title={label}
       >
         <Icon className={size === 'small' ? 'w-4 h-4' : 'w-4.5 h-4.5'} />
         {badge !== undefined && badge > 0 && (
           <span className="absolute -top-1 -right-1
                          min-w-[14px] h-4 px-1
                          flex items-center justify-center
                          text-[9px] font-bold
                          bg-blue-500 text-white
                          rounded-full">
             {badge > 9 ? '9+' : badge}
           </span>
         )}
       </button>
     )
   }
   ```

2. Update undo/redo buttons to pass badge count:
   ```typescript
   <ToolbarGroup>
     <IconButton
       icon={Undo2}
       label="Undo"
       onClick={handleUndo}
       disabled={past.length === 0}
       badge={past.length}
     />
     <IconButton
       icon={Redo2}
       label="Redo"
       onClick={handleRedo}
       disabled={future.length === 0}
       badge={future.length}
     />
   </ToolbarGroup>
   ```

3. Add badge count to tooltip:
   ```typescript
   // Update title attribute to include count
   title={`Undo (${past.length} steps)`}
   title={`Redo (${future.length} steps)`}
   ```

## Testing
- Perform actions: verify undo badge count increases
- Undo actions: verify undo badge count decreases, redo badge appears
- Verify badge disappears when count is 0
- Verify badge shows "9+" when count exceeds 9
- Verify disabled buttons still show correct badges

## Impact
Users know at a glance how many undo/redo steps are available, building confidence about reversible actions.
