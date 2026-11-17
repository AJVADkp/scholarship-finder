import { differenceInDays, format, parseISO } from 'date-fns'

export function getDaysUntilDeadline(deadline: string | null): number | null {
  if (!deadline) return null
  return differenceInDays(parseISO(deadline), new Date())
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline'
  try {
    return format(parseISO(deadline), 'dd MMM yyyy')
  } catch {
    return deadline
  }
}

export function getDeadlineStatus(days: number | null): 'urgent' | 'soon' | 'ok' | 'expired' {
  if (days === null) return 'ok'
  if (days < 0) return 'expired'
  if (days <= 7) return 'urgent'
  if (days <= 30) return 'soon'
  return 'ok'
}

export function formatAmount(amount: number | null, currency: string = 'INR'): string {
  if (amount === null) return 'N/A'
  if (currency === 'INR') {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }
  if (currency === 'USD') {
    return `$${amount.toLocaleString('en-US')}`
  }
  return `${currency} ${amount.toLocaleString()}`
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function parseIncomeRange(rangeStr: string): { min: number; max: number } | null {
  if (!rangeStr) return null
  const cleaned = rangeStr.toLowerCase().replace(/,/g, '')
  const hasLakh =
    /\b(lakhs?)\b/i.test(cleaned) ||
    /\b\d+(\.\d+)?\s*l\b/i.test(cleaned) ||
    (cleaned.includes('₹') && (cleaned.includes('l') || cleaned.includes('lakh')))

  const matches = [...cleaned.matchAll(/(\d+(\.\d+)?)/g)].map((m) => parseFloat(m[1]))
  if (matches.length === 0) return null

  const toRupees = (v: number) => (hasLakh && v < 1000 ? v * 100000 : v)

  if (cleaned.includes('below') || cleaned.includes('less than') || cleaned.includes('up to')) {
    return { min: 0, max: toRupees(matches[0]) }
  }
  if (
    cleaned.includes('above') ||
    cleaned.includes('more than') ||
    cleaned.includes('greater than')
  ) {
    return { min: toRupees(matches[0]), max: Infinity }
  }
  if (matches.length >= 2 && (cleaned.includes('to') || cleaned.includes('-'))) {
    return { min: toRupees(matches[0]), max: toRupees(matches[1]) }
  }

  // Single number: if qualified with "lakh", interpret as maximum ceiling e.g. "2 Lakhs" -> [0, 200000]
  // If raw numeric amount entered by user without ceiling words, treat as exact value [val, val]
  if (hasLakh) {
    return { min: 0, max: toRupees(matches[0]) }
  }
  const val = matches[0]
  return { min: val, max: val }
}

export function checkIncomeMatch(
  userIncome: string | null,
  scholarshipIncomeRange: string | null
): boolean {
  if (!userIncome) return false
  if (!scholarshipIncomeRange || scholarshipIncomeRange === 'Not specified') return true

  // Exact string match (for identical predefined dropdown selections)
  if (userIncome === scholarshipIncomeRange) return true

  const userParsed = parseIncomeRange(userIncome)
  if (!userParsed) return false

  const scholParsed = parseIncomeRange(scholarshipIncomeRange)
  if (!scholParsed) return false

  // Validate range overlap
  return userParsed.min <= scholParsed.max && userParsed.max >= scholParsed.min
}
