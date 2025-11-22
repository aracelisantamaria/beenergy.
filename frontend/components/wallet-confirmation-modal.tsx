"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { X, Shield, Key, AlertCircle } from "lucide-react"

interface WalletConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function WalletConfirmationModal({ isOpen, onClose, onConfirm }: WalletConfirmationModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setIsConnecting(false)
    }
  }, [isOpen])

  const handleClose = () => {
    if (!isConnecting) {
      setError(null)
      onClose()
    }
  }

  const handleConfirm = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      await onConfirm()
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("wallet.error.message"))
    } finally {
      setIsConnecting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#059669] rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t("wallet.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("wallet.subtitle")}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={isConnecting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions */}
        <div className="space-y-4 mb-6">
          <div className="border border-border rounded-lg p-4 bg-background/50">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#F2C230]" />
              {t("wallet.permissions")}
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[#059669] mt-0.5">✓</span>
                <span>{t("wallet.permission1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#059669] mt-0.5">✓</span>
                <span>{t("wallet.permission2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#059669] mt-0.5">✓</span>
                <span>{t("wallet.permission3")}</span>
              </li>
            </ul>
          </div>

          <div className="border border-[#F2C230]/30 rounded-lg p-4 bg-[#F2C230]/5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#F2C230] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-semibold mb-1">{t("wallet.security.title")}</p>
                <p className="text-muted-foreground">{t("wallet.security.description")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 border border-red-500/30 rounded-lg p-4 bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-500">
                <p className="font-semibold mb-1">{t("wallet.error.title")}</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isConnecting} className="flex-1 bg-transparent">
            {t("wallet.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConnecting}
            className="flex-1 gradient-primary text-white font-semibold hover:scale-105 transition-transform"
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("wallet.connecting")}
              </span>
            ) : (
              t("wallet.authorize")
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
