import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { useUrlParams } from './useUrlParams';

export function useTransactions() {
  const { getUrlTransactions } = useUrlParams();
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactionsV2', []);

  // Initialize transactions from URL params if available
  useEffect(() => {
    const sharedTransactions = getUrlTransactions();
    
    if (sharedTransactions) {
      try {
        const parsedTransactions = JSON.parse(sharedTransactions);
        setTransactions(parsedTransactions);
      } catch (error) {
        console.error('Error parsing transactions from URL', error);
      }
    }
  }, []);

  return [transactions, setTransactions] as const;
}
