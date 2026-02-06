'use client'

import Image from 'next/image'
import { Music, Play } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import type { WallPin } from '@/lib/types'

/** Extract a YouTube video ID from common URL formats */
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

/** Check if a URL is a Spotify link */
function getSpotifyEmbedUrl(url: string): string | null {
  // Convert open.spotify.com/track/XXX to embed URL
  const match = url.match(
    /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/
  )
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`
  }
  return null
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Deterministic soft color from pin ID for quote backgrounds
const QUOTE_COLORS = [
  'bg-amber-50 dark:bg-amber-950/40',
  'bg-rose-50 dark:bg-rose-950/40',
  'bg-sky-50 dark:bg-sky-950/40',
  'bg-emerald-50 dark:bg-emerald-950/40',
  'bg-violet-50 dark:bg-violet-950/40',
  'bg-orange-50 dark:bg-orange-950/40',
]

function getQuoteColor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return QUOTE_COLORS[Math.abs(hash) % QUOTE_COLORS.length]
}

export function PinCard({ pin }: { pin: WallPin }) {
  const authorName = pin.author?.name || 'Unknown'
  const dateStr = formatDate(pin.date)

  return (
    <div className="break-inside-avoid mb-4 group">
      <div className="rounded-xl overflow-hidden bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Photo pin */}
        {pin.pinType === 'photo' && pin.photo && (
          <div className="relative">
            <Image
              src={urlFor(pin.photo).width(600).url()}
              alt={pin.photo.alt || pin.caption || ''}
              width={600}
              height={600}
              className="w-full h-auto"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {pin.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-3 pt-8">
                <p className="text-white text-sm">{pin.caption}</p>
              </div>
            )}
          </div>
        )}

        {/* Quote pin */}
        {pin.pinType === 'quote' && (
          <div className={`p-5 ${getQuoteColor(pin._id)}`}>
            <p className="font-typewriter text-base md:text-lg leading-relaxed text-ink dark:text-ink-light">
              &ldquo;{pin.quote}&rdquo;
            </p>
            {pin.caption && (
              <p className="mt-3 text-xs text-muted dark:text-muted-dark italic">
                {pin.caption}
              </p>
            )}
          </div>
        )}

        {/* Song pin */}
        {pin.pinType === 'song' && pin.songUrl && (
          <div className="p-0">
            {getSpotifyEmbedUrl(pin.songUrl) ? (
              <iframe
                src={getSpotifyEmbedUrl(pin.songUrl)!}
                width="100%"
                height="152"
                allow="encrypted-media"
                loading="lazy"
                className="rounded-t-xl"
              />
            ) : getYouTubeId(pin.songUrl) ? (
              <div className="relative aspect-video">
                <Image
                  src={`https://img.youtube.com/vi/${getYouTubeId(pin.songUrl)}/hqdefault.jpg`}
                  alt={pin.caption || 'Song'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <a
                  href={pin.songUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                >
                  <Play size={40} className="text-white drop-shadow-lg" fill="white" />
                </a>
              </div>
            ) : (
              <a
                href={pin.songUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 dark:bg-accent-light/10 flex items-center justify-center flex-shrink-0">
                  <Music size={20} className="text-accent dark:text-accent-light" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink dark:text-ink-light truncate">
                    {pin.caption || 'Listen'}
                  </p>
                  <p className="text-xs text-muted dark:text-muted-dark truncate">
                    {new URL(pin.songUrl).hostname}
                  </p>
                </div>
              </a>
            )}
            {pin.caption && !getSpotifyEmbedUrl(pin.songUrl) && !getYouTubeId(pin.songUrl) ? null : pin.caption ? (
              <div className="px-4 py-2">
                <p className="text-sm text-muted dark:text-muted-dark">{pin.caption}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Video pin */}
        {pin.pinType === 'video' && pin.videoUrl && (
          <div>
            {getYouTubeId(pin.videoUrl) ? (
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(pin.videoUrl)}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <a
                href={pin.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 dark:bg-accent-light/10 flex items-center justify-center flex-shrink-0">
                  <Play size={20} className="text-accent dark:text-accent-light" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink dark:text-ink-light truncate">
                    {pin.caption || 'Watch'}
                  </p>
                  <p className="text-xs text-muted dark:text-muted-dark truncate">
                    {new URL(pin.videoUrl).hostname}
                  </p>
                </div>
              </a>
            )}
            {pin.caption && (
              <div className="px-4 py-2">
                <p className="text-sm text-muted dark:text-muted-dark">{pin.caption}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer: author + date */}
        <div className="px-3 py-2 flex items-center justify-between text-xs text-muted dark:text-muted-dark">
          <span>{authorName}</span>
          <span>{dateStr}</span>
        </div>
      </div>
    </div>
  )
}
