'use server'

import { financeService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type {
  CreateServiceParams,
  UpdateServiceParams,
  CreateProductParams,
  UpdateProductParams,
} from '@/lib/services/interfaces/finance-service'

const SAFE_ERRORS: Record<string, string> = {
  NOT_FOUND: 'Recurso não encontrado.',
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
  CONFLICT: 'Item com este nome já existe.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

// ── Services ──

export async function createService(
  data: CreateServiceParams,
): Promise<{ success: boolean; error?: string }> {
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  const price = typeof data.price === 'number' ? data.price : NaN

  if (!name || name.length > 255) {
    return { success: false, error: 'Nome é obrigatório (máx. 255 caracteres).' }
  }
  if (isNaN(price) || price < 0 || price > 999999.99) {
    return { success: false, error: 'Preço inválido.' }
  }

  const pixDiscountPercent =
    typeof data.pixDiscountPercent === 'number' ? data.pixDiscountPercent : 0
  const cardDiscountPercent =
    typeof data.cardDiscountPercent === 'number' ? data.cardDiscountPercent : 0

  if (pixDiscountPercent < 0 || pixDiscountPercent > 100) {
    return { success: false, error: 'Desconto PIX deve estar entre 0 e 100.' }
  }
  if (cardDiscountPercent < 0 || cardDiscountPercent > 100) {
    return { success: false, error: 'Desconto Cartão deve estar entre 0 e 100.' }
  }

  const specialDiscountPercent =
    typeof data.specialDiscountPercent === 'number' ? data.specialDiscountPercent : 0
  if (specialDiscountPercent < 0 || specialDiscountPercent > 100) {
    return { success: false, error: 'Desconto especial deve estar entre 0 e 100.' }
  }

  try {
    await financeService.createService({
      name,
      description: data.description,
      price: Math.round(price * 100) / 100,
      pixDiscountPercent,
      cardDiscountPercent,
      specialDiscountName: data.specialDiscountName ?? null,
      specialDiscountPercent,
      specialDiscountStartsAt: data.specialDiscountStartsAt ?? null,
      specialDiscountEndsAt: data.specialDiscountEndsAt ?? null,
    })
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar serviço.') }
  }
}

export async function updateService(
  id: string,
  data: UpdateServiceParams,
): Promise<{ success: boolean; error?: string }> {
  const patch: UpdateServiceParams = {}

  if (data.name !== undefined) {
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    if (!name || name.length > 255) {
      return { success: false, error: 'Nome é obrigatório (máx. 255 caracteres).' }
    }
    patch.name = name
  }

  if (data.description !== undefined) {
    patch.description = data.description
  }

  if (data.price !== undefined) {
    const price = typeof data.price === 'number' ? data.price : NaN
    if (isNaN(price) || price < 0 || price > 999999.99) {
      return { success: false, error: 'Preço inválido.' }
    }
    patch.price = Math.round(price * 100) / 100
  }

  if (data.pixDiscountPercent !== undefined) {
    if (data.pixDiscountPercent < 0 || data.pixDiscountPercent > 100) {
      return { success: false, error: 'Desconto PIX deve estar entre 0 e 100.' }
    }
    patch.pixDiscountPercent = data.pixDiscountPercent
  }

  if (data.cardDiscountPercent !== undefined) {
    if (data.cardDiscountPercent < 0 || data.cardDiscountPercent > 100) {
      return { success: false, error: 'Desconto Cartão deve estar entre 0 e 100.' }
    }
    patch.cardDiscountPercent = data.cardDiscountPercent
  }

  if (data.specialDiscountName !== undefined) {
    patch.specialDiscountName = data.specialDiscountName
  }
  if (data.specialDiscountPercent !== undefined) {
    if (data.specialDiscountPercent !== null && (data.specialDiscountPercent < 0 || data.specialDiscountPercent > 100)) {
      return { success: false, error: 'Desconto especial deve estar entre 0 e 100.' }
    }
    patch.specialDiscountPercent = data.specialDiscountPercent
  }
  if (data.specialDiscountStartsAt !== undefined) {
    patch.specialDiscountStartsAt = data.specialDiscountStartsAt
  }
  if (data.specialDiscountEndsAt !== undefined) {
    patch.specialDiscountEndsAt = data.specialDiscountEndsAt
  }

  if (data.active !== undefined) {
    patch.active = data.active
  }

  try {
    await financeService.updateService(id, patch)
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao atualizar serviço.') }
  }
}

export async function deleteService(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await financeService.deleteService(id)
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao deletar serviço.') }
  }
}

// ── Products ──

export async function createProduct(
  data: CreateProductParams,
): Promise<{ success: boolean; error?: string }> {
  const name = typeof data.name === 'string' ? data.name.trim() : ''
  const price = typeof data.price === 'number' ? data.price : NaN

  if (!name || name.length > 255) {
    return { success: false, error: 'Nome é obrigatório (máx. 255 caracteres).' }
  }
  if (isNaN(price) || price < 0 || price > 999999.99) {
    return { success: false, error: 'Preço inválido.' }
  }

  const pixDiscountPercent =
    typeof data.pixDiscountPercent === 'number' ? data.pixDiscountPercent : 0
  const cardDiscountPercent =
    typeof data.cardDiscountPercent === 'number' ? data.cardDiscountPercent : 0

  if (pixDiscountPercent < 0 || pixDiscountPercent > 100) {
    return { success: false, error: 'Desconto PIX deve estar entre 0 e 100.' }
  }
  if (cardDiscountPercent < 0 || cardDiscountPercent > 100) {
    return { success: false, error: 'Desconto Cartão deve estar entre 0 e 100.' }
  }

  const specialDiscountPercent =
    typeof data.specialDiscountPercent === 'number' ? data.specialDiscountPercent : 0
  if (specialDiscountPercent < 0 || specialDiscountPercent > 100) {
    return { success: false, error: 'Desconto especial deve estar entre 0 e 100.' }
  }

  try {
    await financeService.createProduct({
      name,
      description: data.description,
      price: Math.round(price * 100) / 100,
      pixDiscountPercent,
      cardDiscountPercent,
      specialDiscountName: data.specialDiscountName ?? null,
      specialDiscountPercent,
      specialDiscountStartsAt: data.specialDiscountStartsAt ?? null,
      specialDiscountEndsAt: data.specialDiscountEndsAt ?? null,
    })
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar produto.') }
  }
}

export async function updateProduct(
  id: string,
  data: UpdateProductParams,
): Promise<{ success: boolean; error?: string }> {
  const patch: UpdateProductParams = {}

  if (data.name !== undefined) {
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    if (!name || name.length > 255) {
      return { success: false, error: 'Nome é obrigatório (máx. 255 caracteres).' }
    }
    patch.name = name
  }

  if (data.description !== undefined) {
    patch.description = data.description
  }

  if (data.price !== undefined) {
    const price = typeof data.price === 'number' ? data.price : NaN
    if (isNaN(price) || price < 0 || price > 999999.99) {
      return { success: false, error: 'Preço inválido.' }
    }
    patch.price = Math.round(price * 100) / 100
  }

  if (data.pixDiscountPercent !== undefined) {
    if (data.pixDiscountPercent < 0 || data.pixDiscountPercent > 100) {
      return { success: false, error: 'Desconto PIX deve estar entre 0 e 100.' }
    }
    patch.pixDiscountPercent = data.pixDiscountPercent
  }

  if (data.cardDiscountPercent !== undefined) {
    if (data.cardDiscountPercent < 0 || data.cardDiscountPercent > 100) {
      return { success: false, error: 'Desconto Cartão deve estar entre 0 e 100.' }
    }
    patch.cardDiscountPercent = data.cardDiscountPercent
  }

  if (data.specialDiscountName !== undefined) {
    patch.specialDiscountName = data.specialDiscountName
  }
  if (data.specialDiscountPercent !== undefined) {
    if (data.specialDiscountPercent !== null && (data.specialDiscountPercent < 0 || data.specialDiscountPercent > 100)) {
      return { success: false, error: 'Desconto especial deve estar entre 0 e 100.' }
    }
    patch.specialDiscountPercent = data.specialDiscountPercent
  }
  if (data.specialDiscountStartsAt !== undefined) {
    patch.specialDiscountStartsAt = data.specialDiscountStartsAt
  }
  if (data.specialDiscountEndsAt !== undefined) {
    patch.specialDiscountEndsAt = data.specialDiscountEndsAt
  }

  if (data.active !== undefined) {
    patch.active = data.active
  }

  try {
    await financeService.updateProduct(id, patch)
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao atualizar produto.') }
  }
}

export async function deleteProduct(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await financeService.deleteProduct(id)
    revalidatePath('/catalogo')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao deletar produto.') }
  }
}
