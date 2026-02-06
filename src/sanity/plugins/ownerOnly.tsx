import { useState, useEffect } from 'react'
import { useCurrentUser, useClient } from 'sanity'
import type { DocumentActionComponent } from 'sanity'

/**
 * Wraps a document action to disable it when the current user
 * is not the author of the document.
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

    if (isOwner !== false) return result

    if (!result) return null
    return {
      ...result,
      disabled: true,
      label: `${result.label} (not your entry)`,
    }
  }

  WrappedAction.action = OriginalAction.action
  return WrappedAction
}

/**
 * Wraps a document action to disable it permanently once the document
 * has been published. Used for dayMarks -- once sealed, no one can edit.
 */
function withPermanent(
  OriginalAction: DocumentActionComponent
): DocumentActionComponent {
  const WrappedAction: DocumentActionComponent = (props) => {
    const result = OriginalAction(props)

    // If the document has been published, seal it
    if (props.published) {
      if (!result) return null
      return {
        ...result,
        disabled: true,
        label: `${result.label} (sealed)`,
      }
    }

    return result
  }

  WrappedAction.action = OriginalAction.action
  return WrappedAction
}

/**
 * Document actions resolver.
 * - Entries: owner-only (only author can edit)
 * - Day marks: owner-only + permanent (sealed after publish)
 * - Wall pins: owner-only + permanent (sealed after publish)
 */
export function ownerOnlyActions(
  prev: DocumentActionComponent[],
  context: { schemaType: string }
): DocumentActionComponent[] {
  if (context.schemaType === 'entry') {
    return prev.map((action) => withOwnerOnly(action))
  }
  if (context.schemaType === 'dayMark' || context.schemaType === 'wallPin') {
    return prev.map((action) => withPermanent(withOwnerOnly(action)))
  }
  return prev
}
