'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, Camera } from 'lucide-react'
import { urlFor } from '@/sanity/lib/image'
import type { DayMark } from '@/lib/types'

interface DayDetailProps {
  date: string
  marks: DayMark[]
  onClose: () => void
  onMarkAdded: (mark: DayMark) => void
}

function formatDetailDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function DayDetail({ date, marks, onClose, onMarkAdded }: DayDetailProps) {
  const [note, setNote] = useState('')
  const [pin, setPin] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const canAddMark = marks.length < 2
  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today
  const isFuture = date > today

  useEffect(() => {
    const savedPin = localStorage.getItem('daymark_pin')
    if (savedPin) setPin(savedPin)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      if (photoPreview) URL.revokeObjectURL(photoPreview)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim() || !pin.trim()) return

    setStatus('submitting')
    setErrorMsg('')

    const formData = new FormData()
    formData.append('pin', pin)
    formData.append('date', date)
    formData.append('note', note.trim())
    if (photo) formData.append('photo', photo)

    try {
      const res = await fetch('/api/mark-day', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong')
        return
      }

      // Save PIN for next time
      localStorage.setItem('daymark_pin', pin)

      setStatus('success')
      onMarkAdded(data.mark)

      // Brief "Sealed." flash, then close
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Try again.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-paper dark:bg-paper-dark border border-border-light dark:border-border-dark rounded-t-2xl md:rounded-xl max-w-lg w-full max-h-[85dvh] overflow-y-auto p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h3 className="font-typewriter text-lg text-ink dark:text-ink-light">
            {formatDetailDate(date)}
          </h3>
          <button
            onClick={onClose}
            className="text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Existing marks */}
        {marks.length > 0 && (
          <div className="space-y-6 mb-6">
            {marks.map((mark) => (
              <div key={mark._id} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-accent dark:text-accent-light">
                    {mark.author?.name}
                  </p>
                  {mark._createdAt && (
                    <p className="text-[11px] text-muted dark:text-muted-dark whitespace-nowrap">
                      crossed out {formatTimestamp(mark._createdAt)}
                    </p>
                  )}
                </div>
                <p className="font-typewriter text-ink dark:text-ink-light leading-relaxed">
                  {mark.note}
                </p>
                {mark.photo?.asset && (
                  <div className="relative rounded-lg overflow-hidden mt-2">
                    <Image
                      src={urlFor(mark.photo).width(800).url()}
                      alt={mark.photo.alt || ''}
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg"
                      sizes="(max-width: 512px) 100vw, 512px"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className="text-center py-8">
            <p className="font-typewriter text-2xl text-ink dark:text-ink-light">
              Sealed.
            </p>
          </div>
        )}

        {/* Mark form -- only for today, not fully crossed, and not just succeeded */}
        {canAddMark && isToday && status !== 'success' && (
          <>
            {marks.length > 0 && (
              <div className="border-t border-border-light dark:border-border-dark my-6" />
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-typewriter text-sm text-muted dark:text-muted-dark">
                {marks.length === 0
                  ? 'Cross this day out'
                  : 'Complete the cross'}
              </h4>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What happened today?"
                maxLength={500}
                rows={3}
                className="w-full bg-transparent border border-border-light dark:border-border-dark rounded-lg px-3 py-2 font-typewriter text-sm text-ink dark:text-ink-light placeholder:text-muted/50 dark:placeholder:text-muted-dark/50 resize-none focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-accent-light"
                required
                disabled={status === 'submitting'}
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors cursor-pointer"
                  disabled={status === 'submitting'}
                >
                  <Camera size={14} />
                  {photo ? 'Change photo' : 'Add photo'}
                </button>
                {photoPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN"
                  className="w-20 bg-transparent border border-border-light dark:border-border-dark rounded-lg px-3 py-2 font-typewriter text-sm text-center text-ink dark:text-ink-light placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-accent-light"
                  required
                  disabled={status === 'submitting'}
                />
                <button
                  type="submit"
                  disabled={
                    status === 'submitting' || !note.trim() || !pin.trim()
                  }
                  className="flex-1 bg-ink dark:bg-ink-light text-paper dark:text-paper-dark font-typewriter text-sm py-2 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
                >
                  {status === 'submitting' ? 'Sealing...' : 'Cross it out'}
                </button>
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errorMsg}
                </p>
              )}
            </form>
          </>
        )}

        {/* Empty state for future days */}
        {marks.length === 0 && isFuture && (
          <p className="text-sm text-muted dark:text-muted-dark text-center py-8 font-typewriter">
            This day hasn&apos;t happened yet.
          </p>
        )}
      </div>
    </div>
  )
}
