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
  } catch {
    return { error: 'Email ou senha inválidos.' }
  }

  redirect('/dashboard')
}
