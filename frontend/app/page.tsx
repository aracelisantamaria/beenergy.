"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/lib/wallet-context"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { WalletConfirmationModal } from "@/components/wallet-confirmation-modal"
import { ProfileSetupModal } from "@/components/profile-setup-modal"
import { Zap, TrendingUp, BarChart3 } from "lucide-react"

export default function LandingPage() {
  const { isConnected, connectWallet, userProfile, setUserProfile } = useWallet()
  const { t } = useI18n()
  const router = useRouter()
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)

  // Navigate to dashboard when connected and profile is set
  useEffect(() => {
    if (isConnected && userProfile) {
      router.push("/dashboard")
    }
  }, [isConnected, userProfile, router])

  // Show profile setup when wallet is connected but no profile yet
  useEffect(() => {
    if (isConnected && !userProfile && !showProfileSetup) {
      setShowConfirmModal(false)
      setShowProfileSetup(true)
    }
  }, [isConnected, userProfile, showProfileSetup])

  const handleConnectClick = () => {
    setShowConfirmModal(true)
  }

  const handleConfirmConnection = async () => {
    try {
      await connectWallet()
      // Don't close modal here - wait for isConnected to be true via useEffect
    } catch (error) {
      // Error is handled by WalletConfirmationModal
      console.error("[v0] Connection failed:", error)
    }
  }

  const handleProfileComplete = (name: string, avatar: string | null) => {
    setUserProfile({ name, avatar })
    setShowProfileSetup(false)
    // Navigation will happen via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0300AB] via-[#1B3659] to-[#059669] dark:from-[#020075] dark:via-[#0f1f38] dark:to-[#034832] flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-float">
              <img
                src="/beenergy-assets/iso-transparente.png"
                alt="BeEnergy Logo"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-white">BeEnergy</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center animate-float mx-auto">
              <img
                src="/beenergy-assets/iso-transparente.png"
                alt="BeEnergy Logo"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 text-balance">
            {t("landing.title")}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-[#8DE8F2] mb-12 md:mb-16 text-pretty px-4">
            {t("landing.subtitle")}
          </p>
          <Button
            onClick={handleConnectClick}
            size="lg"
            className="gradient-primary text-white font-bold text-lg md:text-xl px-12 md:px-16 py-6 md:py-8 hover:scale-110 transition-transform shadow-2xl"
          >
            {t("landing.connectWallet")}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="glass-card p-6 md:p-8 rounded-2xl text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{t("landing.feature.generate.title")}</h3>
            <p className="text-[#8DE8F2] text-sm md:text-base">{t("landing.feature.generate.description")}</p>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-2xl text-center hover:scale-105 transition-transform">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#F2C230] rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-[#0300AB]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{t("landing.feature.trade.title")}</h3>
            <p className="text-[#8DE8F2] text-sm md:text-base">{t("landing.feature.trade.description")}</p>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-2xl text-center hover:scale-105 transition-transform sm:col-span-2 md:col-span-1">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-[#8DE8F2] rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-7 h-7 md:w-8 md:h-8 text-[#0300AB]" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{t("landing.feature.manage.title")}</h3>
            <p className="text-[#8DE8F2] text-sm md:text-base">{t("landing.feature.manage.description")}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 md:py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
          <div className="flex gap-4 md:gap-6 text-[#8DE8F2] text-sm md:text-base">
            <a href="#" className="hover:text-white transition-colors">
              {t("landing.footer.docs")}
            </a>
            <a href="https://github.com/ange-r/beenergy/tree/master" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="" className="hover:text-white transition-colors">
              X
            </a>
          </div>
          <p className="text-[#8DE8F2] text-sm md:text-base">{t("landing.footer.powered")}</p>
        </div>
      </footer>

      <WalletConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmConnection}
      />

      <ProfileSetupModal isOpen={showProfileSetup} onComplete={handleProfileComplete} />
    </div>
  )
}
