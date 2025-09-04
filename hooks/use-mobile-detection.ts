"use client"

import { useState, useEffect } from "react"

const MOBILE_DETECTION_VERSION = "2.0.0" // Incremented for improved detection

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [screenWidth, setScreenWidth] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return

    // Function to detect device
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const width = window.innerWidth

      setScreenWidth(width)
      setIsMobile(width < 768 || /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent))
      setIsAndroid(/android/i.test(userAgent))
      setIsIOS(/iphone|ipad|ipod/i.test(userAgent))
      setIsReady(true)
    }

    // Initial detection
    detectDevice()

    // Add resize listener for responsive changes
    window.addEventListener("resize", detectDevice)

    // Cleanup
    return () => {
      window.removeEventListener("resize", detectDevice)
    }
  }, [])

  return {
    isMobile,
    isAndroid,
    isIOS,
    screenWidth,
    isReady,
  }
}
