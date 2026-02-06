import Link from 'next/link'
import { sanityFetch } from '@/sanity/lib/client'
import { allEntriesQuery } from '@/sanity/lib/queries'
import { EntryCard } from '@/components/EntryCard'
import { getDaylightPhrase } from '@/lib/daylight'
import type { Entry } from '@/lib/types'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: getDaylightPhrase(),
  }
}

export default async function HomePage() {
  const entries = await sanityFetch<Entry[]>(allEntriesQuery, undefined, [])
  const latestEntries = entries.slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Hero */}
      <section className="mb-20">
        <p className="font-typewriter text-xl text-muted dark:text-muted-dark leading-relaxed max-w-2xl">
          Documenting the days as they get longer and shorter, then
          shorter, then longer again.
        </p>
      </section>

      {/* Latest entries */}
      {latestEntries.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted dark:text-muted-dark mb-10">
            Latest Entries
          </h2>
          <div className="space-y-16">
            {latestEntries.map((entry) => (
              <EntryCard key={entry._id} entry={entry} />
            ))}
          </div>
          {entries.length > 5 && (
            <div className="mt-16 text-center">
              <Link
                href="/journal"
                className="inline-flex items-center gap-2 text-accent dark:text-accent-light hover:underline underline-offset-4 font-medium"
              >
                View all entries &rarr;
              </Link>
            </div>
          )}
        </section>
      ) : (
        <section className="text-center py-20">
          <div className="space-y-4">
            <p className="font-typewriter text-xl text-muted dark:text-muted-dark">
              No entries yet.
            </p>
            <p className="text-sm text-muted dark:text-muted-dark">
              Head to{' '}
              <Link
                href="/studio"
                className="text-accent dark:text-accent-light underline underline-offset-2"
              >
                /studio
              </Link>{' '}
              to write your first entry.
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
