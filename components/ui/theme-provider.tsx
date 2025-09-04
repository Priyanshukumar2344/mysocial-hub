"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({
  children,
  defaultTheme = "light",
  disableSystem = true,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider defaultTheme={defaultTheme} enableSystem={!disableSystem} {...props}>
      {children}
    </NextThemesProvider>
  )
}
