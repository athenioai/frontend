import { NextResponse } from 'next/server'
import { campaignService } from '@/lib/services'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const data = await campaignService.getPerformance(id)
  return NextResponse.json(data)
}
