import type { Metadata } from 'next'
import { Space_Grotesk, Sora, Instrument_Serif } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
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

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Athenio.ai — Dashboard',
  description: 'Painel de controle da sua operação com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${sora.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bg-base text-text-primary antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
