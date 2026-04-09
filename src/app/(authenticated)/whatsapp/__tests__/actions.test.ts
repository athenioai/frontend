import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockService = {
  disconnect: vi.fn(),
  sendText: vi.fn(),
  sendTextSequence: vi.fn(),
  getStatus: vi.fn(),
}

vi.mock('@/lib/services', () => ({
  whatsAppService: mockService,
}))

const {
  disconnectWhatsAppInstance,
  sendWhatsAppText,
  sendWhatsAppTextSequence,
  fetchWhatsAppStatus,
} = await import('../actions')

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('WhatsApp Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('disconnectWhatsAppInstance', () => {
    it('disconnects instance', async () => {
      mockService.disconnect.mockResolvedValue({ status: 'disconnected' })

      const result = await disconnectWhatsAppInstance(VALID_UUID)

      expect(result.success).toBe(true)
    })

    it('rejects non-UUID id', async () => {
      const result = await disconnectWhatsAppInstance('../../admin')

      expect(result.success).toBe(false)
      expect(mockService.disconnect).not.toHaveBeenCalled()
    })
  })

  describe('sendWhatsAppText', () => {
    it('sends text with sanitized phone', async () => {
      mockService.sendText.mockResolvedValue({ message_id: 'msg-1' })

      const result = await sendWhatsAppText(VALID_UUID, '+55 (11) 99999-9999', 'Hello')

      expect(result.success).toBe(true)
      expect(mockService.sendText).toHaveBeenCalledWith(VALID_UUID, {
        to: '5511999999999',
        content: 'Hello',
      })
    })

    it('rejects non-UUID instanceId', async () => {
      const result = await sendWhatsAppText('not-uuid', '5511999999999', 'Hello')

      expect(result.success).toBe(false)
      expect(mockService.sendText).not.toHaveBeenCalled()
    })

    it('rejects short phone', async () => {
      const result = await sendWhatsAppText(VALID_UUID, '123', 'Hello')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Número inválido')
    })

    it('rejects empty message', async () => {
      const result = await sendWhatsAppText(VALID_UUID, '5511999999999', '   ')

      expect(result.success).toBe(false)
      expect(result.error).toContain('vazia')
    })

    it('rejects message over 4096 chars', async () => {
      const result = await sendWhatsAppText(VALID_UUID, '5511999999999', 'a'.repeat(4097))

      expect(result.success).toBe(false)
      expect(result.error).toContain('4096')
    })
  })

  describe('sendWhatsAppTextSequence', () => {
    it('sends message sequence', async () => {
      mockService.sendTextSequence.mockResolvedValue({ message_ids: ['msg-1'] })

      const result = await sendWhatsAppTextSequence(VALID_UUID, '5511999999999', ['Hello'])

      expect(result.success).toBe(true)
    })

    it('rejects empty messages', async () => {
      const result = await sendWhatsAppTextSequence(VALID_UUID, '5511999999999', [])

      expect(result.success).toBe(false)
    })

    it('rejects more than 10 messages', async () => {
      const result = await sendWhatsAppTextSequence(VALID_UUID, '5511999999999', Array(11).fill('msg'))

      expect(result.success).toBe(false)
    })
  })

  describe('fetchWhatsAppStatus', () => {
    it('returns status detail', async () => {
      mockService.getStatus.mockResolvedValue({
        status: 'connected',
        messages_sent_today: 10,
        messages_received_today: 25,
        messages_sent_week: 80,
        messages_received_week: 150,
      })

      const result = await fetchWhatsAppStatus(VALID_UUID)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('connected')
    })

    it('rejects empty id', async () => {
      const result = await fetchWhatsAppStatus('')

      expect(result.success).toBe(false)
    })
  })
})
