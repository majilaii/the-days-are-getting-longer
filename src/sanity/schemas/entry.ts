import { defineField, defineType } from 'sanity'
import { AuthorAutoAssign } from '../components/AuthorAutoAssign'

export const entry = defineType({
  name: 'entry',
  title: 'Journal Entry',
  type: 'document',
  fields: [
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
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'A short summary shown in previews and metadata',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (rule) =>
                      rule.uri({
                        allowRelative: true,
                        scheme: ['http', 'https', 'mailto', 'tel'],
                      }),
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      description: 'Add photos to create a gallery at the bottom of the entry',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
        },
      ],
      options: {
        layout: 'grid',
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'mood',
      title: 'Mood',
      type: 'string',
      options: {
        list: [
          { title: 'Reflective', value: 'reflective' },
          { title: 'Joyful', value: 'joyful' },
          { title: 'Melancholic', value: 'melancholic' },
          { title: 'Grateful', value: 'grateful' },
          { title: 'Adventurous', value: 'adventurous' },
          { title: 'Peaceful', value: 'peaceful' },
          { title: 'Creative', value: 'creative' },
          { title: 'Nostalgic', value: 'nostalgic' },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      date: 'date',
      authorName: 'author.name',
      media: 'coverImage',
    },
    prepare({ title, date, authorName, media }) {
      const dateStr = date
        ? new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'No date'
      return {
        title,
        subtitle: authorName ? `${dateStr} -- by ${authorName}` : dateStr,
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
    {
      title: 'Date, Old',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
  ],
})
