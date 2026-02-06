import Link from 'next/link'

export function TagBadge({ tag }: { tag: string }) {
  return (
    <Link
      href={`/tags/${encodeURIComponent(tag)}`}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        bg-stone-100 dark:bg-stone-800 text-muted dark:text-muted-dark
        hover:text-ink dark:hover:text-ink-light transition-colors"
    >
      {tag}
    </Link>
  )
}
