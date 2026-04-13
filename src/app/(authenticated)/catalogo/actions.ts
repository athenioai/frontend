'use server'

import { z } from 'zod'
import { financeService } from '@/lib/services'
import { revalidatePath } from 'next/cache'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const IdSchema = z.string().regex(UUID_RE, 'ID inválido.')

const priceSchema = z
  .number('Preço inválido.')
  .positive('Preço deve ser maior que zero.')
  .max(999999.99, 'Preço máximo excedido.')
  .transform((n) => Math.round(n * 100) / 100)

const discountSchema = z.number().min(0).max(100)

const nameSchema = z
  .string()
  .min(1, 'Nome é obrigatório.')
  .max(255, 'Nome máx. 255 caracteres.')
  .transform((s) => s.trim())

const CreateServiceSchema = z.object({
  name: nameSchema,
  description: z.string().max(500, 'Descrição máx. 500 caracteres.').optional(),
  price: priceSchema,
  pixDiscountPercent: discountSchema.default(0),
  cardDiscountPercent: discountSchema.default(0),
  specialDiscountName: z.string().nullable().optional(),
  specialDiscountPercent: discountSchema.default(0),
  specialDiscountStartsAt: z.string().nullable().optional(),
  specialDiscountEndsAt: z.string().nullable().optional(),
  agentInstructions: z.string().max(2000).optional(),
})

const UpdateServiceSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(500, 'Descrição máx. 500 caracteres.').optional(),
  price: priceSchema.optional(),
  pixDiscountPercent: discountSchema.optional(),
  cardDiscountPercent: discountSchema.optional(),
  specialDiscountName: z.string().nullable().optional(),
  specialDiscountPercent: z.number().min(0).max(100).nullable().optional(),
  specialDiscountStartsAt: z.string().nullable().optional(),
  specialDiscountEndsAt: z.string().nullable().optional(),
  agentInstructions: z.string().max(2000).optional(),
  active: z.boolean().optional(),
})

const CreateProductSchema = CreateServiceSchema
const UpdateProductSchema = UpdateServiceSchema

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

function firstError(e: z.ZodError): string {
  return e.issues[0]?.message ?? 'Dados inválidos.'
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Magic bytes for image format validation (not just file.type which is spoofable)
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
}

async function validateMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 8).arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const signatures = MAGIC_BYTES[file.type]
  if (!signatures) return false
  return signatures.some((sig) => sig.every((b, i) => bytes[i] === b))
}

async function extractImage(formData: FormData): Promise<{ image?: File; error?: string }> {
  const file = formData.get('image')
  if (!file || !(file instanceof File) || file.size === 0) {
    return {}
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { error: 'Formato de imagem inválido. Use JPEG, PNG ou WebP.' }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { error: 'Imagem muito grande. Máximo 5MB.' }
  }

  if (!(await validateMagicBytes(file))) {
    return { error: 'Arquivo não é uma imagem válida.' }
  }

  return { image: file }
}

function extractFormFields(formData: FormData): Record<string, unknown> {
  const fields: Record<string, unknown> = {}

  const name = formData.get('name')
  if (typeof name === 'string') fields.name = name

  const description = formData.get('description')
  if (typeof description === 'string') fields.description = description || undefined

  const price = formData.get('price')
  if (typeof price === 'string' && price !== '') fields.price = parseFloat(price)

  const pixDiscountPercent = formData.get('pixDiscountPercent')
  if (typeof pixDiscountPercent === 'string' && pixDiscountPercent !== '')
    fields.pixDiscountPercent = parseFloat(pixDiscountPercent)

  const cardDiscountPercent = formData.get('cardDiscountPercent')
  if (typeof cardDiscountPercent === 'string' && cardDiscountPercent !== '')
    fields.cardDiscountPercent = parseFloat(cardDiscountPercent)

  const specialDiscountName = formData.get('specialDiscountName')
  if (typeof specialDiscountName === 'string')
    fields.specialDiscountName = specialDiscountName || null

  const specialDiscountPercent = formData.get('specialDiscountPercent')
  if (typeof specialDiscountPercent === 'string' && specialDiscountPercent !== '')
    fields.specialDiscountPercent = parseFloat(specialDiscountPercent)

  const specialDiscountStartsAt = formData.get('specialDiscountStartsAt')
  if (typeof specialDiscountStartsAt === 'string')
    fields.specialDiscountStartsAt = specialDiscountStartsAt || null

  const specialDiscountEndsAt = formData.get('specialDiscountEndsAt')
  if (typeof specialDiscountEndsAt === 'string')
    fields.specialDiscountEndsAt = specialDiscountEndsAt || null

  const agentInstructions = formData.get('agentInstructions')
  if (typeof agentInstructions === 'string')
    fields.agentInstructions = agentInstructions || undefined

  const active = formData.get('active')
  if (typeof active === 'string') fields.active = active === 'true'

  return fields
}

