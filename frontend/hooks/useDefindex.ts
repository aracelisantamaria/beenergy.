/**
 * useDefindex Hook
 * Hook personalizado para interactuar con DeFindex API
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/wallet-context';

export interface DefindexStats {
  balance: number;
  apy: number;
  interestToday: number;
  interestThisMonth: number;
}

export interface VaultInfo {
  address: string;
  name: string;
  symbol: string;
  totalAssets: number;
  apy: number;
}

export function useDefindex() {
  const { address } = useWallet();
  const [stats, setStats] = useState<DefindexStats | null>(null);
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vaultAddress = process.env.NEXT_PUBLIC_DEFINDEX_VAULT_ADDRESS;

  /**
   * Obtiene las estadísticas de rendimiento del usuario
   */
  const fetchStats = useCallback(async (userAddress?: string) => {
    if (!vaultAddress) {
      setError('Vault address not configured');
      return;
    }

    const targetAddress = userAddress || address;
    if (!targetAddress) {
      setError('User address not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/defindex/stats/${vaultAddress}/${targetAddress}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data.data);
    } catch (err) {
      console.error('Error fetching DeFindex stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [vaultAddress, address]);

  /**
   * Obtiene información del vault
   */
  const fetchVaultInfo = useCallback(async () => {
    if (!vaultAddress) {
      setError('Vault address not configured');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/defindex/vault/${vaultAddress}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch vault info');
      }

      setVaultInfo(data.data);
    } catch (err) {
      console.error('Error fetching vault info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [vaultAddress]);

  /**
   * Genera una transacción de depósito
   */
  const deposit = useCallback(async (amount: number, userAddress?: string) => {
    if (!vaultAddress) {
      throw new Error('Vault address not configured');
    }

    const targetAddress = userAddress || address;
    if (!targetAddress) {
      throw new Error('User address not available');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/defindex/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vaultAddress,
          amount,
          userAddress: targetAddress,
          invest: true,
          slippageBps: 100,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate deposit transaction');
      }

      return data.data.transaction;
    } catch (err) {
      console.error('Error generating deposit:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [vaultAddress, address]);

  /**
   * Genera una transacción de retiro
   */
  const withdraw = useCallback(async (amount: number, userAddress?: string) => {
    if (!vaultAddress) {
      throw new Error('Vault address not configured');
    }

    const targetAddress = userAddress || address;
    if (!targetAddress) {
      throw new Error('User address not available');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/defindex/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vaultAddress,
          amount,
          userAddress: targetAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate withdraw transaction');
      }

      return data.data.transaction;
    } catch (err) {
      console.error('Error generating withdraw:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [vaultAddress, address]);

  /**
   * Verifica el estado de la API
   */
  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/defindex/health');
      const data = await response.json();
      return data.healthy || false;
    } catch (err) {
      console.error('Error checking DeFindex health:', err);
      return false;
    }
  }, []);

  // Auto-fetch stats cuando cambia el usuario
  useEffect(() => {
    if (address && vaultAddress) {
      fetchStats();
      fetchVaultInfo();
    }
  }, [address, vaultAddress, fetchStats, fetchVaultInfo]);

  return {
    stats,
    vaultInfo,
    loading,
    error,
    fetchStats,
    fetchVaultInfo,
    deposit,
    withdraw,
    checkHealth,
  };
}

export default useDefindex;
