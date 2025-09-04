"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ReviewFormProps {
  resourceId: number
  onReviewSubmit: (rating: number, comment: string) => void
}

export function ReviewForm({ resourceId, onReviewSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating.",
        variant: "destructive",
      })
      return
    }
    onReviewSubmit(rating, comment)
    setRating(0)
    setComment("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <div className="flex items-center mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 cursor-pointer ${
                star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1" rows={3} />
      </div>
      <Button type="submit">Submit Review</Button>
    </form>
  )
}
