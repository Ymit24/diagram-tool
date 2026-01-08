# Tool Shortcuts Visibility

## Problem
Tool keyboard shortcuts only appear on hover, making them invisible most of the time and harder for users to learn.

## Solution
Always show shortcuts in small, subtle text below the active tool button. Make them visible but not intrusive.

## Files to Modify
- `src/components/toolbar/TopToolbar.tsx`

## Implementation Steps

1. Update ToolButton component to always show shortcut for active tool:
   ```typescript
   function ToolButton({
     icon: Icon,
     label,
     shortcut,
     active,
     onClick
   }: ToolButtonProps) {
     return (
       <button className={clsx('flex flex-col items-center justify-center', ...)}>
         <div className="relative">
           <Icon className="w-4.5 h-4.5" />
           {active && (
             <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-medium text-gray-500">
               {shortcut}
             </span>
           )}
         </div>
       </button>
     )
   }
   ```

2. Adjust toolbar height to accommodate shortcuts:
   - Increase from 48px to 52px
   - Update `LAYOUT.floatingToolbar.height` in `constants/layout.ts`

3. Keep hover functionality as backup for inactive tools:
   ```typescript
   // Keep existing hover shortcut for inactive tools
   className={clsx(
     'absolute -bottom-3 left-1/2 -translate-x-1/2',
     'text-[10px] font-medium',
     'opacity-0 transition-opacity duration-150',
     'hover:opacity-100'  // Show on hover for inactive
   )}
   ```

## Testing
- Verify shortcuts appear below active tool button
- Verify shortcuts appear on hover for inactive tools
- Verify toolbar spacing looks good with shortcuts
- Test all tool switching combinations

## Impact
Users will naturally learn keyboard shortcuts as they work, leading to more efficient workflows over time. The active shortcut being always visible serves as constant reinforcement.
