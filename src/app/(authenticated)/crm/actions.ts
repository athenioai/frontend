'use server'

import { leadService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type {
  LeadBoard,
  LeadPublic,
  LeadStatus,
  TimelineEntry,
  TimelineEntryType,
} from '@/lib/services/interfaces/lead-service'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LEN = 320
const MAX_NAME_LEN = 255
const MAX_PHONE_LEN = 50
const MAX_METADATA_SIZE = 10_000

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id)
}

const VALID_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost']
const VALID_TIMELINE_TYPES: TimelineEntryType[] = ['message', 'appointment', 'status_change']

function isValidStatus(s: unknown): s is LeadStatus {
  return typeof s === 'string' && VALID_STATUSES.includes(s as LeadStatus)
}

function isValidTimelineType(t: unknown): t is TimelineEntryType {
  return typeof t === 'string' && VALID_TIMELINE_TYPES.includes(t as TimelineEntryType)
}

function isValidMetadata(m: unknown): boolean {
  if (m === null || m === undefined) return true
  if (typeof m !== 'object' || Array.isArray(m)) return false
  try {
    return JSON.stringify(m).length <= MAX_METADATA_SIZE
  } catch {
    return false
  }
}

const SAFE_ERRORS: Record<string, string> = {
  NOT_AUTHENTICATED: 'Sessao expirada. Faca login novamente.',
  NOT_FOUND: 'Lead nao encontrado.',
  VALIDATION_ERROR: 'Dados invalidos. Verifique os campos.',
  CONFLICT: 'Ja existe um lead com este email.',
  FORBIDDEN: 'Voce nao tem permissao para acessar este lead.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function fetchBoard(): Promise<{
  success: boolean
  data?: LeadBoard
  error?: string
}> {
  try {
    const data = await leadService.getBoard()
    return { success: true, data }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao carregar o board.') }
  }
}

export async function createLead(
  name: string,
  email: string,
  phone?: string,
): Promise<{ success: boolean; data?: LeadPublic; error?: string }> {
  if (typeof name !== 'string' || !name.trim()) {
    return { success: false, error: 'Nome e obrigatorio.' }
  }
  if (name.trim().length > MAX_NAME_LEN) {
    return { success: false, error: 'Nome deve ter no maximo 255 caracteres.' }
  }

  if (typeof email !== 'string' || !email.trim()) {
    return { success: false, error: 'Email e obrigatorio.' }
  }
  if (email.trim().length > MAX_EMAIL_LEN) {
    return { success: false, error: 'Email deve ter no maximo 320 caracteres.' }
  }
  if (!EMAIL_RE.test(email.trim())) {
    return { success: false, error: 'Email invalido.' }
  }

  if (phone !== undefined && typeof phone === 'string' && phone.length > MAX_PHONE_LEN) {
    return { success: false, error: 'Telefone deve ter no maximo 50 caracteres.' }
  }

  try {
    const data = await leadService.createLead({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || undefined,
    })
    revalidatePath('/crm')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar lead.') }
  }
}

export async function updateLead(
  id: string,
  payload: {
    name?: string
    email?: string
    phone?: string | null
    status?: LeadStatus
    metadata?: Record<string, unknown> | null
  },
): Promise<{ success: boolean; data?: LeadPublic; error?: string }> {
  if (!isValidId(id)) return { success: false, error: 'ID invalido.' }

  if (payload.name !== undefined) {
    if (!payload.name.trim()) return { success: false, error: 'Nome nao pode ser vazio.' }
    if (payload.name.trim().length > MAX_NAME_LEN) {
      return { success: false, error: 'Nome deve ter no maximo 255 caracteres.' }
    }
  }

  if (payload.email !== undefined) {
    if (payload.email.trim().length > MAX_EMAIL_LEN) {
      return { success: false, error: 'Email deve ter no maximo 320 caracteres.' }
    }
    if (!EMAIL_RE.test(payload.email.trim())) {
      return { success: false, error: 'Email invalido.' }
    }
  }

  if (payload.phone !== undefined && payload.phone !== null && payload.phone.length > MAX_PHONE_LEN) {
    return { success: false, error: 'Telefone deve ter no maximo 50 caracteres.' }
  }

  if (payload.status !== undefined && !isValidStatus(payload.status)) {
    return { success: false, error: 'Status invalido.' }
  }

  if (payload.metadata !== undefined && !isValidMetadata(payload.metadata)) {
    return { success: false, error: 'Metadata invalido ou muito grande.' }
  }

  try {
    const data = await leadService.updateLead(id, payload)
    revalidatePath('/crm')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao atualizar lead.') }
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<{ success: boolean; data?: LeadPublic; error?: string }> {
  if (!isValidId(id)) return { success: false, error: 'ID invalido.' }
  if (!isValidStatus(status)) return { success: false, error: 'Status invalido.' }

  try {
    const data = await leadService.updateLead(id, { status })
    revalidatePath('/crm')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao mover lead.') }
  }
}

export async function deleteLead(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  if (!isValidId(id)) return { success: false, error: 'ID invalido.' }

  try {
    await leadService.deleteLead(id)
    revalidatePath('/crm')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao deletar lead.') }
  }
}

export async function fetchTimeline(
  id: string,
  limit?: number,
  type?: TimelineEntryType,
): Promise<{ success: boolean; data?: TimelineEntry[]; error?: string }> {
  if (!isValidId(id)) return { success: false, error: 'ID invalido.' }

  if (limit !== undefined) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
      return { success: false, error: 'Limite deve ser entre 1 e 200.' }
    }
  }

  if (type !== undefined && !isValidTimelineType(type)) {
    return { success: false, error: 'Tipo de timeline invalido.' }
  }

  try {
    const result = await leadService.getTimeline(id, { limit, type })
    return { success: true, data: result.data }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao carregar timeline.') }
  }
}
