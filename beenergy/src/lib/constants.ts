export const COLORS = {
  primary: "#059669",
  secondary: "#0300AB",
  accent: "#8DE8F2",
  success: "#FCC544",
  warning: "#F97316",
  error: "#EF4444",
  background: "#FFFFFF",
  foreground: "#1F2937",
  surface: "#F2F2F2",
} as const

export const ROUTES = {
  HOME: "/",
  CONNECT_WALLET: "/connect-wallet",
  DASHBOARD: "/dashboard",
  MARKETPLACE: "/marketplace",
  SUCCESS: "/success",
  ERROR: "/error",
} as const

export const MOCK_DATA = {
  user: {
    address: "0GAB54WLVK5VFBNBYMV5G52VFVSPTXKLP4PQFBWRR2BQRQR3P7YFZXM",
    name: "María González",
    balance: 150.25,
    priceXLM: 0.85,
  },
  dashboard: {
    kwhAccumulated: 1250.5,
    consumptionData: [
      { hour: "00:00", kwh: 2.5 },
      { hour: "04:00", kwh: 2.1 },
      { hour: "08:00", kwh: 3.8 },
      { hour: "12:00", kwh: 4.2 },
      { hour: "16:00", kwh: 5.1 },
      { hour: "20:00", kwh: 3.5 },
    ],
  },
  marketplace: [
    { id: 1, quantity: 50, price: 0.85, seller: "0xAB...CD", timestamp: "2025-11-21" },
    { id: 2, quantity: 30, price: 0.9, seller: "0xDE...FG", timestamp: "2025-11-21" },
    { id: 3, quantity: 75, price: 0.82, seller: "0xHI...JK", timestamp: "2025-11-21" },
    { id: 4, quantity: 20, price: 0.95, seller: "0xLM...NO", timestamp: "2025-11-21" },
  ],
} as const
