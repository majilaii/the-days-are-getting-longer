import type { PortableTextBlock } from '@portabletext/types'

export interface SanityImage {
  _type: 'image'
  _key?: string
  asset: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  caption?: string
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface Author {
  name: string
  slug: { current: string }
  avatar?: SanityImage
}

export interface Entry {
  _id: string
  title: string
  slug: { current: string }
  date: string
  excerpt?: string
  coverImage?: SanityImage
  body?: PortableTextBlock[]
  gallery?: SanityImage[]
  tags?: string[]
  mood?: string
  author?: Author
}

export interface DayMark {
  _id: string
  _createdAt?: string
  date: string
  note: string
  photo?: SanityImage
  author?: Author
}

export interface WallPin {
  _id: string
  _createdAt?: string
  date: string
  pinType: 'photo' | 'quote' | 'song' | 'video'
  photo?: SanityImage
  quote?: string
  songUrl?: string
  videoUrl?: string
  caption?: string
  author?: Author
}

export interface AboutPageData {
  photos?: SanityImage[]
}
