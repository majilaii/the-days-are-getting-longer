'use client'

import { useState, useEffect } from 'react'
import { getDaylightPhrase } from '@/lib/daylight'

export function DaylightTitle() {
  const [phrase, setPhrase] = useState('')

  useEffect(() => {
    setPhrase(getDaylightPhrase(new Date()))
  }, [])

  if (!phrase) {
    // Invisible placeholder to prevent layout shift
    return <span className="invisible">loading daylight</span>
  }

  return <span>{phrase}</span>
}
