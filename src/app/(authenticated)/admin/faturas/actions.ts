'use server'

import { financeService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { CreateAdminInvoiceParams } from '@/lib/services/interfaces/finance-service'

const SAFE_ERRORS: Record<string, string> = {
  NOT_FOUND: 'Fatura não encontrada.',
  CONFLICT: 'Fatura já foi processada.',
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
  BAD_REQUEST: 'Dados inválidos.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function createAdminInvoice(
  data: CreateAdminInvoiceParams,
): Promise<{ success: boolean; error?: string }> {
  const subscriptionId =
    typeof data.subscriptionId === 'string' ? data.subscriptionId.trim() : ''
  const amount = typeof data.amount === 'number' ? data.amount : NaN
  const dueDate =
    typeof data.dueDate === 'string' ? data.dueDate.trim() : ''

  if (!subscriptionId) {
    return { success: false, error: 'ID da assinatura é obrigatório.' }
  }
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Valor deve ser maior que zero.' }
  }
  if (!dueDate) {
    return { success: false, error: 'Data de vencimento é obrigatória.' }
  }

  try {
    await financeService.createAdminInvoice({ subscriptionId, amount, dueDate })
    revalidatePath('/admin/faturas')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar fatura.') }
  }
}

export async function markAdminInvoicePaid(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await financeService.markAdminInvoicePaid(id)
    revalidatePath('/admin/faturas')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: safeError(error, 'Erro ao marcar fatura como paga.'),
    }
  }
}

export async function cancelAdminInvoice(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await financeService.cancelAdminInvoice(id)
    revalidatePath('/admin/faturas')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: safeError(error, 'Erro ao cancelar fatura.'),
    }
  }
}
