"use client"

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-2" aria-live="polite" aria-label="Someone is typing">
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  )
}
