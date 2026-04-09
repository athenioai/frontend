import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'mock-token' }),
  }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const { WhatsAppService } = await import('../whatsapp-service')

describe('WhatsAppService', () => {
  let service: InstanceType<typeof WhatsAppService>

  beforeEach(() => {
    service = new WhatsAppService()
    mockFetch.mockReset()
  })

  describe('listInstances', () => {
    it('fetches all instances', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: '1', status: 'connected', display_name: 'Vendas' },
          ]),
      })

      const result = await service.listInstances()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/whatsapp/instances'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        }),
      )
      expect(result).toHaveLength(1)
      expect(result[0].display_name).toBe('Vendas')
    })

    it('throws on non-array response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: false, error: 'Bad' }),
      })

      await expect(service.listInstances()).rejects.toThrow('Bad')
    })

    it('throws on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Server error' }),
      })

      await expect(service.listInstances()).rejects.toThrow('Server error')
    })
  })

  describe('getInstance', () => {
    it('fetches a single instance', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ id: '1', status: 'connected', display_name: 'Vendas' }),
      })

      const result = await service.getInstance('1')
      expect(result.id).toBe('1')
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.getInstance('x')).rejects.toThrow('NOT_FOUND')
    })
  })

  describe('deleteInstance', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      await service.deleteInstance('1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/whatsapp/instances/1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.deleteInstance('x')).rejects.toThrow('NOT_FOUND')
    })
  })

  describe('disconnect', () => {
    it('sends POST to disconnect', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'disconnected' }),
      })

      const result = await service.disconnect('1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/whatsapp/instances/1/disconnect'),
        expect.objectContaining({ method: 'POST' }),
      )
      expect(result.status).toBe('disconnected')
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.disconnect('x')).rejects.toThrow('NOT_FOUND')
    })
  })

  describe('getStatus', () => {
    it('returns instance status detail', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'connected',
            messages_sent_today: 10,
            messages_received_today: 25,
            messages_sent_week: 80,
            messages_received_week: 150,
          }),
      })

      const result = await service.getStatus('1')

      expect(result.status).toBe('connected')
      expect(result.messages_sent_today).toBe(10)
      expect(result.messages_received_week).toBe(150)
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.getStatus('x')).rejects.toThrow('NOT_FOUND')
    })
  })

  describe('sendText', () => {
    it('sends POST with phone and content', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message_id: 'msg-1' }),
      })

      const result = await service.sendText('1', {
        to: '5511999999999',
        content: 'Hello',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/whatsapp/instances/1/send/text'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ to: '5511999999999', content: 'Hello' }),
        }),
      )
      expect(result.message_id).toBe('msg-1')
    })

    it('throws VALIDATION_ERROR on 400', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      })

      await expect(
        service.sendText('1', { to: 'invalid', content: 'Hi' }),
      ).rejects.toThrow('VALIDATION_ERROR')
    })
  })

  describe('sendTextSequence', () => {
    it('sends POST with messages array', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message_ids: ['msg-1', 'msg-2'] }),
      })

      const result = await service.sendTextSequence('1', {
        to: '5511999999999',
        messages: ['Hello', 'World'],
      })

      expect(result.message_ids).toHaveLength(2)
    })

    it('throws VALIDATION_ERROR on 400', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      })

      await expect(
        service.sendTextSequence('1', { to: 'bad', messages: [] }),
      ).rejects.toThrow('VALIDATION_ERROR')
    })
  })

  describe('authentication', () => {
    it('throws NOT_AUTHENTICATED when no token', async () => {
      const { cookies } = await import('next/headers')
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as never)

      await expect(service.listInstances()).rejects.toThrow('NOT_AUTHENTICATED')
    })
  })
})
