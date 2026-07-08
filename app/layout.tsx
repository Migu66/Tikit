import type { Metadata } from 'next'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const archivo = Archivo({
    subsets: ['latin'],
    axes: ['wdth'],
    variable: '--font-archivo',
    display: 'swap',
})

const plexMono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-plex-mono',
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Tikit',
    description: 'Gestiona tus tickets de compra de forma inteligente',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html suppressHydrationWarning>
            <body className={`${archivo.variable} ${plexMono.variable}`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
