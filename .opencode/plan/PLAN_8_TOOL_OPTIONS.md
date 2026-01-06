# Phase 8: Tool Options Panel

## Goal
Implement context-sensitive floating tool options panel for styling shapes.

## Steps

### 8.1 Color Palette Component
Create `src/components/toolbar/ColorPalette.tsx`:

```typescript
import { DEFAULT_STROKE_COLORS, DEFAULT_FILL_COLORS } from '../../constants/colors'

interface ColorPaletteProps {
  colors: typeof DEFAULT_STROKE_COLORS
  selectedColor: string
  onSelect: (color: string) => void
  label: string
}

export function ColorPalette({ colors, selectedColor, onSelect, label }: ColorPaletteProps) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1">
        {colors.map((color) => (
          <button
            key={color.value}
            className={`w-6 h-6 rounded border-2 ${
              selectedColor === color.value ? 'border-blue-500' : 'border-gray-200'
            }`}
            style={{ backgroundColor: color.value }}
            onClick={() => onSelect(color.value)}
            title={color.name}
          />
        ))}
      </div>
    </div>
  )
}
```

### 8.2 Stroke Width Selector
Create `src/components/toolbar/StrokeWidth.tsx`:

```typescript
import { DEFAULT_STROKE_WIDTHS } from '../../constants/colors'

interface StrokeWidthProps {
  width: number
  onChange: (width: number) => void
}

export function StrokeWidth({ width, onChange }: StrokeWidthProps) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">Stroke Width</label>
      <div className="flex flex-wrap gap-1">
        {DEFAULT_STROKE_WIDTHS.map((w) => (
          <button
            key={w}
            className={`w-8 h-8 rounded border flex items-center justify-center ${
              width === w ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => onChange(w)}
          >
            <div
              className="bg-gray-800 rounded-full"
              style={{ width: w * 2, height: w * 2 }}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
```

### 8.3 Tool Options Panel Component
Create `src/components/toolbar/ToolOptionsPanel.tsx`:

```typescript
import { useDiagramStore } from '../../store/diagramStore'
import { ColorPalette } from './ColorPalette'
import { StrokeWidth } from './StrokeWidth'

export function ToolOptionsPanel() {
  const { 
    currentTool, 
    currentToolOptions, 
    selection,
    updateToolOptions 
  } = useDiagramStore()

  const showPanel = currentTool.startsWith('select') && selection.shapeIds.length > 0

  if (!showPanel) {
    return (
      <div className="fixed left-4 top-20 p-4 bg-white rounded-lg shadow-lg">
        <p className="text-sm text-gray-500">
          Select a tool and create shapes, or select shapes to edit.
        </p>
      </div>
    )
  }

  const handleStrokeChange = (stroke: string) => {
    updateToolOptions({ stroke })
  }

  const handleFillChange = (fill: string) => {
    updateToolOptions({ fill: fill === 'transparent' ? null : fill })
  }

  const handleStrokeWidthChange = (strokeWidth: number) => {
    updateToolOptions({ strokeWidth })
  }

  return (
    <div className="fixed left-4 top-20 p-4 bg-white rounded-lg shadow-lg w-48">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Shape Options</h3>
      
      <ColorPalette
        colors={DEFAULT_STROKE_COLORS}
        selectedColor={currentToolOptions.stroke}
        onSelect={handleStrokeChange}
        label="Stroke Color"
      />
      
      <ColorPalette
        colors={DEFAULT_FILL_COLORS}
        selectedColor={currentToolOptions.fill || 'transparent'}
        onSelect={handleFillChange}
        label="Fill Color"
      />
      
      <StrokeWidth
        width={currentToolOptions.strokeWidth}
        onChange={handleStrokeWidthChange}
      />
      
      {/* Apply to selected shapes button */}
      <button
        className="w-full mt-2 py-1 px-3 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        onClick={() => {
          // Apply current options to all selected shapes
        }}
      >
        Apply to Selected
      </button>
    </div>
  )
}
```

### 8.4 Apply Options to Shapes
Add action to store:

```typescript
applyStyleToSelection: (style: Partial<ShapeStyle>) => set((state) => ({
  shapes: state.shapes.map(s => 
    state.selection.shapeIds.includes(s.id)
      ? { ...s, style: { ...s.style, ...style } }
      : s
  )
})),
```

### 8.5 Context Sensitivity
- Show panel when shapes are selected
- Hide or show different options based on selected shape types
- For lines/arrows, hide fill options

## Deliverable
- Floating tool options panel appears when shapes are selected
- Stroke color picker with preset palette
- Fill color picker with preset palette
- Stroke width selector
- Apply button to update selected shapes

## Time Estimate
~30-35 minutes

## Dependencies
- Phase 7 complete

## Next Phase Preview
Phase 9 will add keyboard hotkeys for power users.
