"use client"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/lib/theme-context"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="rounded-full w-10 h-10 bg-background/50 hover:bg-background/80 backdrop-blur-sm border-2 transition-all hover:scale-110"
      aria-label={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-primary transition-transform rotate-0" />
      ) : (
        <Sun className="h-5 w-5 text-accent-cyan transition-transform rotate-0" />
      )}
    </Button>
  )
}
