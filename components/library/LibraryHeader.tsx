import type React from "react"
import { Book } from "lucide-react"

interface LibraryHeaderProps {
  title: string
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ title }) => {
  return (
    <div className="flex items-center space-x-2">
      <Book className="h-6 w-6" />
      <h1 className="text-2xl font-semibold">{title}</h1>
    </div>
  )
}

export default LibraryHeader
