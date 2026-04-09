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
  const pdfHeader = new TextDecoder().decode(await contract.slice(0, 5).arrayBuffer())
  if (!pdfHeader.startsWith('%PDF-')) {
    return { success: false, error: 'Arquivo PDF inválido.' }
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

    // Create WhatsApp instance for the new user
    await fetch(`${API_URL}/whatsapp/instances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    }).catch(() => {})

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao criar usuário.' }
  }
}

export async function uploadContract(
  userId: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const contract = formData.get('contract')

  if (!contract || !(contract instanceof File) || contract.size === 0) {
    return { success: false, error: 'Selecione o contrato (PDF).' }
  }
  if (contract.type !== 'application/pdf') {
    return { success: false, error: 'O arquivo deve ser um PDF.' }
  }
  if (contract.size > 10 * 1024 * 1024) {
    return { success: false, error: 'O arquivo deve ter no máximo 10MB.' }
  }
  const pdfCheck = new TextDecoder().decode(await contract.slice(0, 5).arrayBuffer())
  if (!pdfCheck.startsWith('%PDF-')) {
    return { success: false, error: 'Arquivo PDF inválido.' }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return { success: false, error: 'Sessão expirada.' }

  try {
    const body = new FormData()
    body.append('contract', contract)

    const res = await fetch(`${API_URL}/admin/users/${userId}/contract`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body,
    })

    if (!res.ok) {
      return { success: false, error: 'Erro ao enviar contrato.' }
    }

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao enviar contrato.' }
  }
}
