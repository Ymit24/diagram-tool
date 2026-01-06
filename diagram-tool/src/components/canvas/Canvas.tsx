export function Canvas() {
  return (
    <div className="w-full h-full overflow-hidden cursor-crosshair">
      <svg className="w-full h-full">
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgb(229, 231, 235)" strokeWidth="1" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  )
}
