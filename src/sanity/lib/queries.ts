import { groq } from 'next-sanity'

/** All published entries, ordered by date descending */
export const allEntriesQuery = groq`
  *[_type == "entry"] | order(date desc) {
    _id,
    title,
    slug,
    date,
    excerpt,
    coverImage,
    tags,
    mood,
    author->{ name, slug, avatar }
  }
`

/** Single entry by slug, with full content */
export const entryBySlugQuery = groq`
  *[_type == "entry" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    date,
    excerpt,
    coverImage,
    body,
    gallery,
    tags,
    mood,
    author->{ name, slug, avatar }
  }
`

/** All entries matching a specific tag */
export const entriesByTagQuery = groq`
  *[_type == "entry" && $tag in tags] | order(date desc) {
    _id,
    title,
    slug,
    date,
    excerpt,
    coverImage,
    tags,
    mood,
    author->{ name, slug, avatar }
  }
`

/** All unique tags used across entries */
export const allTagsQuery = groq`
  array::unique(*[_type == "entry" && defined(tags)].tags[])
`
