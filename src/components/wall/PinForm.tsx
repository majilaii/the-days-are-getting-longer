'use client'

import { useState, useRef } from 'react'
import { Plus, X, Camera, Quote, Music, Video, Loader2 } from 'lucide-react'
import type { WallPin } from '@/lib/types'

const PIN_TYPES = [
  { value: 'photo', label: 'Photo', icon: Camera },
  { value: 'quote', label: 'Quote', icon: Quote },
  { value: 'song', label: 'Song', icon: Music },
  { value: 'video', label: 'Video', icon: Video },
] as const

interface PinFormProps {
  onPinAdded: (pin: WallPin) => void
}

export function PinForm({ onPinAdded }: PinFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pinType, setPinType] = useState<WallPin['pinType']>('photo')
  const [pin, setPin] = useState('')
  const [caption, setCaption] = useState('')
  const [quote, setQuote] = useState('')
  const [songUrl, setSongUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  function resetForm() {
    setPinType('photo')
    setPin('')
    setCaption('')
    setQuote('')
    setSongUrl('')
    setVideoUrl('')
    setPhotoPreview(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleClose() {
    setIsOpen(false)
    resetForm()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('pin', pin)
      formData.append('pinType', pinType)
      if (caption.trim()) formData.append('caption', caption.trim())

      if (pinType === 'photo') {
        const file = fileRef.current?.files?.[0]
        if (!file) {
          setError('Please select a photo')
          setSubmitting(false)
          return
        }
        formData.append('photo', file)
      } else if (pinType === 'quote') {
        if (!quote.trim()) {
          setError('Please enter a quote')
          setSubmitting(false)
          return
        }
        formData.append('quote', quote.trim())
      } else if (pinType === 'song') {
        if (!songUrl.trim()) {
          setError('Please enter a song URL')
          setSubmitting(false)
          return
        }
        formData.append('songUrl', songUrl.trim())
      } else if (pinType === 'video') {
        if (!videoUrl.trim()) {
          setError('Please enter a video URL')
          setSubmitting(false)
          return
        }
        formData.append('videoUrl', videoUrl.trim())
      }

      const res = await fetch('/api/pin-wall', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setSubmitting(false)
        return
      }

      onPinAdded(data.pin)
      handleClose()
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating + button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-accent dark:bg-accent-light text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center cursor-pointer"
        aria-label="Add a pin"
      >
        <Plus size={24} />
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={handleClose}
        >
          <div
            className="w-full sm:max-w-md bg-paper dark:bg-paper-dark rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
              <h2 className="font-typewriter text-lg font-semibold text-ink dark:text-ink-light">
                Pin to the wall
              </h2>
              <button
                onClick={handleClose}
                className="text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-light transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* PIN input */}
              <div>
                <label className="block text-xs font-medium text-muted dark:text-muted-dark mb-1.5">
                  Your PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-light"
                  required
                />
              </div>

              {/* Pin type selector */}
              <div>
                <label className="block text-xs font-medium text-muted dark:text-muted-dark mb-1.5">
                  Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PIN_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPinType(value)}
                      className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        pinType === value
                          ? 'border-accent dark:border-accent-light bg-accent/5 dark:bg-accent-light/5 text-accent dark:text-accent-light'
                          : 'border-border-light dark:border-border-dark text-muted dark:text-muted-dark hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content input based on type */}
              {pinType === 'photo' && (
                <div>
                  <label className="block text-xs font-medium text-muted dark:text-muted-dark mb-1.5">
                    Photo
                  </label>
                  {photoPreview && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-auto max-h-48 object-cover"
                      />
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full text-sm text-muted dark:text-muted-dark file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-stone-100 dark:file:bg-stone-800 file:text-ink dark:file:text-ink-light file:cursor-pointer"
                  />
                </div>
              )}

              {pinType === 'quote' && (
                <div>
                  <label className="block text-xs font-medium text-muted dark:text-muted-dark mb-1.5">
                    Quote ({quote.length}/280)
                  </label>
                  <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    maxLength={280}
                    rows={4}
                    placeholder="Type a quote, lyric, or thought..."
                    className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-light resize-none"
                  />
                </div>
              )}

              {pinType === 'song' && (
                <div>
                  <label className="block text-xs font-medium text-muted dark:text-muted-dark mb-1.5">
                    Song URL
                  </label>
                  <input
                    type="url"
                    value={songUrl}
                    onChange={(e) => setSongUrl(e.target.value)}
                    placeholder="https://open.spotify.com/track/..."
                    className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-light"
                  />
                  <p className="text-xs text-muted dark:text-muted-dark mt-1">
                    Spotify or YouTube links work best
                  </p>
                </div>
              )}

              {pinType === 'video' && (
                <div>
                  <label className="block text-xs font-medium text-muted dark:text-muted-dark mb-1.5">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-light"
                  />
                  <p className="text-xs text-muted dark:text-muted-dark mt-1">
                    YouTube or Vimeo links
                  </p>
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-medium text-muted dark:text-muted-dark mb-1.5">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={200}
                  placeholder="Add a caption..."
                  className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-light text-sm focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-light"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-accent dark:bg-accent-light text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Pinning...
                  </>
                ) : (
                  'Pin it'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
