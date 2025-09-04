"use client"

import { HallOfFame } from "@/components/HallOfFame"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function HallOfFamePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to home</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Hall of Fame</h1>
      </div>

      <HallOfFame />
    </div>
  )
}
