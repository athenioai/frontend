'use server'

import { authService } from '@/lib/services'
import { redirect } from 'next/navigation'

export async function logoutAction() {
  await authService.logout()
  redirect('/login')
}
