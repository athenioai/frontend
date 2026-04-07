import { redirect } from 'next/navigation'
import { authService } from '@/lib/services'
import { Sidebar } from '@/components/sidebar'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={user.name} isAdmin={user.role === 'admin'} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-14 shrink-0 lg:hidden" aria-hidden="true" />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
