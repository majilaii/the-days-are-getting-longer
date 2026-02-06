import Image from 'next/image'
import { sanityFetch } from '@/sanity/lib/client'
import { aboutPageQuery } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import type { AboutPageData } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About this journal.',
}

export default async function AboutPage() {
  const aboutData = await sanityFetch<AboutPageData | null>(
    aboutPageQuery,
    undefined,
    null
  )
  const photos = aboutData?.photos || []

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-typewriter text-4xl font-semibold text-ink dark:text-ink-light tracking-tight mb-8">
        About
      </h1>
      <div className="font-typewriter text-lg leading-[1.8] space-y-6 text-ink dark:text-ink-light">
        <p>
          Dominic, or Dom, as I call him, loves the summer. Unluckily, he was
          born in the UK, where the days are cloudy and grey, and the rain never
          stops.
        </p>
        <p>
          He loves Letterboxd. He would probably start a Substack if he
          wasn&apos;t so afraid of being embarrassed by the world.
        </p>
        <p>
          So I made this for him! I&apos;m Jacky, and I was born in Macao
          &mdash; where the sun shines even in the middle of December. Winter
          doesn&apos;t really last long, and the days are always the same
          length.
        </p>
        <p>
          But Jacky, I, am always so scared of time passing by. I&apos;m always
          regretful of the fact that my parents are old and I am on the other
          side of the world.
        </p>
        <p>
          This website is a way for us to just write down our thoughts of the
          day, or maybe even thoughts for our future, and for us one day, to
          look back on.
        </p>
      </div>

      {/* Photo stream */}
      {photos.length > 0 && (
        <div className="mt-16 space-y-6">
          {photos.map((photo, index) => (
            <figure key={photo._key || index}>
              {photo.asset && (
                <Image
                  src={urlFor(photo).width(1200).url()}
                  alt={photo.alt || ''}
                  width={1200}
                  height={900}
                  className="w-full h-auto rounded-lg"
                  sizes="(max-width: 672px) 100vw, 672px"
                />
              )}
              {photo.caption && (
                <figcaption className="text-sm text-muted dark:text-muted-dark mt-2 italic">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
