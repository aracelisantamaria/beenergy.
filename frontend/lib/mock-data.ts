// Mock data para demo de BeEnergy

export const mockUser = {
  address: "G4K2VXNJ5WQRTHGFDSAPLMNBVCXZAQWERTYUIOP9X9B1",
  shortAddress: "G4K2...X9B1",
  balance: 1234,
  balanceUSD: 520,
  stockKwh: 87.5,
  consumptionThisMonth: 142.3,
  generationThisMonth: 210.5,
  defindexEnabled: true,
  defindexAPY: 8.5,
  defindexInterestToday: 0.285,
  defindexInterestThisMonth: 8.75,
  defindexVaultBalance: 1234,
}

export const mockEnergyRanking = [
  { id: 1, name: "María G.", address: "G7Y3KML4RTH8PLQW5XN9ZV2F6J1K4L2", savingsPercent: 42, stars: 5, zkVerified: true },
  { id: 2, name: "Carlos R.", address: "F2M8PQW3NRT6YKL9XHV1ZJ4C5B7A8D9", savingsPercent: 38, stars: 4, zkVerified: true },
  { id: 3, name: "Ana L.", address: "H4K9LXC2VBN7TQW6PMZ3RF1J8Y5M4N3", savingsPercent: 35, stars: 4, zkVerified: true },
  { id: 4, name: "Pedro M.", address: "P6R1WQX4JKL9NVB2THY8MZC5F3G7D2K", savingsPercent: 31, stars: 3, zkVerified: false },
  { id: 5, name: "Laura S.", address: "M3N7YFG9QWX2PKL6RHV4JZC1TB8D5N9", savingsPercent: 28, stars: 3, zkVerified: true },
]

export const mockConsumption = [
  { day: "Lun", kwh: 18 },
  { day: "Mar", kwh: 22 },
  { day: "Mié", kwh: 20 },
  { day: "Jue", kwh: 25 },
  { day: "Vie", kwh: 19 },
  { day: "Sáb", kwh: 15 },
  { day: "Dom", kwh: 23 },
]

export const mockStock = [
  { day: "Lun", kwh: 82 },
  { day: "Mar", kwh: 84 },
  { day: "Mié", kwh: 86 },
  { day: "Jue", kwh: 85 },
  { day: "Vie", kwh: 87 },
  { day: "Sáb", kwh: 88 },
  { day: "Dom", kwh: 87.5 },
]

export const mockTransactions = [
  {
    id: 1,
    type: "compra",
    description: "Compra de energía",
    amount: "+25 kWh",
    time: "Hace 2h",
    icon: "success",
  },
  {
    id: 2,
    type: "venta",
    description: "Venta al mercado",
    amount: "-10 kWh",
    time: "Hace 5h",
    icon: "send",
  },
  {
    id: 3,
    type: "consumo",
    description: "Consumo doméstico",
    amount: "-8 kWh",
    time: "Hace 1d",
    icon: "zap",
  },
]

export const mockOffers = [
  {
    id: 1,
    seller: "G7Y3KML4RTH8PLQW5XN9ZV2F6J1K4L2",
    sellerShort: "G7Y3...K4L2",
    amount: 50,
    pricePerKwh: 0.5,
    total: 25,
  },
  {
    id: 2,
    seller: "F2M8PQW3NRT6YKL9XHV1ZJ4C5B7A8D9",
    sellerShort: "F2M8...A8D9",
    amount: 30,
    pricePerKwh: 0.48,
    total: 14.4,
  },
  {
    id: 3,
    seller: "H4K9LXC2VBN7TQW6PMZ3RF1J8Y5M4N3",
    sellerShort: "H4K9...M4N3",
    amount: 75,
    pricePerKwh: 0.52,
    total: 39,
  },
  {
    id: 4,
    seller: "P6R1WQX4JKL9NVB2THY8MZC5F3G7D2K",
    sellerShort: "P6R1...D2K",
    amount: 40,
    pricePerKwh: 0.49,
    total: 19.6,
  },
  {
    id: 5,
    seller: "M3N7YFG9QWX2PKL6RHV4JZC1TB8D5N9",
    sellerShort: "M3N7...D5N9",
    amount: 60,
    pricePerKwh: 0.51,
    total: 30.6,
  },
  {
    id: 6,
    seller: "L8T4VXN2HKW9JPQ5RMY6FCZ3GB1D7K4",
    sellerShort: "L8T4...D7K4",
    amount: 45,
    pricePerKwh: 0.47,
    total: 21.15,
  },
]

export function generateIdenticon(address: string): string {
  // Genera un color basado en el hash del address
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = hash % 360
  return `hsl(${hue}, 65%, 55%)`
}
