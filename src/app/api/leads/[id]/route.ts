import { NextResponse } from 'next/server'
import { mockLeads, mockConversations, mockPayments, mockCampaigns } from '@/lib/services/mock/data'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const lead = mockLeads.find((l) => l.id === id)
  if (!lead) return NextResponse.json(null, { status: 404 })

  const conversations = mockConversations
    .filter((c) => c.lead_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const payments = mockPayments
    .filter((p) => p.lead_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const campaign = lead.utm_source.campaign
    ? mockCampaigns.find((c) => c.id === lead.utm_source.campaign) ?? null
    : null

  return NextResponse.json({
    lead,
    conversations,
    payments,
    campaign,
  })
}
