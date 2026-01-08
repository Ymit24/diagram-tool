# Stage 10: Tool Options Panel Integration

## Overview
Connect the tool options panel to shape properties. Users should be able to change fill color, stroke color, and stroke width for shapes, and update selected shapes.

## Objectives
- Create shape properties context
- Connect tool options panel to shape creation properties
- Update shape properties when options change
- Apply property changes to selected shapes
- Show current properties for selected shapes

## Steps

### 1. Create Shape Properties Context
Create `src/contexts/ShapePropertiesContext.tsx`:
```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { COLOR_PALETTE, STROKE_WIDTHS } from '@/utils/colorPalette';

interface ShapeProperties {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

interface ShapePropertiesContextType {
  properties: ShapeProperties;
  setFillColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setProperties: (props: Partial<ShapeProperties>) => void;
  resetProperties: () => void;
}

const defaultProperties: ShapeProperties = {
  fillColor: '#3B82F6',
  strokeColor: '#000000',
  strokeWidth: 2,
};

const ShapePropertiesContext = createContext<ShapePropertiesContextType | undefined>(undefined);

export function ShapePropertiesProvider({ children }: { children: ReactNode }) {
  const [properties, setPropertiesState] = useState<ShapeProperties>(defaultProperties);

  const setFillColor = useCallback((color: string) => {
    setPropertiesState((prev) => ({ ...prev, fillColor: color }));
  }, []);

  const setStrokeColor = useCallback((color: string) => {
    setPropertiesState((prev) => ({ ...prev, strokeColor: color }));
  }, []);

  const setStrokeWidth = useCallback((width: number) => {
    setPropertiesState((prev) => ({ ...prev, strokeWidth: width }));
  }, []);

  const setProperties = useCallback((props: Partial<ShapeProperties>) => {
    setPropertiesState((prev) => ({ ...prev, ...props }));
  }, []);

  const resetProperties = useCallback(() => {
    setPropertiesState(defaultProperties);
  }, []);

  return (
    <ShapePropertiesContext.Provider
      value={{
        properties,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        setProperties,
        resetProperties,
      }}
    >
      {children}
    </ShapePropertiesContext.Provider>
  );
}

export function useShapeProperties() {
  const context = useContext(ShapePropertiesContext);
  if (!context) {
    throw new Error('useShapeProperties must be used within ShapePropertiesProvider');
  }
  return context;
}
```

