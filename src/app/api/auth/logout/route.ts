import { NextResponse } from 'next/server'
import { authService } from '@/lib/services'

export async function POST() {
  await authService.logout()
  return NextResponse.json({ ok: true })
}
