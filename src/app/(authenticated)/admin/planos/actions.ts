'use server'

import { planService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { CreatePlanParams, UpdatePlanParams } from '@/lib/services/interfaces/plan-service'

export async function createPlan(
  data: CreatePlanParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    await planService.create(data)
    revalidatePath('/admin/planos')
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message === 'CONFLICT') {
      return { success: false, error: 'Plano com este nome já existe.' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar plano',
    }
  }
}

export async function updatePlan(
  id: string,
  data: UpdatePlanParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    await planService.update(id, data)
    revalidatePath('/admin/planos')
    return { success: true }
  } catch (error) {
    if (error instanceof Error && error.message === 'CONFLICT') {
      return { success: false, error: 'Plano com este nome já existe.' }
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar plano',
    }
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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar plano',
    }
  }
}
