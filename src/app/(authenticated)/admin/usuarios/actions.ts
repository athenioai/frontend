'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

const SAFE_ERRORS: Record<string, string> = {
  CONFLICT: 'Email já cadastrado.',
  INVALID_PLAN: 'Plano inválido ou deletado.',
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
}

export async function createUser(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email')
  const planId = formData.get('plan_id')
  const contract = formData.get('contract')

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { success: false, error: 'Email inválido.' }
  }
  if (!planId || typeof planId !== 'string') {
    return { success: false, error: 'Selecione um plano.' }
  }
  if (!contract || !(contract instanceof File) || contract.size === 0) {
    return { success: false, error: 'Selecione o contrato (PDF).' }
  }
  if (contract.type !== 'application/pdf') {
    return { success: false, error: 'O arquivo deve ser um PDF.' }
  }
  if (contract.size > 10 * 1024 * 1024) {
    return { success: false, error: 'O arquivo deve ter no máximo 10MB.' }
  }

  // Forward FormData directly to the API
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return { success: false, error: 'Sessão expirada.' }

  try {
    const res = await fetch(`${API_URL}/admin/users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (!res.ok) {
      if (res.status === 409) return { success: false, error: SAFE_ERRORS.CONFLICT }
      if (res.status === 422) return { success: false, error: SAFE_ERRORS.INVALID_PLAN }
      return { success: false, error: 'Erro ao criar usuário.' }
    }

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao criar usuário.' }
  }
}
