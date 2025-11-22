"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/lib/wallet-context"
import { useI18n } from "@/lib/i18n-context"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ShoppingCart, Send } from "lucide-react"
import Link from "next/link"

export default function ActivityPage() {
  const { isConnected } = useWallet()
  const { t } = useI18n()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64">
        <DashboardHeader />

        <div className="p-4 md:p-6">
          <Button onClick={() => router.push("/dashboard")} variant="ghost" className="mb-4 hover:bg-muted">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>

          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/activity/purchases">
              <Card className="hover:bg-muted/50 transition-all cursor-pointer h-full group border-2 hover:border-primary">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-success/10 group-hover:bg-success/20 transition-colors">
                      <ShoppingCart className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{t("activity.purchases")}</CardTitle>
                      <CardDescription>{t("activity.purchasesDescription")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t("activity.lastTwoMonths")}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/activity/sales">
              <Card className="hover:bg-muted/50 transition-all cursor-pointer h-full group border-2 hover:border-primary">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Send className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{t("activity.sales")}</CardTitle>
                      <CardDescription>{t("activity.salesDescription")}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t("activity.lastTwoMonths")}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
