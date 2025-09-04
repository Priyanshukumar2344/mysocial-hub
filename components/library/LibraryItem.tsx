import type React from "react"
import { Book } from "lucide-react"

interface LibraryItemProps {
  title: string
  author: string
}

const LibraryItem: React.FC<LibraryItemProps> = ({ title, author }) => {
  return (
    <div>
      <Book />
      <h3>{title}</h3>
      <p>By {author}</p>
    </div>
  )
}

export default LibraryItem
