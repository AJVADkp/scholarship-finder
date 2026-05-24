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

export function checkIncomeMatch(userIncome: string | null, scholarshipIncomeRange: string | null): boolean {
  if (!userIncome) return false;
  if (!scholarshipIncomeRange || scholarshipIncomeRange === 'Not specified') return true;

  // Exact string match (for predefined dropdown brackets)
  if (userIncome === scholarshipIncomeRange) return true;

  // If user entered a custom numeric amount
  const userIncomeNum = parseFloat(userIncome.replace(/[^0-9.]/g, ''));
  if (isNaN(userIncomeNum)) return false;

  const rangeStr = scholarshipIncomeRange.toLowerCase();
  const hasLakh = /\b(lakhs?)\b/i.test(rangeStr) || /\b\d+(\.\d+)?\s*l\b/i.test(rangeStr);
  let max = Infinity;
  let min = 0;

  if (rangeStr.includes('below') || rangeStr.includes('less than') || rangeStr.includes('up to')) {
    const match = rangeStr.match(/(\d+(\.\d+)?)/);
    if (match) {
      let val = parseFloat(match[1]);
      if (hasLakh) val *= 100000;
      max = val;
    }
  } else if (rangeStr.includes('above') || rangeStr.includes('more than')) {
    const match = rangeStr.match(/(\d+(\.\d+)?)/);
    if (match) {
      let val = parseFloat(match[1]);
      if (hasLakh) val *= 100000;
      min = val;
    }
  } else if (rangeStr.includes('to') || rangeStr.includes('-')) {
    const matches = [...rangeStr.matchAll(/(\d+(\.\d+)?)/g)];
    if (matches.length >= 2) {
      let val1 = parseFloat(matches[0][1]);
      let val2 = parseFloat(matches[1][1]);
      if (hasLakh) {
        if (val1 < 100) val1 *= 100000;
        if (val2 < 100) val2 *= 100000;
      }
      min = val1;
      max = val2;
    }
  } else {
    // If it's just a number, assume it's a maximum (common in India e.g. "2 Lakhs")
    const match = rangeStr.match(/(\d+(\.\d+)?)/);
    if (match) {
      let val = parseFloat(match[1]);
      if (hasLakh) val *= 100000;
      max = val;
    }
  }

  return userIncomeNum >= min && userIncomeNum <= max;
}
