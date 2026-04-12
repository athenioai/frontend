'use server'

import { redirect } from 'next/navigation'
import { financeService } from '@/lib/services'
import type { CreateInvoiceParams } from '@/lib/services/interfaces/finance-service'

const SAFE_ERRORS: Record<string, string> = {
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
  NOT_FOUND: 'Recurso não encontrado.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function createInvoice(
  params: CreateInvoiceParams,
): Promise<{ success: boolean; error?: string }> {
  const leadId = typeof params.leadId === 'string' ? params.leadId.trim() : ''
  const description = typeof params.description === 'string' ? params.description.trim() : ''
  const amount = typeof params.amount === 'number' ? params.amount : NaN
  const dueDate = typeof params.dueDate === 'string' ? params.dueDate.trim() : ''

  if (!leadId) {
    return { success: false, error: 'Selecione um cliente.' }
  }
  if (!description || description.length > 500) {
    return { success: false, error: 'Descrição é obrigatória (máx. 500 caracteres).' }
  }
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Valor deve ser maior que zero.' }
  }
  if (!dueDate) {
    return { success: false, error: 'Data de vencimento é obrigatória.' }
  }

  try {
    await financeService.createInvoice(params)
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar cobrança.') }
  }

  redirect('/cobrancas')
}
