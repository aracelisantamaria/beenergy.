"use client"

import { useState } from "react"
import { useWallet } from "@/lib/wallet-context"
import { CONTRACTS, STELLAR_CONFIG, NETWORK_PASSPHRASE } from "@/lib/contracts-config"
import * as StellarSdk from "@stellar/stellar-sdk"

export function useEnergyToken() {
  const { address, kit } = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Get balance of $ENERGY tokens for the current user
   */
  const getBalance = async (userAddress?: string): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)

      const targetAddress = userAddress || address
      if (!targetAddress) {
        throw new Error("No wallet connected")
      }

      if (!CONTRACTS.ENERGY_TOKEN) {
        throw new Error("Energy token contract not configured")
      }

      const server = new StellarSdk.SorobanRpc.Server(STELLAR_CONFIG.RPC_URL)

      // Build the contract call to get balance
      const contract = new StellarSdk.Contract(CONTRACTS.ENERGY_TOKEN)
      const account = await server.getAccount(targetAddress)

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "balance",
            StellarSdk.nativeToScVal(targetAddress, { type: "address" })
          )
        )
        .setTimeout(30)
        .build()

      const simulatedResult = await server.simulateTransaction(transaction)

      if (StellarSdk.SorobanRpc.Api.isSimulationSuccess(simulatedResult)) {
        const balance = StellarSdk.scValToNative(simulatedResult.result!.retval)
        // Convert from 7 decimals to readable format
        return (Number(balance) / 10000000).toFixed(2)
      }

      throw new Error("Failed to get balance")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      console.error("Error getting balance:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Transfer $ENERGY tokens to another address
   */
  const transfer = async (to: string, amount: number): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)

      if (!address || !kit) {
        throw new Error("No wallet connected")
      }

      if (!CONTRACTS.ENERGY_TOKEN) {
        throw new Error("Energy token contract not configured")
      }

      // Convert amount to contract format (7 decimals)
      const amountInStroops = Math.floor(amount * 10000000)

      const server = new StellarSdk.SorobanRpc.Server(STELLAR_CONFIG.RPC_URL)
      const contract = new StellarSdk.Contract(CONTRACTS.ENERGY_TOKEN)
      const account = await server.getAccount(address)

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: "100000", // Higher fee for contract invocation
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "transfer",
            StellarSdk.nativeToScVal(address, { type: "address" }),
            StellarSdk.nativeToScVal(to, { type: "address" }),
            StellarSdk.nativeToScVal(amountInStroops, { type: "i128" })
          )
        )
        .setTimeout(30)
        .build()

      // Prepare and sign transaction
      const preparedTx = await server.prepareTransaction(transaction)
      const { signedTxXdr } = await kit.signTransaction(preparedTx.toXDR())
      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedTxXdr,
        NETWORK_PASSPHRASE
      )

      // Submit transaction
      const result = await server.sendTransaction(signedTransaction as StellarSdk.Transaction)

      if (result.status === "PENDING") {
        // Poll for transaction result
        let getResponse = await server.getTransaction(result.hash)

        while (getResponse.status === "NOT_FOUND") {
          await new Promise(resolve => setTimeout(resolve, 1000))
          getResponse = await server.getTransaction(result.hash)
        }

        if (getResponse.status === "SUCCESS") {
          return result.hash
        }
      }

      throw new Error("Transaction failed")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      console.error("Error transferring tokens:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Burn $ENERGY tokens (when consuming energy)
   */
  const burnEnergy = async (amount: number): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)

      if (!address || !kit) {
        throw new Error("No wallet connected")
      }

      if (!CONTRACTS.ENERGY_TOKEN) {
        throw new Error("Energy token contract not configured")
      }

      const amountInStroops = Math.floor(amount * 10000000)

      const server = new StellarSdk.SorobanRpc.Server(STELLAR_CONFIG.RPC_URL)
      const contract = new StellarSdk.Contract(CONTRACTS.ENERGY_TOKEN)
      const account = await server.getAccount(address)

      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: "100000",
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          contract.call(
            "burn_energy",
            StellarSdk.nativeToScVal(address, { type: "address" }),
            StellarSdk.nativeToScVal(amountInStroops, { type: "i128" })
          )
        )
        .setTimeout(30)
        .build()

      const preparedTx = await server.prepareTransaction(transaction)
      const { signedTxXdr } = await kit.signTransaction(preparedTx.toXDR())
      const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
        signedTxXdr,
        NETWORK_PASSPHRASE
      )

      const result = await server.sendTransaction(signedTransaction as StellarSdk.Transaction)

      if (result.status === "PENDING") {
        let getResponse = await server.getTransaction(result.hash)

        while (getResponse.status === "NOT_FOUND") {
          await new Promise(resolve => setTimeout(resolve, 1000))
          getResponse = await server.getTransaction(result.hash)
        }

        if (getResponse.status === "SUCCESS") {
          return result.hash
        }
      }

      throw new Error("Transaction failed")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      console.error("Error burning tokens:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    getBalance,
    transfer,
    burnEnergy,
    isLoading,
    error,
  }
}
