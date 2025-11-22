"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/lib/wallet-context"
import { useI18n } from "@/lib/i18n-context"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ConsumptionData {
  month: string
  kwh: number
  year: number
}

export default function ConsumptionPage() {
  const { isConnected } = useWallet()
  const { t } = useI18n()
  const router = useRouter()
  const [selectedYear, setSelectedYear] = useState<string>("2024")

  const [consumptionData] = useState<ConsumptionData[]>([
    { month: "Ene", kwh: 135, year: 2024 },
    { month: "Feb", kwh: 128, year: 2024 },
    { month: "Mar", kwh: 142, year: 2024 },
    { month: "Abr", kwh: 138, year: 2024 },
    { month: "May", kwh: 145, year: 2024 },
    { month: "Jun", kwh: 152, year: 2024 },
    { month: "Jul", kwh: 158, year: 2024 },
    { month: "Ago", kwh: 149, year: 2024 },
    { month: "Sep", kwh: 143, year: 2024 },
    { month: "Oct", kwh: 137, year: 2024 },
    { month: "Nov", kwh: 142, year: 2024 },
    { month: "Dic", kwh: 0, year: 2024 },
  ])

  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  const filteredData = consumptionData.filter((data) => selectedYear === "all" || data.year.toString() === selectedYear)

  const totalConsumption = filteredData.reduce((sum, data) => sum + data.kwh, 0)

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

          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">{t("sidebar.consumption")}</CardTitle>
              <CardDescription>{t("consumption.description")}</CardDescription>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground text-lg">{totalConsumption} kWh</span>{" "}
                  {t("consumption.total")}
                </div>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t("activity.selectYear")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("activity.allYears")}</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Bar dataKey="kwh" fill="#F2C230" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
