import { useState, useEffect } from 'react'
import { useCurrentUser, useClient } from 'sanity'
import type { DocumentActionComponent } from 'sanity'

/**
 * Wraps a document action to disable it when the current user
 * is not the author of the entry.
 */
function withOwnerOnly(
  OriginalAction: DocumentActionComponent
): DocumentActionComponent {
  const WrappedAction: DocumentActionComponent = (props) => {
    const currentUser = useCurrentUser()
    const client = useClient({ apiVersion: '2024-01-01' })
    const [isOwner, setIsOwner] = useState<boolean | null>(null)

    const doc = props.draft || props.published
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authorRef = (doc as any)?.author?._ref as string | undefined

    useEffect(() => {
      if (!authorRef || !currentUser?.email) {
        // No author set yet (new document) or not logged in -- allow
        setIsOwner(true)
        return
      }

      client
        .fetch<string | null>('*[_id == $id][0].email', { id: authorRef })
        .then((email) => {
          setIsOwner(email === currentUser.email)
        })
        .catch(() => setIsOwner(true))
    }, [authorRef, currentUser?.email, client])

    const result = OriginalAction(props)

    // Still loading or owner -- return original action
    if (isOwner !== false) return result

    // Not owner -- disable the action
    if (!result) return null
    return {
      ...result,
      disabled: true,
      label: `${result.label} (not your entry)`,
    }
  }

  // Preserve the action's identity for Sanity's internals
  WrappedAction.action = OriginalAction.action

  return WrappedAction
}

/**
 * Document actions resolver.
 * Wraps all entry actions with ownership checks.
 */
export function ownerOnlyActions(
  prev: DocumentActionComponent[],
  context: { schemaType: string }
): DocumentActionComponent[] {
  if (context.schemaType === 'entry') {
    return prev.map((action) => withOwnerOnly(action))
  }
  return prev
}
