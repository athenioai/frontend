'use server'

import { calendarConfigService, channelAccountService, financeService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { UpdateCalendarConfigParams } from '@/lib/services/interfaces/calendar-config-service'
import type { SupportedChannel } from '@/lib/services/interfaces/channel-account-service'

export async function updateCalendarConfig(
  params: UpdateCalendarConfigParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    await calendarConfigService.update(params)
    revalidatePath('/configuracoes')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao salvar configuração.' }
  }
}

const SUPPORTED_CHANNELS = ['whatsapp', 'telegram']

const SAFE_ERRORS: Record<string, string> = {
  NOT_AUTHENTICATED: 'Sessão expirada. Faça login novamente.',
  CONFLICT: 'Este canal já está conectado.',
  BAD_REQUEST: 'Token inválido ou rejeitado pelo serviço.',
  UPSTREAM_ERROR: 'Serviço de canais indisponível. Tente novamente.',
  NOT_FOUND: 'Canal não encontrado.',
}

function safeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message in SAFE_ERRORS) {
    return SAFE_ERRORS[error.message]
  }
  return fallback
}

export async function connectChannel(
  channel: string,
  accessToken: string,
): Promise<{ success: boolean; error?: string }> {
  if (!SUPPORTED_CHANNELS.includes(channel)) {
    return { success: false, error: 'Canal não suportado.' }
  }

  if (typeof accessToken !== 'string' || accessToken.trim().length === 0) {
    return { success: false, error: 'Token de acesso é obrigatório.' }
  }

  if (accessToken.length > 500) {
    return { success: false, error: 'Token de acesso muito longo.' }
  }

  try {
    await channelAccountService.connect({
      channel: channel as SupportedChannel,
      access_token: accessToken.trim(),
    })
    revalidatePath('/configuracoes')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao conectar canal.') }
  }
}

export async function disconnectChannel(
  channel: string,
): Promise<{ success: boolean; error?: string }> {
  if (!SUPPORTED_CHANNELS.includes(channel)) {
    return { success: false, error: 'Canal não suportado.' }
  }

  try {
    await channelAccountService.disconnect(channel as SupportedChannel)
    revalidatePath('/configuracoes')
    return { success: true }
  } catch (error) {
    return { success: false, error: safeError(error, 'Erro ao desconectar canal.') }
  }
}

export async function togglePrepayment(
  enabled: boolean,
): Promise<{ success: boolean; error?: string }> {
  if (typeof enabled !== 'boolean') {
    return { success: false, error: 'Valor inválido.' }
  }

  try {
    await financeService.updatePrepaymentSetting(enabled)
    revalidatePath('/configuracoes')
    return { success: true }
  } catch {
    return { success: false, error: 'Erro ao salvar configuração de pagamento.' }
  }
}
