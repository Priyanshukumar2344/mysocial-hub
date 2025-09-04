"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Facebook, Twitter, Linkedin, Copy, Check } from "lucide-react"

interface ShareButtonsProps {
  url: string
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareButtons({ url, title, open, onOpenChange }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl = encodeURIComponent(url)
  const shareTitle = encodeURIComponent(title)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this resource</DialogTitle>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input value={url} readOnly className="w-full" />
          </div>
          <Button size="sm" className="px-3" onClick={handleCopy}>
            <span className="sr-only">Copy</span>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <div className="flex justify-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook className="h-4 w-4" />
              <span className="sr-only">Share on Facebook</span>
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Share on Twitter</span>
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">Share on LinkedIn</span>
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
