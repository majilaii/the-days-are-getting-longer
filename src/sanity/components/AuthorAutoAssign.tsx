import { useEffect, useCallback } from 'react'
import { set, useClient, useCurrentUser } from 'sanity'
import type { ObjectInputProps } from 'sanity'

/**
 * Custom input component for the author reference field.
 * Auto-assigns the author based on the logged-in user's email
 * when creating a new entry.
 */
export function AuthorAutoAssign(props: ObjectInputProps) {
  const currentUser = useCurrentUser()
  const client = useClient({ apiVersion: '2024-01-01' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = props.value as any

  const assignAuthor = useCallback(async () => {
    if (value?._ref || !currentUser?.email) return

    try {
      const authorId = await client.fetch<string | null>(
        '*[_type == "author" && email == $email][0]._id',
        { email: currentUser.email }
      )

      if (authorId) {
        props.onChange(set({ _type: 'reference', _ref: authorId }))
      }
    } catch {
      // Silently fail -- user can manually select
    }
  }, [value?._ref, currentUser?.email, client, props])

  useEffect(() => {
    assignAuthor()
  }, [assignAuthor])

  return props.renderDefault(props)
}
