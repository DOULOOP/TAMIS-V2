import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'TAMIS - Tehlike Anında Mühedale İzleme Sistemi',
  description: 'Instant Hazard Engineering Monitoring System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
