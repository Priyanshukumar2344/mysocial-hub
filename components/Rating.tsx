"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface RatingProps {
  resource: any
  onRate: (resource: any, rating: number) => void
}

export function Rating({ resource, onRate }: RatingProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(0)

  const handleRating = (rating: number) => {
    setSelectedRating(rating)
    onRate(resource, rating)
  }

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-4 w-4 cursor-pointer ${
            value <= (hoveredRating || selectedRating || resource.rating)
              ? "text-yellow-500 fill-yellow-500"
              : "text-gray-300"
          }`}
          onClick={() => handleRating(value)}
          onMouseEnter={() => setHoveredRating(value)}
          onMouseLeave={() => setHoveredRating(0)}
        />
      ))}
      <span className="ml-2 text-xs text-muted-foreground">
        ({resource.rating?.toFixed(1) || 0}) • {resource.totalRatings || 0} ratings
      </span>
    </div>
  )
}
