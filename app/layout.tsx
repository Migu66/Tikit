import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tikit',
  description: 'Gestiona tus tickets de compra de forma inteligente',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
