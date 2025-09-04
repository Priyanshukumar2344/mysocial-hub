import type React from "react"
import { Book } from "lucide-react"

interface LibrarySectionProps {
  title: string
  children: React.ReactNode
}

const LibrarySection: React.FC<LibrarySectionProps> = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
        <Book className="h-5 w-5" />
        <span>{title}</span>
      </h2>
      <div className="border rounded-md p-4">{children}</div>
    </div>
  )
}

export default LibrarySection
