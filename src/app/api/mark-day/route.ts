import { createClient } from 'next-sanity'
import { NextResponse } from 'next/server'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const writeToken = process.env.SANITY_API_WRITE_TOKEN

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
    const date = formData.get('date') as string
    const note = formData.get('note') as string
    const photo = formData.get('photo') as File | null

    if (!pin || !date || !note) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Only allow marking today
    const today = new Date().toISOString().split('T')[0]
    if (date !== today) {
      return NextResponse.json(
        { error: 'You can only cross out today' },
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

    // Check for existing mark by this author on this date
    const existingCount = await client.fetch<number>(
      `count(*[_type == "dayMark" && date == $date && author._ref == $authorId])`,
      { date, authorId: authorDoc._id }
    )

    if (existingCount > 0) {
      return NextResponse.json(
        { error: 'You already crossed out this day' },
        { status: 409 }
      )
    }

    // Upload photo if present
    let photoField: Record<string, unknown> | undefined
    if (photo && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer())
      const asset = await client.assets.upload('image', buffer, {
        filename: photo.name || 'photo.jpg',
        contentType: photo.type || 'image/jpeg',
      })
      photoField = {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      }
    }

    // Create the dayMark document
    const created = await client.create({
      _type: 'dayMark' as const,
      date,
      note: note.trim(),
      author: { _type: 'reference', _ref: authorDoc._id },
      ...(photoField ? { photo: photoField } : {}),
    })

    // Return the mark data shaped for the client's optimistic update
    const mark = {
      _id: created._id,
      _createdAt: created._createdAt,
      date,
      note: note.trim(),
      photo: photoField || null,
      author: {
        name: authorDoc.name,
        slug: authorDoc.slug,
      },
    }

    return NextResponse.json({ mark })
  } catch (err) {
    console.error('mark-day error:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Try again.' },
      { status: 500 }
    )
  }
}
