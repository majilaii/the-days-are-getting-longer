import { defineField, defineType } from 'sanity'
import { AuthorAutoAssign } from '../components/AuthorAutoAssign'

export const dayMark = defineType({
  name: 'dayMark',
  title: 'Day Mark',
  type: 'document',
  fields: [
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      initialValue: () => new Date().toISOString().split('T')[0],
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true
          const today = new Date().toISOString().split('T')[0]
          if (value !== today) return 'You can only cross out today'
          return true
        }),
      description: 'Can only be today.',
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
      name: 'note',
      title: 'Note',
      type: 'text',
      rows: 3,
      description: 'A few sentences about the day. Once published, this cannot be changed.',
      validation: (rule) => rule.required().max(500),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      date: 'date',
      authorName: 'author.name',
      note: 'note',
      media: 'photo',
    },
    prepare({ date, authorName, note, media }) {
      return {
        title: date || 'No date',
        subtitle: authorName
          ? `${authorName}: ${(note || '').slice(0, 60)}`
          : (note || '').slice(0, 60),
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
