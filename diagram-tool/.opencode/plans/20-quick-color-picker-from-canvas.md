# Quick Color Picker from Canvas

## Problem
Users must navigate to ToolOptionsPanel to change colors, breaking flow when working on canvas.

## Solution
Add color swatch to selected shapes that opens a mini color picker when clicked.

## Files to Modify
- `src/components/canvas/Canvas.tsx`
- `src/components/toolbar/QuickColorPicker.tsx` (new component)

## Implementation Steps

1. Create QuickColorPicker component:
   ```typescript
   // src/components/toolbar/QuickColorPicker.tsx
   import { useState, useRef, useEffect } from 'react'
   import { DEFAULT_STROKE_COLORS, DEFAULT_FILL_COLORS } from '../../constants/colors'
   import { useDiagramStore } from '../../store/diagramStore'
   import { clsx } from 'clsx'

   interface QuickColorPickerProps {
     x: number
     y: number
     isOpen: boolean
     onClose: () => void
     shapeId: string
   }

   export function QuickColorPicker({ x, y, isOpen, onClose, shapeId }: QuickColorPickerProps) {
     const { updateSelectedShapes } = useDiagramStore()
     const [activeTab, setActiveTab] = useState<'stroke' | 'fill'>('stroke')
     const pickerRef = useRef<HTMLDivElement>(null)

     useEffect(() => {
       const handleClickOutside = (e: MouseEvent) => {
         if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
           onClose()
         }
       }
       document.addEventListener('mousedown', handleClickOutside)
       return () => document.removeEventListener('mousedown', handleClickOutside)
     }, [onClose])

     if (!isOpen) return null

     const colors = activeTab === 'stroke' ? DEFAULT_STROKE_COLORS : DEFAULT_FILL_COLORS
     const updateProperty = activeTab === 'stroke' ? 'stroke' : 'fill'

     return (
       <div
         ref={pickerRef}
         className="fixed z-50 animate-scale-in"
         style={{ left: x + 10, top: y + 10 }}
       >
         <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-2">
           {/* Tabs */}
           <div className="flex gap-1 mb-2">
             <button
               onClick={() => setActiveTab('stroke')}
               className={clsx(
                 'px-3 py-1 text-xs rounded-md transition-colors',
                 activeTab === 'stroke'
                   ? 'bg-gray-900 text-white'
                   : 'text-gray-600 hover:bg-gray-100'
               )}
             >
               Stroke
             </button>
             <button
               onClick={() => setActiveTab('fill')}
               className={clsx(
                 'px-3 py-1 text-xs rounded-md transition-colors',
                 activeTab === 'fill'
                   ? 'bg-gray-900 text-white'
                   : 'text-gray-600 hover:bg-gray-100'
               )}
             >
               Fill
             </button>
           </div>

           {/* Color grid */}
           <div className="grid grid-cols-6 gap-1">
             {colors.map((color) => (
               <button
                 key={color.value}
                 className="w-6 h-6 rounded border border-gray-200 hover:border-gray-400"
                 style={{ backgroundColor: color.value }}
                 onClick={() => {
                   updateSelectedShapes({ [updateProperty]: color.value })
                   onClose()
                 }}
                 title={color.name}
               />
             ))}
           </div>
         </div>
       </div>
     )
   }
   ```

2. Add color swatch to selected shapes:
   ```typescript
   // In Canvas.tsx
   const [colorPicker, setColorPicker] = useState<{
     x: number
     y: number
     shapeId: string
   } | null>(null)

   // Add color swatch indicator on selected shape
   const renderColorSwatch = (shape: DiagramShape) => {
     if (!selection.shapeIds.includes(shape.id)) return null

     return (
       <g
         className="cursor-pointer"
         onClick={(e) => {
           e.stopPropagation()
           const rect = canvasRef.current?.getBoundingClientRect()
           if (rect) {
             setColorPicker({
               x: e.clientX - rect.left,
               y: e.clientY - rect.top,
               shapeId: shape.id
             })
           }
         }}
       >
         <rect
           x={shape.x - 8}
           y={shape.y - 24}
           width={16}
           height={16}
           fill={shape.style.stroke}
           stroke="white"
           strokeWidth={2}
           className="hover:scale-110 transition-transform"
         />
       </g>
     )
   }
   ```

3. Render color swatches for selected shapes:
   ```typescript
   // In main render
   {shapes.map((shape) => (
     <g key={shape.id}>
       <SelectedShapeRenderer
         shape={shape}
         selected={selection.shapeIds.includes(shape.id)}
         onClick={(e) => handleShapeClick(e, shape.id)}
         onResizeStart={handleResizeMouseDown}
       />
       {renderColorSwatch(shape)}
     </g>
   ))}
   ```

4. Render color picker:
   ```typescript
   {colorPicker && (
     <QuickColorPicker
       x={colorPicker.x}
       y={colorPicker.y}
       isOpen={true}
       onClose={() => setColorPicker(null)}
       shapeId={colorPicker.shapeId}
     />
   )}
   ```

## Testing
- Select shape: verify color swatch appears above shape
- Click color swatch: verify mini picker opens
- Select color: verify shape color updates and picker closes
- Click outside picker: verify picker closes
- Test with multiple selected shapes: verify all update

## Impact
Users can change colors without leaving the canvas, maintaining flow and reducing panel navigation. Quick color changes become effortless.
