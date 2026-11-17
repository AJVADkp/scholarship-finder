import { describe, it, expect } from 'vitest'
import {
  checkIncomeMatch,
  formatAmount,
  formatDeadline,
  getDeadlineStatus,
  getDaysUntilDeadline,
} from '@/lib/utils'

describe('checkIncomeMatch', () => {
  it('returns false when user income is null or empty', () => {
    expect(checkIncomeMatch(null, 'Below 6 Lakhs')).toBe(false)
    expect(checkIncomeMatch('', 'Below 6 Lakhs')).toBe(false)
  })

  it('returns true when scholarship income range is null or "Not specified"', () => {
    expect(checkIncomeMatch('400000', null)).toBe(true)
    expect(checkIncomeMatch('Below 4 Lakhs', 'Not specified')).toBe(true)
  })

  it('matches identical dropdown strings', () => {
    expect(checkIncomeMatch('Below 2 Lakhs', 'Below 2 Lakhs')).toBe(true)
    expect(checkIncomeMatch('2.5 - 5 Lakhs', '2.5 - 5 Lakhs')).toBe(true)
  })

  describe('custom numeric user income evaluation', () => {
    it('evaluates "Below X Lakhs" / "up to X Lakhs" constraints correctly', () => {
      // Below 6 Lakhs (max: 600,000)
      expect(checkIncomeMatch('350000', 'Below 6 Lakhs')).toBe(true)
      expect(checkIncomeMatch('600000', 'Below 6 Lakhs')).toBe(true)
      expect(checkIncomeMatch('650000', 'Below 6 Lakhs')).toBe(false)

      // Up to 2.5 Lakhs
      expect(checkIncomeMatch('200000', 'Up to 2.5 Lakhs')).toBe(true)
      expect(checkIncomeMatch('300000', 'Up to 2.5 Lakhs')).toBe(false)
    })

    it('evaluates "Above X Lakhs" / "more than X" constraints correctly', () => {
      expect(checkIncomeMatch('900000', 'Above 8 Lakhs')).toBe(true)
      expect(checkIncomeMatch('750000', 'Above 8 Lakhs')).toBe(false)
    })

    it('evaluates range brackets (e.g. "2.5 - 5 Lakhs" or "2 to 6 Lakhs")', () => {
      expect(checkIncomeMatch('300000', '2.5 - 5 Lakhs')).toBe(true)
      expect(checkIncomeMatch('500000', '2.5 - 5 Lakhs')).toBe(true)
      expect(checkIncomeMatch('150000', '2.5 - 5 Lakhs')).toBe(false)
      expect(checkIncomeMatch('600000', '2.5 - 5 Lakhs')).toBe(false)
    })

    it('handles "L" notation shorthand (e.g. "6L", "2.5L")', () => {
      expect(checkIncomeMatch('400000', 'Below 6L')).toBe(true)
      expect(checkIncomeMatch('700000', 'Below 6L')).toBe(false)
    })

    it('handles numeric input formatted with currency symbols and commas', () => {
      expect(checkIncomeMatch('₹4,50,000', 'Below 6 Lakhs')).toBe(true)
      expect(checkIncomeMatch('₹8,00,000', 'Below 6 Lakhs')).toBe(false)
    })

    it('returns false for invalid non-numeric strings', () => {
      expect(checkIncomeMatch('not-a-number', 'Below 6 Lakhs')).toBe(false)
    })
  })
})

describe('formatAmount', () => {
  it('returns N/A for null amounts', () => {
    expect(formatAmount(null)).toBe('N/A')
  })

  it('formats amounts in INR correctly with Lakh notation above 100,000', () => {
    expect(formatAmount(50000, 'INR')).toBe('₹50,000')
    expect(formatAmount(100000, 'INR')).toBe('₹1.0L')
    expect(formatAmount(250000, 'INR')).toBe('₹2.5L')
  })

  it('formats USD currency correctly', () => {
    expect(formatAmount(5000, 'USD')).toBe('$5,000')
  })

  it('formats other currencies with fallback', () => {
    expect(formatAmount(3000, 'EUR')).toBe('EUR 3,000')
  })
})

describe('formatDeadline and status', () => {
  it('formats ISO deadlines nicely', () => {
    expect(formatDeadline('2026-12-31')).toBe('31 Dec 2026')
    expect(formatDeadline(null)).toBe('No deadline')
  })

  it('computes deadline status according to remaining days', () => {
    expect(getDeadlineStatus(null)).toBe('ok')
    expect(getDeadlineStatus(-1)).toBe('expired')
    expect(getDeadlineStatus(5)).toBe('urgent')
    expect(getDeadlineStatus(20)).toBe('soon')
    expect(getDeadlineStatus(45)).toBe('ok')
  })

  it('calculates days until deadline', () => {
    expect(getDaysUntilDeadline(null)).toBeNull()
  })
})
