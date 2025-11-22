"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/lib/wallet-context"
import { useI18n } from "@/lib/i18n-context"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { BalanceDisplay } from "@/components/balance-display"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Send, Zap, User, Copy, Check } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { mockUser, mockConsumption, mockStock, mockTransactions } from "@/lib/mock-data"

export default function DashboardPage() {
  const { isConnected, userProfile } = useWallet()
  const { t } = useI18n()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [userStockKwh, setUserStockKwh] = useState(mockUser.stockKwh)
  const [transactions, setTransactions] = useState(mockTransactions)

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  useEffect(() => {
    const savedStockKwh = localStorage.getItem("userStockKwh")
    const savedHistory = localStorage.getItem("transactionHistory")

    if (savedStockKwh) {
      setUserStockKwh(Number.parseFloat(savedStockKwh))
    }
    if (savedHistory) {
      const history = JSON.parse(savedHistory)
      setTransactions(history.slice(0, 3)) // Show only last 3
    }
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />
      case "send":
        return <Send className="w-5 h-5 text-primary" />
      case "zap":
        return <Zap className="w-5 h-5 text-warning" />
      default:
        return null
    }
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(mockUser.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64">
        <DashboardHeader />

        <div className="p-4 md:p-6">
          {userProfile && (
            <Card
              id="user-info-section"
              className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 scroll-mt-4"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                    {userProfile.avatar ? (
                      <img
                        src={userProfile.avatar || "/placeholder.svg"}
                        alt={userProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      {t("dashboard.welcome")} {userProfile.name}!
                    </h2>
                    <div className="flex items-center gap-2">
                      <p className="text-muted-foreground text-sm md:text-base">{mockUser.shortAddress}</p>
                      <button
                        onClick={handleCopyAddress}
                        className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-primary/10"
                        title={copied ? t("common.copied") : t("common.copyAddress")}
                      >
                        {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            {/* Columna Izquierda */}
            <div className="space-y-4 md:space-y-6">
              {/* Balance Card */}
              <Card className="glass-card border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">{t("dashboard.balance")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BalanceDisplay amount={mockUser.balance} symbol="$ENERGY" fiatValue={mockUser.balanceUSD} />
                  <Button className="w-full gradient-primary text-white font-semibold">
                    {t("dashboard.swap")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Stock Acumulado */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">{t("dashboard.availableKwh")}</CardTitle>
                  <CardDescription>{t("dashboard.last7days")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-success mb-4">{userStockKwh.toFixed(1)} kWh</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={mockStock}>
                      <defs>
                        <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(5, 150, 105)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="rgb(5, 150, 105)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgb(var(--color-card))",
                          border: "1px solid rgb(var(--color-border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="kwh"
                        stroke="rgb(5, 150, 105)"
                        fill="url(#stockGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Consumo Mes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">{t("dashboard.consumption")}</CardTitle>
                  <CardDescription>{t("dashboard.last7days")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-4">
                    {mockUser.consumptionThisMonth} kWh
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={mockConsumption}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(3, 0, 171)" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="rgb(141, 232, 242)" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgb(var(--color-card))",
                          border: "1px solid rgb(var(--color-border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="kwh" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
