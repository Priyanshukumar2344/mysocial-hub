"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MediaPreviewProps {
  type: "image" | "video" | "audio"
  url: string
  filename: string
  onClose: () => void
}

export function MediaPreview({ type, url, filename, onClose }: MediaPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const togglePlay = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause()
      } else {
        mediaRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4",
        isFullscreen ? "p-0" : "p-4",
      )}
    >
      <div
        className={cn(
          "bg-card rounded-lg overflow-hidden flex flex-col max-w-4xl w-full max-h-[90vh]",
          isFullscreen ? "w-full h-full max-w-none max-h-none rounded-none" : "",
        )}
      >
        <div className="p-3 flex items-center justify-between border-b">
          <h3 className="font-medium truncate">{filename}</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close preview">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "flex-1 flex items-center justify-center bg-black/10 dark:bg-black/30 overflow-auto",
            isFullscreen ? "p-0" : "p-4",
          )}
        >
          {type === "image" && (
            <img
              src={url || "/placeholder.svg"}
              alt={filename}
              className={cn("max-w-full max-h-full object-contain", isFullscreen ? "w-full h-full" : "")}
            />
          )}

          {type === "video" && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={url}
                className={cn("max-w-full max-h-full", isFullscreen ? "w-full h-full" : "")}
                controls={false}
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
              />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {type === "audio" && (
            <div className="w-full max-w-md p-4">
              <div className="bg-card rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <Volume2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-center mb-4 font-medium">{filename}</p>
                <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={url} className="w-full" controls />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