### 2. Update ToolOptionsPanel with Functionality
Update `src/components/tools/ToolOptionsPanel.tsx`:
```tsx
import { useTool } from '@/contexts/ToolContext';
import { useShapeProperties } from '@/contexts/ShapePropertiesContext';
import { COLOR_PALETTE, STROKE_WIDTHS } from '@/utils/colorPalette';

export default function ToolOptionsPanel() {
  const { activeTool } = useTool();
  const {
    properties,
    setFillColor,
    setStrokeColor,
    setStrokeWidth,
  } = useShapeProperties();

  const showPanel = activeTool !== 'select' && activeTool !== 'box-select' &&
                   activeTool !== 'lasso-select' && activeTool !== 'pan';

  if (!showPanel) return null;

  return (
    <div className="fixed top-24 left-4 w-64 bg-white rounded-xl shadow-2xl p-4 border border-gray-200 z-40">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Options
      </h3>

      {/* Fill Color */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Fill Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => setFillColor(color)}
              className={`
                w-8 h-8 rounded-lg border-2 transition-all
                ${properties.fillColor === color
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-200 hover:border-gray-400'
                }
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Stroke Color */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Stroke Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => setStrokeColor(color)}
              className={`
                w-8 h-8 rounded-lg border-2 transition-all
                ${properties.strokeColor === color
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-200 hover:border-gray-400'
                }
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Stroke Width: {properties.strokeWidth}px
        </label>
        <div className="flex gap-1 flex-wrap">
          {STROKE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => setStrokeWidth(width)}
              className={`
                px-2 py-1 text-xs rounded border transition-colors
                ${properties.strokeWidth === width
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              {width}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 3. Update InfiniteCanvas to Use Properties for New Shapes
Update `src/components/canvas/InfiniteCanvas.tsx`:

Import properties context:
```tsx
import { useShapeProperties } from '@/contexts/ShapePropertiesContext';
```

Get properties:
```tsx
const { properties } = useShapeProperties();
```

Update shape creation in handleMouseUp:
```tsx
newShape = {
  id: shapeId,
  type: 'rectangle',
  x,
  y,
  width,
  height,
  fill: properties.fillColor,
  stroke: properties.strokeColor,
  strokeWidth: properties.strokeWidth,
};
```

Do the same for circle, line, and arrow shapes.

### 4. Create Selection Properties Panel
Create `src/components/tools/SelectionPropertiesPanel.tsx`:
```tsx
import { useSelection } from '@/contexts/SelectionContext';
import { useShapeProperties } from '@/contexts/ShapePropertiesContext';
import { useShapes } from '@/contexts/ShapesContext';
import { useTool } from '@/contexts/ToolContext';
import { COLOR_PALETTE, STROKE_WIDTHS } from '@/utils/colorPalette';

export default function SelectionPropertiesPanel() {
  const { activeTool } = useTool();
  const { selectedIds, isSelected } = useSelection();
  const { properties, setFillColor, setStrokeColor, setStrokeWidth } = useShapeProperties();
  const { shapes, updateShape } = useShapes();

  // Show panel when in select mode and shapes are selected
  const showPanel = activeTool === 'select' && selectedIds.length > 0;

  if (!showPanel) return null;

  // Get common properties of selected shapes
  const selectedShapes = shapes.filter((shape) => isSelected(shape.id));

  const handleFillColorChange = (color: string) => {
    selectedShapes.forEach((shape) => {
      updateShape(shape.id, { fill: color });
    });
    setFillColor(color);
  };

  const handleStrokeColorChange = (color: string) => {
    selectedShapes.forEach((shape) => {
      updateShape(shape.id, { stroke: color });
    });
    setStrokeColor(color);
  };

  const handleStrokeWidthChange = (width: number) => {
    selectedShapes.forEach((shape) => {
      updateShape(shape.id, { strokeWidth: width });
    });
    setStrokeWidth(width);
  };

  return (
    <div className="fixed top-24 left-4 w-64 bg-white rounded-xl shadow-2xl p-4 border border-gray-200 z-40">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        Selection ({selectedShapes.length})
      </h3>

      {/* Fill Color */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Fill Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => handleFillColorChange(color)}
              className={`
                w-8 h-8 rounded-lg border-2 transition-all
                ${properties.fillColor === color
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-200 hover:border-gray-400'
                }
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Stroke Color */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Stroke Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              onClick={() => handleStrokeColorChange(color)}
              className={`
                w-8 h-8 rounded-lg border-2 transition-all
                ${properties.strokeColor === color
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-200 hover:border-gray-400'
                }
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Stroke Width: {properties.strokeWidth}px
        </label>
        <div className="flex gap-1 flex-wrap">
          {STROKE_WIDTHS.map((width) => (
            <button
              key={width}
              onClick={() => handleStrokeWidthChange(width)}
              className={`
                px-2 py-1 text-xs rounded border transition-colors
                ${properties.strokeWidth === width
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                }
              `}
            >
              {width}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 5. Update App to Include Selection Properties Panel and ShapePropertiesProvider
Update `src/App.tsx`:
```tsx
import { ToolProvider } from '@/contexts/ToolContext';
import { CanvasProvider } from '@/contexts/CanvasContext';
import { ShapesProvider } from '@/contexts/ShapesContext';
import { DrawingProvider } from '@/contexts/DrawingContext';
import { SelectionProvider } from '@/contexts/SelectionContext';
import { ShapePropertiesProvider } from '@/contexts/ShapePropertiesContext';
import ToolBar from '@/components/tools/ToolBar';
import ToolOptionsPanel from '@/components/tools/ToolOptionsPanel';
import SelectionPropertiesPanel from '@/components/tools/SelectionPropertiesPanel';
import CanvasContainer from '@/components/canvas/CanvasContainer';

export default function App() {
  return (
    <ToolProvider>
      <CanvasProvider>
        <DrawingProvider>
          <ShapesProvider>
            <SelectionProvider>
              <ShapePropertiesProvider>
                <div className="relative h-screen w-screen overflow-hidden bg-gray-100">
                  <ToolBar />
                  <ToolOptionsPanel />
                  <SelectionPropertiesPanel />
                  <CanvasContainer />
                </div>
              </ShapePropertiesProvider>
            </SelectionProvider>
          </ShapesProvider>
        </DrawingProvider>
      </CanvasProvider>
    </ToolProvider>
  );
}
```

## Success Criteria
- [ ] ShapePropertiesContext created
- [ ] Tool options panel shows current properties
- [ ] Clicking color updates current properties
- [ ] New shapes use current properties
- [ ] Selection properties panel appears when shapes selected
- [ ] Changing properties updates selected shapes
- [ ] Visual feedback for active color/width options

## Notes
- Properties panel is context-aware (shows different panel based on tool/selection)
- Selection properties update all selected shapes at once
- Active color/width shows ring highlight
- Properties persist between shape creations
