# Stage 2: Dependencies and Core Infrastructure

## Overview
Install necessary dependencies for canvas rendering and set up the project folder structure with proper TypeScript types.

## Objectives
- Install react-konva and konva for canvas rendering
- Create folder structure
- Set up path aliases for cleaner imports
- Define core TypeScript interfaces and types

## Steps

### 1. Install Dependencies
```bash
# Canvas library
bun add react-konva konva

# Optional: Install react-icons for UI icons
bun add react-icons
```

### 2. Configure Path Aliases
Update `vite.config.ts`:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Update `tsconfig.json` to include:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. Create Folder Structure
```
src/
├── components/
│   ├── canvas/
│   ├── tools/
│   └── shapes/
├── contexts/
├── hooks/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

### 4. Define Core Types
Create `src/types/shapes.ts`:
```typescript
export interface BaseShape {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface Rectangle extends BaseShape {
  type: 'rectangle';
  width: number;
  height: number;
}

export interface Circle extends BaseShape {
  type: 'circle';
  radius: number;
}

export interface Line extends BaseShape {
  type: 'line';
  points: number[]; // [x1, y1, x2, y2]
}

export interface Arrow extends BaseShape {
  type: 'arrow';
  points: number[]; // [x1, y1, x2, y2]
}

export type Shape = Rectangle | Circle | Line | Arrow;
```

Create `src/types/tools.ts`:
```typescript
export type ToolType = 'select' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'pan';

export interface ToolState {
  activeTool: ToolType;
  isDrawing: boolean;
  isDragging: boolean;
  isPanning: boolean;
}
```

Create `src/types/canvas.ts`:
```typescript
export interface CanvasState {
  scale: number;
  offsetX: number;
  offsetY: number;
}
```

### 5. Create Utility Functions
Create `src/utils/colorPalette.ts`:
```typescript
export const COLOR_PALETTE = [
  '#000000',
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#EAB308', // yellow-500
  '#22C55E', // green-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#FFFFFF',
  '#9CA3AF', // gray-400
];

export const STROKE_WIDTHS = [1, 2, 3, 4, 6, 8, 12, 16, 24];
```

Create `src/utils/geometry.ts`:
```typescript
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};
```

### 6. Verify Installation
Create a test component `src/App.tsx`:
```tsx
import { Stage, Layer, Rect, Circle } from 'react-konva';

export default function App() {
  return (
    <div className="h-screen w-screen bg-gray-100">
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect
            x={100}
            y={100}
            width={100}
            height={100}
            fill="red"
          />
          <Circle
            x={300}
            y={150}
            radius={50}
            fill="blue"
          />
        </Layer>
      </Stage>
    </div>
  );
}
```

## Success Criteria
- [ ] react-konva and konva installed successfully
- [ ] Path alias @/ works correctly
- [ ] Folder structure created
- [ ] Core TypeScript types defined
- [ ] Konva shapes render on screen
- [ ] No TypeScript errors

## Notes
- react-konva provides React wrappers for Konva's 2D canvas API
- Types will evolve as we add more features
- Path aliases help keep imports clean and maintainable
