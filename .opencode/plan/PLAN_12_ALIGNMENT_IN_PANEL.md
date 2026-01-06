# Move Alignment Controls to Tool Options Panel

## Goal
Move alignment and distribution controls from the floating toolbar into the ToolOptionsPanel for better organization.

## Current State
- `AlignmentToolbar.tsx` - Separate component with 8 alignment buttons
- Rendered inline in `TopToolbar.tsx` between drawing tools and edit tools
- Only visible when 2+ shapes selected

## Target State
- Move all alignment buttons into `ToolOptionsPanel.tsx`
- Place after existing style sections (when shapes selected)
- Remove `AlignmentToolbar.tsx` component
- Remove from `TopToolbar.tsx`

## Steps

### 12.1 Create Alignment Section Component
Add `AlignmentSection` component to `ToolOptionsPanel.tsx`:
```typescript
function AlignmentSection({
  canAlign,
  canDistribute,
  onAlign,
  onDistribute
}: {
  canAlign: boolean
  canDistribute: boolean
  onAlign: (alignment: AlignmentType) => void
  onDistribute: (distribution: DistributionType) => void
}) {
  return (
    <div>
      <div className="flex items-center mb-2.5">
        <AlignIcon className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alignment</span>
      </div>
      {/* Horizontal alignments */}
      <div className="flex gap-1 mb-2">
        <AlignmentButton onClick={() => onAlign('left')} disabled={!canAlign} icon="left" />
        <AlignmentButton onClick={() => onAlign('center')} disabled={!canAlign} icon="center" />
        <AlignmentButton onClick={() => onAlign('right')} disabled={!canAlign} icon="right" />
      </div>
      {/* Vertical alignments */}
      <div className="flex gap-1 mb-2">
        <AlignmentButton onClick={() => onAlign('top')} disabled={!canAlign} icon="top" />
        <AlignmentButton onClick={() => onAlign('middle')} disabled={!canAlign} icon="middle" />
        <AlignmentButton onClick={() => onAlign('bottom')} disabled={!canAlign} icon="bottom" />
      </div>
      {/* Distribution */}
      <div className="flex gap-1">
        <DistributionButton onClick={() => onDistribute('horizontal')} disabled={!canDistribute} icon="horizontal" />
        <DistributionButton onClick={() => onDistribute('vertical')} disabled={!canDistribute} icon="vertical" />
      </div>
    </div>
  )
}
```

### 12.2 Update ToolOptionsPanel Imports
Add to existing imports:
```typescript
import { alignShapes, distributeShapes } from '../../utils/alignment'
import type { AlignmentType, DistributionType } from '../../utils/alignment'
```

### 12.3 Add Store Actions to ToolOptionsPanel
Extract `alignShapes` and `distributeShapes` from store:
```typescript
const { alignShapes, distributeShapes } = useDiagramStore()
const canAlign = selection.shapeIds.length >= 2
const canDistribute = selection.shapeIds.length >= 3
```

### 12.4 Add AlignmentSection to Panel
Insert after existing sections in the `hasSelection` branch:
```tsx
<AlignmentSection
  canAlign={canAlign}
  canDistribute={canDistribute}
  onAlign={alignShapes}
  onDistribute={distributeShapes}
/>
```

### 12.5 Remove AlignmentToolbar Component
Delete `src/components/toolbar/AlignmentToolbar.tsx`

### 12.6 Update TopToolbar
- Remove `import { AlignmentToolbar } from './AlignmentToolbar'`
- Remove `<AlignmentToolbar />` from render

### 12.7 Clean Up Icons
The alignment icons can remain in the component or be moved to a shared icons file.

## UI Design Considerations

### Panel Layout
```
┌─────────────────────────────┐
│ Shape Properties          ◀── header shows count
├─────────────────────────────┤
│ Stroke Color            [color picker] │
│ Fill Color              [color picker] │
│ Stroke Width            [1][2][4][6][8] │
│ Alignment                      │    ◀── new section
│   [←][↔][→]                     │
│   [↑][↓][↕]                     │
│   [≡ horiz][≡ vert]             │
└─────────────────────────────┘
```

### Button Styling
- Use consistent styling with existing sections
- Small 7x7 icon buttons (like zoom controls)
- Disabled state when insufficient selection

## Deliverable
- Alignment controls integrated into ToolOptionsPanel
- Removed duplicate toolbar component
- Keyboard shortcuts still work
- All alignment operations functional

## Time Estimate
~20-25 minutes

## Dependencies
- Phase 11 (Alignment) complete
