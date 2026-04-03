import { NextResponse } from 'next/server'
import { authService, companyService } from '@/lib/services'

export async function GET() {
  const user = await authService.getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const company = await companyService.getById(user.company_id)
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

  return NextResponse.json(company)
}

export async function PUT(request: Request) {
  const user = await authService.getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  const updated = await companyService.updateConfig(user.company_id, data)

  return NextResponse.json(updated)
}
