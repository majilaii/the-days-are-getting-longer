'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import type { SanityImage } from '@/lib/types'

export function PhotoGallery({ images }: { images: SanityImage[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goNext = useCallback(
    () =>
      setLightboxIndex((prev) =>
        prev !== null ? (prev + 1) % images.length : null
      ),
    [images.length]
  )

  const goPrev = useCallback(
    () =>
      setLightboxIndex((prev) =>
        prev !== null ? (prev - 1 + images.length) % images.length : null
      ),
    [images.length]
  )

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, closeLightbox, goNext, goPrev])

  if (!images || images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            key={image._key || index}
            onClick={() => setLightboxIndex(index)}
            className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 group cursor-pointer"
          >
            <Image
              src={urlFor(image).width(400).height(400).url()}
              alt={image.alt || ''}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            {image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{image.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft size={36} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight size={36} />
              </button>
            </>
          )}

          <div
            className="max-w-5xl max-h-[90vh] relative px-12"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={urlFor(images[lightboxIndex]).width(1600).url()}
              alt={images[lightboxIndex].alt || ''}
              width={1600}
              height={1200}
              className="max-h-[85vh] w-auto h-auto object-contain rounded"
            />
            {images[lightboxIndex].caption && (
              <p className="text-white/80 text-center text-sm mt-4">
                {images[lightboxIndex].caption}
              </p>
            )}
            <p className="text-white/40 text-center text-xs mt-2">
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
