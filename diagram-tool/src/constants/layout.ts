export const LAYOUT = {
  floatingToolbar: {
    height: '48px',
    width: 'auto',
    borderRadius: '12px',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
    shadowHover: '0 8px 32px rgba(0, 0, 0, 0.16)',
  },
  floatingPanel: {
    width: '280px',
    borderRadius: '12px',
    shadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    headerHeight: '44px',
  },
  zoomControls: {
    width: '140px',
    height: '36px',
    borderRadius: '8px',
  },
  toolButton: {
    size: '36px',
    borderRadius: '8px',
  },
  colorSwatch: {
    size: '24px',
    borderRadius: '6px',
  },
} as const

export const TRANSITIONS = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
} as const

export const Z_INDICES = {
  canvas: 0,
  floatingToolbar: 100,
  floatingPanel: 90,
  zoomControls: 80,
  grid: -1,
} as const

export const CANVAS_GRID = {
  smallDotSize: 1,
  smallGridSize: 20,
  largeGridSize: 100,
  dotColor: '#E5E7EB',
  lineColor: '#D1D5DB',
} as const
