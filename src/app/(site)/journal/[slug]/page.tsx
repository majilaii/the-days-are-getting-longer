import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { sanityFetch } from '@/sanity/lib/client'
import { entryBySlugQuery } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { PortableTextRenderer } from '@/components/PortableTextRenderer'
import { PhotoGallery } from '@/components/PhotoGallery'
import { TagBadge } from '@/components/TagBadge'
import { formatDate } from '@/lib/utils'
import type { Entry } from '@/lib/types'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = await sanityFetch<Entry | null>(
    entryBySlugQuery,
    { slug },
    null
  )

  if (!entry) return { title: 'Not Found' }

  return {
    title: entry.title,
    description: entry.excerpt || `Journal entry: ${entry.title}`,
    openGraph: {
      title: entry.title,
      description: entry.excerpt || `Journal entry: ${entry.title}`,
      ...(entry.coverImage?.asset && {
        images: [
          { url: urlFor(entry.coverImage).width(1200).height(630).url() },
        ],
      }),
    },
  }
}

export default async function EntryPage({ params }: Props) {
  const { slug } = await params
  const entry = await sanityFetch<Entry | null>(
    entryBySlugQuery,
    { slug },
    null
  )

  if (!entry) notFound()

  return (
    <article className="max-w-4xl mx-auto px-6 py-16">
      {/* Back link */}
      <Link
        href="/journal"
        className="inline-flex items-center gap-2 text-sm text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors mb-10"
      >
        <ArrowLeft size={16} />
        Back to journal
      </Link>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 text-sm text-muted dark:text-muted-dark mb-4">
          <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          {entry.author && (
            <>
              <span>&middot;</span>
              <span>by {entry.author.name}</span>
            </>
          )}
          {entry.mood && (
            <>
              <span>&middot;</span>
              <span>{entry.mood}</span>
            </>
          )}
        </div>
        <h1 className="font-typewriter text-4xl md:text-5xl font-semibold text-ink dark:text-ink-light tracking-tight leading-tight">
          {entry.title}
        </h1>
        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {entry.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </header>

      {/* Cover image */}
      {entry.coverImage?.asset && (
        <div className="relative aspect-[16/9] mb-12 rounded-xl overflow-hidden">
          <Image
            src={urlFor(entry.coverImage).width(1200).height(675).url()}
            alt={entry.coverImage.alt || entry.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
          {entry.coverImage.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-6 py-4">
              <p className="text-white/90 text-sm italic">
                {entry.coverImage.caption}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      {entry.body && (
        <div className="max-w-2xl mx-auto">
          <PortableTextRenderer value={entry.body} />
        </div>
      )}

      {/* Photo Gallery */}
      {entry.gallery && entry.gallery.length > 0 && (
        <div className="mt-16">
          <h2 className="font-typewriter text-2xl font-semibold text-ink dark:text-ink-light mb-6">
            Photos
          </h2>
          <PhotoGallery images={entry.gallery} />
        </div>
      )}

      {/* Footer navigation */}
      <div className="mt-20 pt-10 border-t border-border-light dark:border-border-dark">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-sm text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors"
        >
          <ArrowLeft size={16} />
          Back to all entries
        </Link>
      </div>
    </article>
  )
}
