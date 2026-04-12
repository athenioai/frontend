'use server'

import { financeService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type {
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
} from '@/lib/services/interfaces/finance-service'

const SAFE_ERRORS: Record<string, string> = {
  NOT_FOUND: 'Assinatura não encontrada.',
  CONFLICT: 'Assinatura já existe para este usuário.',
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
  BAD_REQUEST: 'Dados inválidos.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function createSubscription(
  data: CreateSubscriptionParams,
): Promise<{ success: boolean; error?: string }> {
  const userId = typeof data.userId === 'string' ? data.userId.trim() : ''
  const planId = typeof data.planId === 'string' ? data.planId.trim() : ''
  const billingDay =
    typeof data.billingDay === 'number' ? data.billingDay : NaN

  if (!userId) {
    return { success: false, error: 'ID do usuário é obrigatório.' }
  }
  if (!planId) {
    return { success: false, error: 'ID do plano é obrigatório.' }
  }
  if (isNaN(billingDay) || billingDay < 1 || billingDay > 28) {
    return { success: false, error: 'Dia de vencimento deve ser entre 1 e 28.' }
  }

  try {
    await financeService.createSubscription({ userId, planId, billingDay })
    revalidatePath('/admin/assinaturas')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar assinatura.') }
  }
}

export async function updateSubscription(
  id: string,
  data: UpdateSubscriptionParams,
): Promise<{ success: boolean; error?: string }> {
  const patch: UpdateSubscriptionParams = {}

  if (data.planId !== undefined) {
    const planId = typeof data.planId === 'string' ? data.planId.trim() : ''
    if (!planId) {
      return { success: false, error: 'ID do plano é obrigatório.' }
    }
    patch.planId = planId
  }

  if (data.billingDay !== undefined) {
    const billingDay =
      typeof data.billingDay === 'number' ? data.billingDay : NaN
    if (isNaN(billingDay) || billingDay < 1 || billingDay > 28) {
      return {
        success: false,
        error: 'Dia de vencimento deve ser entre 1 e 28.',
      }
    }
    patch.billingDay = billingDay
  }

  if (data.status !== undefined) {
    const validStatuses = ['active', 'suspended', 'cancelled']
    if (!validStatuses.includes(data.status)) {
      return { success: false, error: 'Status inválido.' }
    }
    patch.status = data.status
  }

  try {
    await financeService.updateSubscription(id, patch)
    revalidatePath('/admin/assinaturas')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: safeError(error, 'Erro ao atualizar assinatura.'),
    }
  }
}
