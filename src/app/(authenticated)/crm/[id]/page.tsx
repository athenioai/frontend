import { notFound } from 'next/navigation'
import { leadService } from '@/lib/services'
import { LeadDetailView } from './_components/lead-detail-view'

interface LeadPageProps {
  params: Promise<{ id: string }>
}

export default async function LeadPage({ params }: LeadPageProps) {
  const { id } = await params

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(id)) notFound()

  try {
    const [lead, timelineResult] = await Promise.all([
      leadService.getLead(id),
      leadService.getTimeline(id, { limit: 50 }),
    ])

    return <LeadDetailView lead={lead} timeline={timelineResult.data} />
  } catch {
    notFound()
  }
}
