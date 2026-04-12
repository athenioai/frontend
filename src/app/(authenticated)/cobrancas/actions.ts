'use server'

import { financeService } from '@/lib/services'
import { revalidatePath } from 'next/cache'

const SAFE_ERRORS: Record<string, string> = {
  NOT_FOUND: 'Cobrança não encontrada.',
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function markInvoicePaid(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await financeService.markInvoicePaid(id)
    revalidatePath('/cobrancas')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao marcar como pago.') }
  }
}

export async function cancelInvoice(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await financeService.cancelInvoice(id)
    revalidatePath('/cobrancas')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao cancelar cobrança.') }
  }
}
