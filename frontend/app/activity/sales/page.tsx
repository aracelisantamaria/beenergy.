"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/lib/wallet-context"
import { useI18n } from "@/lib/i18n-context"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Send } from "lucide-react"

interface Transaction {
  id: string
  type: "compra" | "venta"
  description: string
  amount: string
  time: string
  date: Date
}

export default function SalesPage() {
  const { isConnected } = useWallet()
  const { t } = useI18n()
  const router = useRouter()
  const [sales, setSales] = useState<Transaction[]>([])

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  useEffect(() => {
    const savedHistory = localStorage.getItem("transactionHistory")
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      const twoMonthsAgo = new Date()
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

      const filtered = parsed
        .map((tx: any) => ({
          ...tx,
          date: new Date(tx.time),
        }))
        .filter((tx: Transaction) => tx.type === "venta" && tx.date >= twoMonthsAgo)
        .sort((a: Transaction, b: Transaction) => b.date.getTime() - a.date.getTime())

      setSales(filtered)
    }
  }, [])

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64">
        <DashboardHeader />

        <div className="p-4 md:p-6">
          <Button onClick={() => router.push("/activity")} variant="ghost" className="mb-4 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl">{t("activity.sales")}</CardTitle>
                  <CardDescription>{t("activity.salesDescription")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sales.length > 0 ? (
                  sales.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors border border-border"
                    >
                      <div className="flex-shrink-0">
                        <Send className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm md:text-base">{tx.description}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{tx.time}</p>
                      </div>
                      <div className="flex-shrink-0 font-semibold text-sm md:text-base text-primary">{tx.amount}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">{t("activity.noSales")}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
