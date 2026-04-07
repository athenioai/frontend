'use server'

import { planService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { CreatePlanParams, UpdatePlanParams } from '@/lib/services/interfaces/plan-service'

const SAFE_ERRORS: Record<string, string> = {
  CONFLICT: 'Plano com este nome já existe.',
  NOT_FOUND: 'Plano não encontrado.',
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function createPlan(
  data: CreatePlanParams,
): Promise<{ success: boolean; error?: string }> {
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  const cost = typeof data.cost === 'number' ? data.cost : NaN

  if (!name || name.length > 255) {
    return { success: false, error: 'Nome é obrigatório (máx. 255 caracteres).' }
  }
  if (isNaN(cost) || cost < 0 || cost > 999999.99) {
    return { success: false, error: 'Custo inválido.' }
  }

  try {
    await planService.create({ name, cost: Math.round(cost * 100) / 100 })
    revalidatePath('/admin/planos')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar plano.') }
  }
}

export async function updatePlan(
  id: string,
  data: UpdatePlanParams,
): Promise<{ success: boolean; error?: string }> {
  const patch: UpdatePlanParams = {}

  if (data.name !== undefined) {
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    if (!name || name.length > 255) {
      return { success: false, error: 'Nome é obrigatório (máx. 255 caracteres).' }
    }
    patch.name = name
  }

  if (data.cost !== undefined) {
    const cost = typeof data.cost === 'number' ? data.cost : NaN
    if (isNaN(cost) || cost < 0 || cost > 999999.99) {
      return { success: false, error: 'Custo inválido.' }
    }
    patch.cost = Math.round(cost * 100) / 100
  }

  try {
    await planService.update(id, patch)
    revalidatePath('/admin/planos')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao atualizar plano.') }
  }
}

export async function deletePlan(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await planService.delete(id)
    revalidatePath('/admin/planos')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao deletar plano.') }
  }
}
