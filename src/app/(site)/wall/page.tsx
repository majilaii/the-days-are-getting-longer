import { sanityFetch } from '@/sanity/lib/client'
import { allWallPinsQuery } from '@/sanity/lib/queries'
import { Wall } from '@/components/wall/Wall'
import type { WallPin } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Wall',
  description: 'A collaborative pin board — one pin per day.',
}

export default async function WallPage() {
  const pins = await sanityFetch<WallPin[]>(allWallPinsQuery, undefined, [])

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
      <section className="mb-12">
        <h1 className="font-typewriter text-4xl md:text-5xl font-semibold text-ink dark:text-ink-light tracking-tight mb-3">
          The Wall
        </h1>
        <p className="text-sm text-muted dark:text-muted-dark max-w-lg">
          One pin per day. Photos, quotes, songs, videos — whatever catches the moment.
        </p>
      </section>

      <Wall initialPins={pins} />
    </div>
  )
}
