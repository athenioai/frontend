'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { financeService } from '@/lib/services'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function todayMidnight() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const CreateInvoiceSchema = z.object({
  leadId: z.string().regex(UUID_RE, 'Selecione um cliente.'),
  type: z.enum(['service', 'product', 'manual']),
  referenceId: z
    .string()
    .optional()
    .transform((v) => (v && UUID_RE.test(v) ? v : undefined)),
  description: z
    .string()
    .min(1, 'Descrição é obrigatória.')
    .max(500, 'Descrição máx. 500 caracteres.')
    .transform((s) => s.trim()),
  amount: z
    .number('Valor inválido.')
    .positive('Valor deve ser maior que zero.')
    .max(999999.99, 'Valor máximo R$999.999,99.')
    .transform((n) => Math.round(n * 100) / 100),
  paymentMethod: z.enum(['pix', 'card']).optional(),
  dueDate: z
    .string()
    .regex(DATE_RE, 'Data de vencimento inválida.')
    .refine((d) => {
      const parsed = new Date(d + 'T00:00:00')
      return !isNaN(parsed.getTime()) && parsed >= todayMidnight()
    }, 'Data de vencimento não pode ser no passado.'),
  appointmentId: z
    .string()
    .optional()
    .transform((v) => (v && UUID_RE.test(v) ? v : undefined)),
  lateFeePercent: z
    .number('Multa inválida.')
    .min(0, 'Multa deve estar entre 0% e 100%.')
    .max(100, 'Multa deve estar entre 0% e 100%.')
    .default(2),
  lateInterestType: z
    .enum(['simple', 'compound'], { message: 'Tipo de juros inválido.' })
    .default('simple'),
  lateInterestPercent: z
    .number('Juros inválido.')
    .min(0, 'Juros deve estar entre 0% e 100%.')
    .max(100, 'Juros deve estar entre 0% e 100%.')
    .default(1),
})

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
  params: unknown,
): Promise<{ success: boolean; error?: string }> {
  const parsed = CreateInvoiceSchema.safeParse(params)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const data = parsed.data

  try {
    await financeService.createInvoice({
      leadId: data.leadId,
      type: data.type,
      referenceId: data.referenceId,
      description: data.description,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      dueDate: data.dueDate,
      appointmentId: data.appointmentId,
      lateFeePercent: data.lateFeePercent,
      lateInterestType: data.lateInterestType,
      lateInterestPercent: data.lateInterestPercent,
    })
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao criar cobrança.') }
  }

  redirect('/cobrancas')
}
