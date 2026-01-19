'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
      <Toaster position="top-right" />
    </NextAuthSessionProvider>
  )
}
