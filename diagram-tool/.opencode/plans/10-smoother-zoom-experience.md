# Smoother Zoom Experience

## Problem
Zoom happens instantly without transition, and zooming always centers on the viewport rather than zooming towards the cursor position.

## Solution
- Add CSS transition for smooth zoom
- Implement zoom-towards-cursor behavior
- Make zoom feel more professional and predictable

## Files to Modify
- `src/components/canvas/Canvas.tsx`
- `src/components/canvas/ZoomControls.tsx`

## Implementation Steps

1. Add smooth transition to SVG group:
   ```typescript
   // In Canvas.tsx, wrap the transform in a group with transition
   <g
     transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}
     className="smooth-zoom"
   >
     <InfiniteGrid viewport={viewport} />
     {/* ... shapes ... */}
   </g>
   ```

2. Update CSS to define smooth-zoom:
   ```css
   // In src/style.css
   .smooth-zoom {
     transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
   }
   ```

3. Update handleWheel to zoom towards cursor:
   ```typescript
   const handleWheel = useCallback((e: React.WheelEvent) => {
     if (e.ctrlKey || e.metaKey) {
       e.preventDefault()

       const rect = canvasRef.current?.getBoundingClientRect()
       if (!rect) return

       // Get mouse position in canvas coordinates before zoom
       const mouseCanvasBefore = screenToCanvas(
         e.clientX,
         e.clientY,
         viewport,
         rect
       )

       const delta = e.deltaY > 0 ? 0.9 : 1.1
       const newZoom = Math.min(Math.max(viewport.zoom * delta, 0.1), 5)

       // Calculate new viewport position to keep mouse point stable
       const newViewport = {
         zoom: newZoom,
         x: e.clientX - rect.left - mouseCanvasBefore.x * newZoom,
         y: e.clientY - rect.top - mouseCanvasBefore.y * newZoom
       }

       setViewport(newViewport)
     } else {
       setViewport({
         x: viewport.x - e.deltaX,
         y: viewport.y - e.deltaY
       })
     }
   }, [viewport, setViewport])
   ```

4. Update ZoomControls zoom functions to maintain cursor position:
   ```typescript
   // For button-based zoom, zoom towards center of viewport
   const zoomTowardsCenter = (factor: number) => {
     const centerX = window.innerWidth / 2 - viewport.x
     const centerY = window.innerHeight / 2 - viewport.y

     const newZoom = Math.min(Math.max(viewport.zoom * factor, 0.1), 5)
     const zoomRatio = newZoom / viewport.zoom

     setViewport({
       zoom: newZoom,
       x: centerX - centerX * zoomRatio + viewport.x,
       y: centerY - centerY * zoomRatio + viewport.y
     })
   }
   ```

## Testing
- Scroll with Ctrl/Cmd held: verify zoom follows cursor
- Click zoom in/out buttons: verify zoom centers appropriately
- Verify zoom is smooth with CSS transition
- Test at different zoom levels and cursor positions

## Impact
Zooming feels professional and predictable, similar to tools like Figma or Sketch. Users can zoom to specific areas easily.
