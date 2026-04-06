import { redirect } from 'next/navigation'
import { authService } from '@/lib/services'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen">
      {children}
    </main>
  )
}
