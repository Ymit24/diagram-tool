# Remove Redundant Zoom Display

## Problem
The zoom percentage is displayed in both the TopToolbar and the dedicated ZoomControls, creating visual clutter and redundancy.

## Solution
Remove the zoom display from TopToolbar, keeping only the dedicated ZoomControls in the bottom right corner.

## Files to Modify
- `src/components/toolbar/TopToolbar.tsx`

## Implementation Steps

1. Remove zoom controls from TopToolbar:
   ```typescript
   // Remove this section entirely:
   <ToolbarGroup>
     <IconButton
       icon={Minus}
       label="Zoom Out"
       onClick={handleZoomOut}
       size="small"
     />
     <ZoomDisplay zoom={viewport.zoom} onClick={handleZoomReset} />
     <IconButton
       icon={Plus}
       label="Zoom In"
       onClick={handleZoomIn}
       size="small"
     />
   </ToolbarGroup>

   // Also remove the preceding ToolbarDivider
   ```

2. Remove unnecessary handler functions:
   ```typescript
   // Remove:
   const handleZoomIn = useCallback(...)
   const handleZoomOut = useCallback(...)
   const handleZoomReset = useCallback(...)

   // Remove from destructured store:
   const {
     ...
     viewport,
     setViewport,  // Can remove if not used elsewhere
     ...
   } = useDiagramStore()
   ```

3. Clean up any unused imports if needed

## Testing
- Verify toolbar looks cleaner without zoom controls
- Verify zoom still works via ZoomControls in bottom right
- Verify zoom still works via keyboard shortcuts and mouse wheel
- Check that toolbar width is appropriate after removal

## Impact
Cleaner, less cluttered toolbar. Users have a dedicated zoom control panel that's more discoverable, and the toolbar focuses on tool selection and actions.
