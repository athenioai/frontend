'use server'

import { calendarConfigService } from '@/lib/services'
import { revalidatePath } from 'next/cache'
import type { UpdateCalendarConfigParams } from '@/lib/services/interfaces/calendar-config-service'

export async function updateCalendarConfig(
  params: UpdateCalendarConfigParams,
): Promise<{ success: boolean; error?: string }> {
  try {
    await calendarConfigService.update(params)
    revalidatePath('/agenda/configuracao')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao salvar configuração',
    }
  }
}
