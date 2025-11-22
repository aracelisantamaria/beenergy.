"use client"

import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { Languages } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LanguageSelector() {
  const { language, setLanguage } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Languages className="w-5 h-5" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={() => setLanguage("es")} className="cursor-pointer">
          <span className={language === "es" ? "font-bold" : ""}>Español</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("en")} className="cursor-pointer">
          <span className={language === "en" ? "font-bold" : ""}>English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
