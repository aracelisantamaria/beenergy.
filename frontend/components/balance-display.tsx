"use client"

import { useEffect, useState } from "react"

interface BalanceDisplayProps {
  amount: number
  symbol: string
  fiatValue?: number
  className?: string
}

export function BalanceDisplay({ amount, symbol, fiatValue, className = "" }: BalanceDisplayProps) {
  const [displayAmount, setDisplayAmount] = useState(0)

  useEffect(() => {
    // Animación de counter
    const duration = 1000
    const steps = 30
    const increment = amount / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= amount) {
        setDisplayAmount(amount)
        clearInterval(timer)
      } else {
        setDisplayAmount(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [amount])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  }

  return (
    <div className={className}>
      <div className="text-4xl md:text-5xl font-bold font-sans">
        {formatNumber(displayAmount)} {symbol}
      </div>
      {fiatValue && <div className="text-muted-foreground text-lg mt-2">≈ ${formatNumber(fiatValue)} USD</div>}
    </div>
  )
}
