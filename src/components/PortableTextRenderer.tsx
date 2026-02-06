import {
  PortableText,
  type PortableTextComponents,
} from '@portabletext/react'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import type { PortableTextBlock } from '@portabletext/types'

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="font-typewriter text-3xl font-semibold mt-12 mb-4 text-ink dark:text-ink-light">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-typewriter text-2xl font-semibold mt-10 mb-3 text-ink dark:text-ink-light">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-typewriter text-xl font-semibold mt-8 mb-2 text-ink dark:text-ink-light">
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p className="font-typewriter text-lg leading-[1.8] mb-6 text-ink dark:text-ink-light">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-accent dark:border-accent-light pl-6 my-8 italic font-typewriter text-lg text-muted dark:text-muted-dark">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    underline: ({ children }) => <u>{children}</u>,
    code: ({ children }) => (
      <code className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent dark:text-accent-light underline underline-offset-2 hover:no-underline transition-all"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) return null
      return (
        <figure className="my-10">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={urlFor(value).width(1200).url()}
              alt={value.alt || ''}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-muted dark:text-muted-dark mt-3 italic">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul className="font-typewriter text-lg list-disc pl-6 mb-6 space-y-2 text-ink dark:text-ink-light">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="font-typewriter text-lg list-decimal pl-6 mb-6 space-y-2 text-ink dark:text-ink-light">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    number: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
  },
}

export function PortableTextRenderer({
  value,
}: {
  value: PortableTextBlock[]
}) {
  return <PortableText value={value} components={components} />
}
