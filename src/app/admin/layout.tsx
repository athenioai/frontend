import { redirect } from 'next/navigation'
import { authService } from '@/lib/services'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await authService.getSession()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen">
      <Sidebar isAdmin />
      <div className="lg:pl-60">
        <Topbar userName={user.nome} isAdmin />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
