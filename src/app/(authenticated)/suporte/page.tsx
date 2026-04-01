import { redirect } from 'next/navigation'
import { authService } from '@/lib/services'
import { mockSupportTickets, mockSupportMessages } from '@/lib/services/mock/data'
import { SupportChat } from '@/components/support/support-chat'

export default async function SuportePage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const tickets = [...mockSupportTickets].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  )

  return <SupportChat tickets={tickets} messages={mockSupportMessages} />
}
