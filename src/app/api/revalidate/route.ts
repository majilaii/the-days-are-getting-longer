import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Verify the webhook secret
  const secret = request.headers.get('x-revalidate-secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // Revalidate all site pages
  revalidatePath('/', 'layout')

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
