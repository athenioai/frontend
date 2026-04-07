import { authService } from '@/lib/services'
import { notFound } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await authService.getSession()
  if (!user || user.role !== 'admin') notFound()

  return <>{children}</>
}
