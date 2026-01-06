export const COLOR_PALETTE = {
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',
  red100: '#FECACA',
  red400: '#F87171',
  red500: '#EF4444',
  red600: '#DC2626',
  orange400: '#FB923C',
  orange500: '#F97316',
  yellow400: '#FACC15',
  yellow500: '#EAB308',
  yellow100: '#FEF08A',
  green400: '#4ADE80',
  green500: '#22C55E',
  green600: '#16A34A',
  green100: '#BBF7D0',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue100: '#BFDBFE',
  purple400: '#C084FC',
  purple500: '#A855F7',
  pink400: '#F472B6',
  pink500: '#EC4899',
} as const

export const DEFAULT_STROKE_COLORS = [
  { name: 'Black', value: COLOR_PALETTE.black },
  { name: 'Gray 700', value: COLOR_PALETTE.gray700 },
  { name: 'Gray 400', value: COLOR_PALETTE.gray400 },
  { name: 'Red 500', value: COLOR_PALETTE.red500 },
  { name: 'Blue 500', value: COLOR_PALETTE.blue500 },
  { name: 'Green 500', value: COLOR_PALETTE.green500 },
]

export const DEFAULT_FILL_COLORS = [
  { name: 'Transparent', value: 'transparent' },
  { name: 'White', value: COLOR_PALETTE.white },
  { name: 'Red 100', value: COLOR_PALETTE.red100 },
  { name: 'Blue 100', value: COLOR_PALETTE.blue100 },
  { name: 'Green 100', value: COLOR_PALETTE.green100 },
  { name: 'Yellow 100', value: COLOR_PALETTE.yellow100 },
]

export const DEFAULT_STROKE_WIDTHS = [1, 2, 4, 6, 8]

export const ARROW_HEAD_STYLES = [
  { name: 'Filled', value: 'filled' },
  { name: 'Open', value: 'open' },
  { name: 'Stealth', value: 'stealth' },
  { name: 'Diamond', value: 'diamond' },
  { name: 'Circle', value: 'circle' },
  { name: 'Bar', value: 'bar' },
] as const
