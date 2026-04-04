import { authService, conversationService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { ConversationPanel } from '@/components/conversations/conversation-panel'

export default async function ConversasPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const conversations = await conversationService.list(user.company_id)

  return (
    <div className="-mx-4 -my-8 sm:-mx-6 lg:-mx-8">
      <ConversationPanel initialConversations={conversations} />
    </div>
  )
}
