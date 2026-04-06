'use server'

import { redirect } from 'next/navigation'
import { authService } from '@/lib/services'

export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Preencha todos os campos.' }
  }

  try {
    await authService.login(email, password)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao fazer login.'
    return { error: message }
  }

  redirect('/dashboard')
}
