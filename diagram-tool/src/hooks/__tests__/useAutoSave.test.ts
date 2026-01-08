import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useRelativeTime, type SaveStatus } from '../useAutoSave'

describe('useAutoSave', () => {
  describe('useRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns empty string for null date', () => {
      expect(useRelativeTime(null)).toBe('')
    })

    it('returns "Saved just now" for dates within 5 seconds', () => {
      const now = new Date()
      expect(useRelativeTime(now)).toBe('Saved just now')

      const fourSecondsAgo = new Date(now.getTime() - 4000)
      expect(useRelativeTime(fourSecondsAgo)).toBe('Saved just now')
    })

    it('returns seconds ago for dates within 60 seconds', () => {
      const now = new Date()
      const tenSecondsAgo = new Date(now.getTime() - 10000)
      expect(useRelativeTime(tenSecondsAgo)).toBe('Saved 10s ago')

      const thirtySecondsAgo = new Date(now.getTime() - 30000)
      expect(useRelativeTime(thirtySecondsAgo)).toBe('Saved 30s ago')
    })

    it('returns minutes ago for dates within 60 minutes', () => {
      const now = new Date()
      const twoMinutesAgo = new Date(now.getTime() - 120000)
      expect(useRelativeTime(twoMinutesAgo)).toBe('Saved 2m ago')

      const thirtyMinutesAgo = new Date(now.getTime() - 1800000)
      expect(useRelativeTime(thirtyMinutesAgo)).toBe('Saved 30m ago')
    })

    it('returns hours ago for dates within 24 hours', () => {
      const now = new Date()
      const twoHoursAgo = new Date(now.getTime() - 7200000)
      expect(useRelativeTime(twoHoursAgo)).toBe('Saved 2h ago')

      const twelveHoursAgo = new Date(now.getTime() - 43200000)
      expect(useRelativeTime(twelveHoursAgo)).toBe('Saved 12h ago')
    })

    it('returns time for older dates', () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 86400000 - 3600000)
      const timeString = yesterday.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      const result = useRelativeTime(yesterday)
      expect(result).toContain(timeString)
    })
  })
})

describe('SaveStatus type', () => {
  it('accepts all valid status values', () => {
    const statuses: SaveStatus[] = ['idle', 'saving', 'saved', 'error']
    expect(statuses).toHaveLength(4)
  })
})