// ── Services ──

export async function createService(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const { image, error: imageError } = await extractImage(formData)
  if (imageError) return { success: false, error: imageError }

  const fields = extractFormFields(formData)
  const parsed = CreateServiceSchema.safeParse(fields)
  if (!parsed.success) return { success: false, error: firstError(parsed.error) }

  try {
    await financeService.createService({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      pixDiscountPercent: parsed.data.pixDiscountPercent,
      cardDiscountPercent: parsed.data.cardDiscountPercent,
      specialDiscountName: parsed.data.specialDiscountName ?? undefined,
      specialDiscountPercent: parsed.data.specialDiscountPercent,
      specialDiscountStartsAt: parsed.data.specialDiscountStartsAt ?? undefined,
      specialDiscountEndsAt: parsed.data.specialDiscountEndsAt ?? undefined,
      agentInstructions: parsed.data.agentInstructions,
      image,
    })
    revalidatePath('/servicos')
    revalidatePath('/produtos')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar serviço.') }
  }
}

export async function updateService(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const idParsed = IdSchema.safeParse(id)
  if (!idParsed.success) return { success: false, error: 'ID inválido.' }

  const { image, error: imageError } = await extractImage(formData)
  if (imageError) return { success: false, error: imageError }

  const fields = extractFormFields(formData)
  const parsed = UpdateServiceSchema.safeParse(fields)
  if (!parsed.success) return { success: false, error: firstError(parsed.error) }

  try {
    await financeService.updateService(idParsed.data, {
      ...parsed.data,
      image,
    })
    revalidatePath('/servicos')
    revalidatePath('/produtos')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao atualizar serviço.') }
  }
}

export async function deleteService(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = IdSchema.safeParse(id)
  if (!parsed.success) return { success: false, error: 'ID inválido.' }
  try {
    await financeService.deleteService(parsed.data)
    revalidatePath('/servicos')
    revalidatePath('/produtos')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao deletar serviço.') }
  }
}

// ── Products ──

export async function createProduct(
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const { image, error: imageError } = await extractImage(formData)
  if (imageError) return { success: false, error: imageError }

  const fields = extractFormFields(formData)
  const parsed = CreateProductSchema.safeParse(fields)
  if (!parsed.success) return { success: false, error: firstError(parsed.error) }

  try {
    await financeService.createProduct({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      pixDiscountPercent: parsed.data.pixDiscountPercent,
      cardDiscountPercent: parsed.data.cardDiscountPercent,
      specialDiscountName: parsed.data.specialDiscountName ?? undefined,
      specialDiscountPercent: parsed.data.specialDiscountPercent,
      specialDiscountStartsAt: parsed.data.specialDiscountStartsAt ?? undefined,
      specialDiscountEndsAt: parsed.data.specialDiscountEndsAt ?? undefined,
      agentInstructions: parsed.data.agentInstructions,
      image,
    })
    revalidatePath('/servicos')
    revalidatePath('/produtos')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar produto.') }
  }
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const idParsed = IdSchema.safeParse(id)
  if (!idParsed.success) return { success: false, error: 'ID inválido.' }

  const { image, error: imageError } = await extractImage(formData)
  if (imageError) return { success: false, error: imageError }

  const fields = extractFormFields(formData)
  const parsed = UpdateProductSchema.safeParse(fields)
  if (!parsed.success) return { success: false, error: firstError(parsed.error) }

  try {
    await financeService.updateProduct(idParsed.data, {
      ...parsed.data,
      image,
    })
    revalidatePath('/servicos')
    revalidatePath('/produtos')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao atualizar produto.') }
  }
}

export async function deleteProduct(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  const parsed = IdSchema.safeParse(id)
  if (!parsed.success) return { success: false, error: 'ID inválido.' }
  try {
    await financeService.deleteProduct(parsed.data)
    revalidatePath('/servicos')
    revalidatePath('/produtos')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao deletar produto.') }
  }
}
