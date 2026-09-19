import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

/** Client errors are the caller's fault — retrying them only wastes battery. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status !== undefined && status >= 400 && status < 500) {
      return false;
    }
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
});
