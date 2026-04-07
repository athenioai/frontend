import type { Metadata } from 'next'
import { Space_Grotesk, Sora } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-title',
  weight: ['400', '500', '600', '700'],
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Olympus - Sua Empresa Autônoma',
  description: 'Painel de controle da sua operação com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`dark ${spaceGrotesk.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bg-base text-text-primary antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
