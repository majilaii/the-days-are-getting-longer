import { defineField, defineType } from 'sanity'
import { AuthorAutoAssign } from '../components/AuthorAutoAssign'

export const wallPin = defineType({
  name: 'wallPin',
  title: 'Wall Pin',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      validation: (rule) =>
        rule.required().max(new Date().toISOString().split('T')[0]),
      description: 'Cannot be a future date.',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (rule) => rule.required(),
      components: {
        input: AuthorAutoAssign,
      },
    }),
    defineField({
      name: 'pinType',
      title: 'Pin Type',
      type: 'string',
      options: {
        list: [
          { title: 'Photo', value: 'photo' },
          { title: 'Quote', value: 'quote' },
          { title: 'Song', value: 'song' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.pinType !== 'photo',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      hidden: ({ parent }) => parent?.pinType !== 'quote',
      validation: (rule) =>
        rule.custom((value, context) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((context.parent as any)?.pinType === 'quote' && !value) {
            return 'Quote text is required'
          }
          if (value && value.length > 280) {
            return 'Quote must be 280 characters or less'
          }
          return true
        }),
    }),
    defineField({
      name: 'songUrl',
      title: 'Song URL',
      type: 'url',
      description: 'Spotify or YouTube link',
      hidden: ({ parent }) => parent?.pinType !== 'song',
      validation: (rule) =>
        rule.custom((value, context) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((context.parent as any)?.pinType === 'song' && !value) {
            return 'Song URL is required'
          }
          return true
        }),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube or Vimeo link',
      hidden: ({ parent }) => parent?.pinType !== 'video',
      validation: (rule) =>
        rule.custom((value, context) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if ((context.parent as any)?.pinType === 'video' && !value) {
            return 'Video URL is required'
          }
          return true
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional short caption',
      validation: (rule) => rule.max(200),
    }),
  ],
  preview: {
    select: {
      date: 'date',
      pinType: 'pinType',
      authorName: 'author.name',
      caption: 'caption',
      quote: 'quote',
      media: 'photo',
    },
    prepare({ date, pinType, authorName, caption, quote, media }) {
      const typeEmoji =
        pinType === 'photo'
          ? '📷'
          : pinType === 'quote'
            ? '💬'
            : pinType === 'song'
              ? '🎵'
              : pinType === 'video'
                ? '🎬'
                : '📌'
      const subtitle = caption || quote || ''
      return {
        title: `${typeEmoji} ${date || 'No date'} — ${authorName || 'Unknown'}`,
        subtitle: subtitle.slice(0, 80),
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Date, New',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
})
