import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

function getClient(): SanityClient | null {
  if (!projectId) return null
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: 'published',
  })
}

export const client = getClient()

/**
 * Wrapper around client.fetch that handles missing projectId gracefully.
 * Returns the fallback value if Sanity is not configured.
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
  if (params) {
    return client.fetch<T>(query, params)
  }
  return client.fetch<T>(query)
}
