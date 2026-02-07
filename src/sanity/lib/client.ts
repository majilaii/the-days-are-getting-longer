import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

function getClient(): SanityClient | null {
  if (!projectId) return null
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: 'published',
  })
}

export const client = getClient()

/**
 * Wrapper around client.fetch that handles missing projectId gracefully.
 * Returns the fallback value if Sanity is not configured.
 * Uses Next.js revalidation so pages update after content changes.
 */
export async function sanityFetch<T>(
  query: string,
  params?: Record<string, string>,
  fallback?: T
): Promise<T> {
  if (!client) {
    if (fallback !== undefined) return fallback
    return [] as unknown as T
  }
  const fetchOptions = { next: { revalidate: 30 } }
  if (params) {
    return client.fetch<T>(query, params, fetchOptions)
  }
  return client.fetch<T>(query, {}, fetchOptions)
}
