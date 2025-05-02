import React from 'react'
import {QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

export const QueryPrvider = ({children}) => {
  return (
    <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>
  )
}

