import { QueryClient } from '@tanstack/react-query';

let browserQueryClient: QueryClient | undefined;

/** Builds a QueryClient with app defaults. */
const makeQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

/** New client per server render; one shared client in the browser. */
export const getQueryClient = (): QueryClient => {
  if (typeof window === 'undefined') return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
};
