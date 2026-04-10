import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'BizCalc — Business Cost Calculator',
  description: 'Calculate fixed costs, variable costs, and total business costs per month',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'DM Mono', monospace" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
