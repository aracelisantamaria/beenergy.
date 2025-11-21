export interface User {
  address: string
  name: string
  balance: number
  priceXLM: number
}

export interface Offer {
  id: number
  quantity: number
  price: number
  seller: string
  timestamp: string
}

export interface ConsumptionData {
  hour: string
  kwh: number
}
