'use client'

import type { DayMark } from '@/lib/types'

interface DayCellProps {
  date: string | null
  marks: DayMark[]
  authorOrder: string[] // sorted author slugs: [0] gets \, [1] gets /
  isToday: boolean
  isFuture: boolean
  onClick?: () => void
}

export function DayCell({
  date,
  marks,
  authorOrder,
  isToday,
  isFuture,
  onClick,
}: DayCellProps) {
  if (!date) {
    return <div className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]" />
  }

  const hasMarks = marks.length > 0
  const authorSlugs = marks.map((m) => m.author?.slug?.current)
  const hasStrokeA = authorSlugs.includes(authorOrder[0])
  const hasStrokeB = authorSlugs.includes(authorOrder[1])

  // Build background gradients for diagonal strokes
  const backgrounds: string[] = []
  if (hasStrokeA) {
    backgrounds.push(
      'linear-gradient(to bottom right, transparent calc(50% - 0.7px), var(--stroke-a) calc(50% - 0.7px), var(--stroke-a) calc(50% + 0.7px), transparent calc(50% + 0.7px))'
    )
  }
  if (hasStrokeB) {
    backgrounds.push(
      'linear-gradient(to bottom left, transparent calc(50% - 0.7px), var(--stroke-b) calc(50% - 0.7px), var(--stroke-b) calc(50% + 0.7px), transparent calc(50% + 0.7px))'
    )
  }

  // All non-future cells are clickable (to mark or view)
  const isClickable = !isFuture

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`
        w-[14px] h-[14px] md:w-[16px] md:h-[16px] rounded-[2px] transition-all relative
        ${isClickable ? 'cursor-pointer hover:ring-1 hover:ring-accent dark:hover:ring-accent-light' : 'cursor-default'}
        ${isToday ? 'ring-1 ring-ink dark:ring-ink-light' : ''}
        ${isFuture ? 'opacity-20' : ''}
        ${!hasMarks ? 'bg-stone-100 dark:bg-stone-800/50' : 'bg-stone-200 dark:bg-stone-700'}
      `}
      style={
        backgrounds.length > 0
          ? { background: backgrounds.join(', ') }
          : undefined
      }
      title={date}
      aria-label={date}
    />
  )
}
