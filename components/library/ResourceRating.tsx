"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface ResourceRatingProps {
  resource?: any // Make resource prop optional
  onRate: (resource: any, rating: number) => void
}

export function ResourceRating({ resource, onRate }: ResourceRatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)

  const handleRating = (rating: number) => {
    setSelectedRating(rating)
    if (resource) {
      // Check if resource is defined before calling onRate
      onRate(resource, rating)
    }
  }

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-4 w-4 cursor-pointer ${
            value <= (hoveredRating || selectedRating || resource?.rating || 0) // Use optional chaining
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300"
          }`}
          onClick={() => handleRating(value)}
          onMouseEnter={() => setHoveredRating(value)}
          onMouseLeave={() => setHoveredRating(0)}
        />
      ))}
    </div>
  )
}
