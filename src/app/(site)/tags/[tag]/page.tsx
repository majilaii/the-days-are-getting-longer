import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { sanityFetch } from '@/sanity/lib/client'
import { entriesByTagQuery } from '@/sanity/lib/queries'
import { EntryCard } from '@/components/EntryCard'
import type { Entry } from '@/lib/types'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ tag: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  return {
    title: `#${decodedTag}`,
    description: `Journal entries tagged with "${decodedTag}".`,
  }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const entries = await sanityFetch<Entry[]>(
    entriesByTagQuery,
    { tag: decodedTag },
    []
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link
        href="/journal"
        className="inline-flex items-center gap-2 text-sm text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors mb-10"
      >
        <ArrowLeft size={16} />
        Back to journal
      </Link>

      <h1 className="font-typewriter text-4xl font-semibold text-ink dark:text-ink-light tracking-tight mb-4">
        #{decodedTag}
      </h1>
      <p className="text-muted dark:text-muted-dark mb-16">
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'} tagged
        with &ldquo;{decodedTag}&rdquo;
      </p>

      {entries.length > 0 ? (
        <div className="space-y-16">
          {entries.map((entry) => (
            <EntryCard key={entry._id} entry={entry} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="font-typewriter text-xl text-muted dark:text-muted-dark">
            No entries with this tag.
          </p>
        </div>
      )}
    </div>
  )
}
