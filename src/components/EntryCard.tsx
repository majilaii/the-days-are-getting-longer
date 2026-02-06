import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { urlFor } from '@/sanity/lib/image'
import { TagBadge } from './TagBadge'
import type { Entry } from '@/lib/types'

export function EntryCard({ entry }: { entry: Entry }) {
  return (
    <article className="group">
      <Link href={`/journal/${entry.slug.current}`} className="block">
        {entry.coverImage?.asset && (
          <div className="relative aspect-[16/9] mb-4 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800">
            <Image
              src={urlFor(entry.coverImage).width(800).height(450).url()}
              alt={entry.coverImage.alt || entry.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted dark:text-muted-dark">
            <time dateTime={entry.date}>{formatDate(entry.date)}</time>
            {entry.author && (
              <>
                <span className="text-border-light dark:text-border-dark">
                  &middot;
                </span>
                <span>by {entry.author.name}</span>
              </>
            )}
            {entry.mood && (
              <>
                <span className="text-border-light dark:text-border-dark">
                  &middot;
                </span>
                <span>{entry.mood}</span>
              </>
            )}
          </div>
          <h2 className="font-typewriter text-2xl font-semibold text-ink dark:text-ink-light group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
            {entry.title}
          </h2>
          {entry.excerpt && (
            <p className="text-muted dark:text-muted-dark leading-relaxed line-clamp-2">
              {entry.excerpt}
            </p>
          )}
        </div>
      </Link>
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {entry.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </article>
  )
}
