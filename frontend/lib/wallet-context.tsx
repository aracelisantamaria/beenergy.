"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { mockUser } from "@/lib/mock-data"

interface UserProfile {
  name: string
  avatar: string | null
}

interface WalletContextType {
  isConnected: boolean
  address: string | null
  shortAddress: string | null
  userProfile: UserProfile | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  setUserProfile: (profile: UserProfile) => void
  isFreighterInstalled: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [shortAddress, setShortAddress] = useState<string | null>(null)
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null)
  const [isFreighterInstalled, setIsFreighterInstalled] = useState(false)

  useEffect(() => {
    // Check if Freighter is installed
    const checkFreighter = async () => {
      const installed = typeof window !== "undefined" && "freighter" in window
      setIsFreighterInstalled(installed)
    }
    checkFreighter()

    const savedProfile = localStorage.getItem("userProfile")
    const savedAddress = localStorage.getItem("walletAddress")

    if (savedProfile && savedAddress) {
      try {
        setUserProfileState(JSON.parse(savedProfile))
        setAddress(savedAddress)
        setShortAddress(`${savedAddress.slice(0, 6)}...${savedAddress.slice(-4)}`)
        setIsConnected(true)
      } catch (e) {
        console.error("Error loading saved state:", e)
        localStorage.removeItem("userProfile")
        localStorage.removeItem("walletAddress")
      }
    }
  }, [])

  const connectWallet = async () => {
    try {
      // Simular verificación de Freighter
      if (Math.random() < 0.1) {
        // 10% chance de error para demostrar manejo
        throw new Error("No se pudo conectar con Freighter. Por favor, asegúrate de tener la extensión instalada.")
      }

      // Simular tiempo de conexión
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setAddress(mockUser.address)
      setShortAddress(mockUser.shortAddress)
      setIsConnected(true)
      localStorage.setItem("walletAddress", mockUser.address)
    } catch (error) {
      console.error("Error connecting wallet:", error)
      // Re-throw the error so the modal can catch it
      throw error
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setShortAddress(null)
    setIsConnected(false)
    setUserProfileState(null)
    localStorage.removeItem("userProfile")
    localStorage.removeItem("walletAddress")
  }

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile)
    localStorage.setItem("userProfile", JSON.stringify(profile))
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        shortAddress,
        userProfile,
        connectWallet,
        disconnectWallet,
        setUserProfile,
        isFreighterInstalled,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
