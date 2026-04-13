'use server'

import { z } from 'zod'
import { agentConfigService } from '@/lib/services'
import { revalidatePath } from 'next/cache'

const UpdateAgentConfigSchema = z.object({
  agentName: z
    .string()
    .min(1, 'Nome do agente é obrigatório.')
    .max(100, 'Nome máx. 100 caracteres.')
    .transform((s) => s.trim()),
  tone: z.enum(['friendly', 'formal', 'casual'], {
    message: 'Tom de voz inválido.',
  }),
  customInstructions: z
    .string()
    .max(2000, 'Instruções máx. 2000 caracteres.')
    .nullable()
    .transform((v) => (v?.trim() === '' ? null : v?.trim() ?? null)),
})

const SAFE_ERRORS: Record<string, string> = {
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function updateAgentConfig(
  data: unknown,
): Promise<{ success: boolean; error?: string }> {
  const parsed = UpdateAgentConfigSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  try {
    await agentConfigService.updateConfig(parsed.data)
    revalidatePath('/configuracoes')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao salvar configuração do agente.') }
  }
}
