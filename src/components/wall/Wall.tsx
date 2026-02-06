'use client'

import { useState, useCallback } from 'react'
import { PinCard } from './PinCard'
import { PinForm } from './PinForm'
import type { WallPin } from '@/lib/types'

interface WallProps {
  initialPins: WallPin[]
}

export function Wall({ initialPins }: WallProps) {
  const [pins, setPins] = useState<WallPin[]>(initialPins)

  const handlePinAdded = useCallback((newPin: WallPin) => {
    setPins((prev) => [newPin, ...prev])
  }, [])

  return (
    <div className="relative">
      {pins.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {pins.map((pin) => (
            <PinCard key={pin._id} pin={pin} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32">
          <p className="font-typewriter text-xl text-muted dark:text-muted-dark">
            The wall is empty.
          </p>
          <p className="text-sm text-muted dark:text-muted-dark mt-2">
            Pin something to get started.
          </p>
        </div>
      )}

      <PinForm onPinAdded={handlePinAdded} />
    </div>
  )
}
