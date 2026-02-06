import { createClient } from 'next-sanity'
import { NextResponse } from 'next/server'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const writeToken = process.env.SANITY_API_WRITE_TOKEN

const VALID_PIN_TYPES = ['photo', 'quote', 'song', 'video'] as const

// Map PINs to author emails from env vars
const authorConfigs = [
  { pin: process.env.JACKY_PIN, email: process.env.JACKY_EMAIL },
  { pin: process.env.DOM_PIN, email: process.env.DOM_EMAIL },
].filter((a) => a.pin && a.email)

function getWriteClient() {
  if (!writeToken || !projectId) return null
  return createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  })
}

export async function POST(request: Request) {
  try {
    const client = getWriteClient()
    if (!client) {
      return NextResponse.json(
        { error: 'Server not configured for writing. Set SANITY_API_WRITE_TOKEN.' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const pin = formData.get('pin') as string
    const pinType = formData.get('pinType') as string
    const caption = (formData.get('caption') as string) || ''

    if (!pin || !pinType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!VALID_PIN_TYPES.includes(pinType as (typeof VALID_PIN_TYPES)[number])) {
      return NextResponse.json(
        { error: 'Invalid pin type' },
        { status: 400 }
      )
    }

    // Validate PIN and get author email
    const authorConfig = authorConfigs.find((a) => a.pin === pin)
    if (!authorConfig) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    // Look up author document by email
    const authorDoc = await client.fetch<{
      _id: string
      name: string
      slug: { current: string }
    } | null>(
      `*[_type == "author" && email == $email][0]{ _id, name, slug }`,
      { email: authorConfig.email! }
    )

    if (!authorDoc) {
      return NextResponse.json(
        { error: 'Author not found. Make sure the author exists in Sanity with a matching email.' },
        { status: 404 }
      )
    }

    // Check for existing pin by this author today (1 per day limit)
    const today = new Date().toISOString().split('T')[0]
    const existingCount = await client.fetch<number>(
      `count(*[_type == "wallPin" && date == $date && author._ref == $authorId])`,
      { date: today, authorId: authorDoc._id }
    )

    if (existingCount > 0) {
      return NextResponse.json(
        { error: 'You already pinned something today. Come back tomorrow!' },
        { status: 409 }
      )
    }

    // Build document fields based on pin type
    const doc: {
      _type: 'wallPin'
      date: string
      pinType: string
      author: { _type: 'reference'; _ref: string }
      caption?: string
      photo?: { _type: 'image'; asset: { _type: 'reference'; _ref: string } }
      quote?: string
      songUrl?: string
      videoUrl?: string
    } = {
      _type: 'wallPin',
      date: today,
      pinType,
      author: { _type: 'reference', _ref: authorDoc._id },
      ...(caption.trim() ? { caption: caption.trim() } : {}),
    }

    if (pinType === 'photo') {
      const photo = formData.get('photo') as File | null
      if (!photo || photo.size === 0) {
        return NextResponse.json(
          { error: 'Photo is required for photo pins' },
          { status: 400 }
        )
      }
      const buffer = Buffer.from(await photo.arrayBuffer())
      const asset = await client.assets.upload('image', buffer, {
        filename: photo.name || 'pin-photo.jpg',
        contentType: photo.type || 'image/jpeg',
      })
      doc.photo = {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      }
    } else if (pinType === 'quote') {
      const quote = formData.get('quote') as string
      if (!quote?.trim()) {
        return NextResponse.json(
          { error: 'Quote text is required' },
          { status: 400 }
        )
      }
      if (quote.length > 280) {
        return NextResponse.json(
          { error: 'Quote must be 280 characters or less' },
          { status: 400 }
        )
      }
      doc.quote = quote.trim()
    } else if (pinType === 'song') {
      const songUrl = formData.get('songUrl') as string
      if (!songUrl?.trim()) {
        return NextResponse.json(
          { error: 'Song URL is required' },
          { status: 400 }
        )
      }
      doc.songUrl = songUrl.trim()
    } else if (pinType === 'video') {
      const videoUrl = formData.get('videoUrl') as string
      if (!videoUrl?.trim()) {
        return NextResponse.json(
          { error: 'Video URL is required' },
          { status: 400 }
        )
      }
      doc.videoUrl = videoUrl.trim()
    }

    const created = await client.create(doc)

    // Return the pin data shaped for the client's optimistic update
    const wallPin = {
      _id: created._id,
      _createdAt: created._createdAt,
      date: today,
      pinType,
      photo: doc.photo || null,
      quote: doc.quote || null,
      songUrl: doc.songUrl || null,
      videoUrl: doc.videoUrl || null,
      caption: doc.caption || null,
      author: {
        name: authorDoc.name,
        slug: authorDoc.slug,
      },
    }

    return NextResponse.json({ pin: wallPin })
  } catch (err) {
    console.error('pin-wall error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Try again.' },
      { status: 500 }
    )
  }
}
