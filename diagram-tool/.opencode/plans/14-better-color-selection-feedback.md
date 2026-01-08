# Better Color Selection Feedback

## Problem
Selected color in color swatch grid has minimal visual distinction (just a border), making it hard to quickly identify which color is active.

## Solution
Add checkmark or prominent border glow for selected color, making the selection immediately obvious.

## Files to Modify
- `src/components/toolbar/ToolOptionsPanel.tsx`

## Implementation Steps

1. Update ColorSection to show checkmark on selected color:
   ```typescript
   function ColorSection({
     title,
     colors,
     selected,
     mixed = false,
     onSelect
   }: ColorSectionProps) {
     return (
       <div>
         {/* ... header ... */}
         <div className="grid grid-cols-6 gap-1.5">
           {colors.map((color) => (
             <button
               key={color.value}
               className={clsx(
                 'flex items-center justify-center',
                 'w-full aspect-square',
                 'transition-all duration-150',
                 'rounded-md border',
                 (selected === color.value || (selected === null && !mixed))
                   ? 'border-gray-900 ring-2 ring-blue-500 ring-offset-1'
                   : 'border-gray-200 hover:border-gray-300',
                 'cursor-pointer',
                 'relative'
               )}
               style={{ backgroundColor: color.value }}
               onClick={() => onSelect(color.value)}
               title={color.name}
             >
               {/* Add checkmark for selected color */}
               {(selected === color.value || (selected === null && !mixed)) && (
                 <svg
                   className="w-3 h-3 text-white drop-shadow-sm"
                   viewBox="0 0 24 24"
                   fill="none"
                   stroke="currentColor"
                   strokeWidth={3}
                   strokeLinecap="round"
                   strokeLinejoin="round"
                 >
                   <polyline points="20 6 9 17 4 12" />
                 </svg>
               )}
               {/* Keep transparent indicator */}
               {color.value === 'transparent' && !selected && (
                 <div className="w-3 h-0.5 bg-gray-300" />
               )}
             </button>
           ))}
         </div>
       </div>
     )
   }
   ```

2. Update stroke width and arrow style sections similarly for consistency:
   ```typescript
   // In StrokeWidthSection and ArrowHeadStyleSection
   // Add visual indicator similar to color section
   ```

3. Consider adding color preview cursor:
   ```typescript
   // Optional: Show color on cursor when hovering over color swatches
   const [previewColor, setPreviewColor] = useState<string | null>(null)

   <button
     onMouseEnter={() => setPreviewColor(color.value)}
     onMouseLeave={() => setPreviewColor(null)}
     // ... rest of button props ...
   >
   ```

## Testing
- Click various color swatches: verify checkmark appears
- Verify checkmark is visible on both light and dark colors
- Verify selection ring provides good contrast
- Test with transparent color: verify no checkmark but selection ring is visible
- Hover over colors: verify hover state is obvious

## Impact
Users can instantly see which color is selected, reducing errors when changing colors. The checkmark provides clear visual feedback.
