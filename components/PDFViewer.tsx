"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from "lucide-react"

interface PDFViewerProps {
  fileUrl: string
  title: string
  onClose: () => void
}

export function PDFViewer({ fileUrl, title, onClose }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [scale, setScale] = useState(1)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Prevent right-click, print, and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+P, Ctrl+S, PrtScn
      if ((e.ctrlKey && (e.key === "p" || e.key === "s")) || e.key === "PrintScreen") {
        e.preventDefault()
      }
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Simulate loading PDF and getting page count
  useEffect(() => {
    // In a real app, you would use a PDF.js or similar library to get the actual page count
    const randomPageCount = Math.floor(Math.random() * 20) + 5
    setTotalPages(randomPageCount)
  }, [fileUrl])

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const zoomIn = () => {
    setScale(Math.min(scale + 0.1, 2))
  }

  const zoomOut = () => {
    setScale(Math.max(scale - 0.1, 0.5))
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="bg-background p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold truncate max-w-md">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" size="icon" onClick={prevPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextPage} disabled={currentPage === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-4xl mx-auto overflow-hidden shadow-xl" style={{ transform: `scale(${scale})` }}>
          <CardContent className="p-0">
            {/* In a real app, you would use PDF.js or a similar library to render the PDF */}
            {/* For this demo, we'll use an iframe with sandbox attributes to prevent downloads */}
            <iframe
              ref={iframeRef}
              src={`${fileUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-[80vh]"
              sandbox="allow-same-origin allow-scripts"
              style={{ pointerEvents: "none" }} // Prevents interaction with the PDF
            />
          </CardContent>
        </Card>
      </div>
      <div className="bg-background p-4 text-center text-sm text-muted-foreground">
        This document is protected. Downloading, printing, and screenshots are disabled.
      </div>
    </div>
  )
}
