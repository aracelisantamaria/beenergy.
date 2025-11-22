"use client"

import type React from "react"

import { useState } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Camera, X } from "lucide-react"

interface ProfileSetupModalProps {
  isOpen: boolean
  onComplete: (name: string, avatar: string | null) => void
}

export function ProfileSetupModal({ isOpen, onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const { t } = useI18n()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (name.trim()) {
      onComplete(name.trim(), avatar)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t("profile.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("profile.subtitle")}</p>
          </div>
        </div>

        {/* Avatar Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-3">{t("profile.avatar")}</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
              {avatar ? (
                <img src={avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors font-medium"
              >
                <Camera className="w-4 h-4" />
                {t("profile.uploadPhoto")}
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {avatar && (
                <button
                  onClick={() => setAvatar(null)}
                  className="ml-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 inline" /> {t("profile.remove")}
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t("profile.optional")}</p>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-3">
            {t("profile.name")} <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            placeholder={t("profile.namePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            maxLength={50}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full gradient-primary text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {t("profile.continue")}
        </Button>
      </div>
    </div>
  )
}
