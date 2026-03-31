import { redirect } from 'next/navigation'
import { authService, campaignService } from '@/lib/services'
import { CampaignGrid } from './campaign-grid'

export default async function CampanhasPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const campaigns = await campaignService.getAll(user.empresa_id)

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Campanhas</h1>
      <CampaignGrid campaigns={campaigns} />
    </div>
  )
}
