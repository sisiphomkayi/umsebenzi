import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Umsebenzi - Africa\'s Work Ecosystem',
  description: 'Connect, work, grow. Find verified workers or get hired across Africa.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1B3A6B',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              style: { background: '#10B981' },
            },
            error: {
              style: { background: '#EF4444' },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}
