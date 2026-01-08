# Tool Switching Visual Feedback

## Problem
Tools switch instantly with no animation, providing minimal feedback that the action occurred.

## Solution
Add a subtle scale/bounce animation when a tool becomes active, confirming the action and making the UI feel more responsive.

## Files to Modify
- `src/style.css` (add animation)
- `src/components/toolbar/TopToolbar.tsx` (apply animation)

## Implementation Steps

1. Add animation to CSS:
   ```css
   // In src/style.css
   @keyframes toolBounce {
     0% { transform: scale(1); }
     50% { transform: scale(0.95); }
     100% { transform: scale(1); }
   }

   @keyframes toolPulse {
     0% { transform: scale(1); }
     50% { transform: scale(1.05); }
     100% { transform: scale(1); }
   }

   .tool-bounce {
     animation: toolBounce 0.15s ease-out;
   }

   .tool-pulse {
     animation: toolPulse 0.2s ease-out;
   }
   ```

2. Update ToolButton to apply animation when becoming active:
   ```typescript
   function ToolButton({
     icon: Icon,
     label,
     shortcut,
     active,
     onClick
   }: ToolButtonProps) {
     const [animate, setAnimate] = useState(false)

     useEffect(() => {
       if (active) {
         setAnimate(true)
         const timer = setTimeout(() => setAnimate(false), 200)
         return () => clearTimeout(timer)
       }
     }, [active])

     return (
       <button
         className={clsx(
           'flex items-center justify-center',
           'w-9 h-9',
           'transition-all duration-200',
           'rounded-lg',
           active
             ? 'bg-gray-900 text-white shadow-md'
             : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
           'cursor-pointer',
           animate && 'tool-bounce'
         )}
         onClick={onClick}
         title={`${label} (${shortcut})`}
       >
         <Icon className="w-4.5 h-4.5" />
         {/* ... shortcut label ... */}
       </button>
     )
   }
   ```

3. Add animation to the pulse of active tool when switching:
   ```typescript
   // Alternative: Apply pulse animation when tool becomes active
   const wasActive = useRef(false)
   useEffect(() => {
     if (active && !wasActive.current) {
       setAnimate(true)
       setTimeout(() => setAnimate(false), 200)
     }
     wasActive.current = active
   }, [active])
   ```

## Testing
- Click various tools: verify subtle bounce animation
- Use keyboard shortcuts: verify animation plays
- Verify animation doesn't interfere with clicking
- Test rapid tool switching

## Impact
Tool switches feel more responsive and satisfying. The visual feedback confirms that the action was registered, improving perceived responsiveness.
