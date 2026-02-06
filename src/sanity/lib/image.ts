import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client'
import { projectId, dataset } from '../env'

const builder = client
  ? createImageUrlBuilder(client)
  : createImageUrlBuilder({ projectId: projectId || 'placeholder', dataset })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source)
}
