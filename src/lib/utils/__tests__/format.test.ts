import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, formatRelativeTime, formatPercent, formatNumber } from '../format'

describe('formatCurrency', () => {
  it('formats BRL currency', () => {
    const result = formatCurrency(1234.5).replace(/\s/g, ' ')
    expect(result).toBe('R$ 1.234,50')
  })
  it('formats zero', () => {
    const result = formatCurrency(0).replace(/\s/g, ' ')
    expect(result).toBe('R$ 0,00')
  })
})

describe('formatDate', () => {
  it('formats date in pt-BR', () => {
    const result = formatDate('2026-03-15T10:00:00Z')
    expect(result).toContain('15')
    expect(result).toContain('03')
    expect(result).toContain('2026')
  })
})

describe('formatRelativeTime', () => {
  it('returns "agora" for less than 1 minute', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('agora')
  })
  it('returns minutes for recent times', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)
    expect(formatRelativeTime(fiveMinAgo.toISOString())).toBe('há 5 min')
  })
  it('returns hours for older times', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('há 2h')
  })
  it('returns "ontem" for yesterday', () => {
    const yesterday = new Date(Date.now() - 26 * 60 * 60 * 1000)
    expect(formatRelativeTime(yesterday.toISOString())).toBe('ontem')
  })
  it('returns date for older than 2 days', () => {
    const old = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(old.toISOString())
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

describe('formatPercent', () => {
  it('formats percentage', () => {
    expect(formatPercent(0.856)).toBe('85,6%')
  })
})

describe('formatNumber', () => {
  it('formats large numbers in pt-BR', () => {
    expect(formatNumber(1500)).toBe('1.500')
  })
})
