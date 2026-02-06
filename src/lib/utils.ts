import type { Entry } from './types'

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatMonthYear(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}

export function groupEntriesByMonth(entries: Entry[]): [string, Entry[]][] {
  const groups = new Map<string, Entry[]>()
  for (const entry of entries) {
    const key = formatMonthYear(entry.date)
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(entry)
  }
  return Array.from(groups.entries())
}


export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
