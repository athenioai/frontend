'use server'

import { calendarConfigService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { UpdateCalendarConfigParams } from '@/lib/services/interfaces/calendar-config-service'

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
