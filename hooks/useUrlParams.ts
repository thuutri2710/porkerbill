import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function useUrlParams() {
  const router = useRouter();
  const queryParams = useSearchParams();

  // Handle URL parameters and clean up the URL after processing
  useEffect(() => {
    if (queryParams.get("transactions") || queryParams.get("users")) {
      router.push("/", { shallow: true });
    }
  }, []);

  // Extract users from URL parameters
  const getUrlUsers = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const href = window.location.href;
    return href
      ? new URL(decodeURI(encodeURI(href))).searchParams.get("users") || null
      : null;
  };

  // Extract transactions from URL parameters
  const getUrlTransactions = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const href = window.location.href;
    return href
      ? new URL(decodeURI(encodeURI(href))).searchParams.get("transactions") || null
      : null;
  };

  return {
    getUrlUsers,
    getUrlTransactions
  };
}
