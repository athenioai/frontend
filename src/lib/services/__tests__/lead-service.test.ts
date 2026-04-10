import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'mock-token' }),
  }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const { LeadService } = await import('../lead-service')

describe('LeadService', () => {
  let service: InstanceType<typeof LeadService>

  beforeEach(() => {
    service = new LeadService()
    mockFetch.mockReset()
  })

  describe('getBoard', () => {
    it('fetches the kanban board', async () => {
      const board = { new: [], contacted: [], qualified: [], converted: [], lost: [] }
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(board),
      })

      const result = await service.getBoard()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/leads/board'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        }),
      )
      expect(result).toEqual(board)
    })

    it('throws on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Rate limit' }),
      })

      await expect(service.getBoard()).rejects.toThrow('Rate limit')
    })
  })

  describe('listLeads', () => {
    it('fetches leads with query params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: '1', name: 'Maria' }],
            pagination: { page: 1, limit: 20, total: 1 },
          }),
      })

      const result = await service.listLeads({ page: 2, status: 'new', search: 'Maria' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/leads\?.*page=2/),
        expect.any(Object),
      )
      expect(result.data).toHaveLength(1)
    })

    it('fetches without params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ data: [], pagination: { page: 1, limit: 20, total: 0 } }),
      })

      await service.listLeads()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/leads'),
        expect.any(Object),
      )
    })
  })

  describe('getLead', () => {
    it('fetches a single lead', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'Maria', status: 'new' }),
      })

      const result = await service.getLead('1')
      expect(result.name).toBe('Maria')
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.getLead('x')).rejects.toThrow('NOT_FOUND')
    })

    it('throws FORBIDDEN on 403', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({}),
      })

      await expect(service.getLead('x')).rejects.toThrow('FORBIDDEN')
    })
  })

  describe('createLead', () => {
    it('creates a lead with POST', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'Maria', status: 'new' }),
      })

      const result = await service.createLead({ name: 'Maria', email: 'maria@email.com' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/leads'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Maria', email: 'maria@email.com' }),
        }),
      )
      expect(result.name).toBe('Maria')
    })

    it('throws VALIDATION_ERROR on 400', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({}),
      })

      await expect(
        service.createLead({ name: '', email: 'bad' }),
      ).rejects.toThrow('VALIDATION_ERROR')
    })

    it('throws CONFLICT on 409', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({}),
      })

      await expect(
        service.createLead({ name: 'Maria', email: 'maria@email.com' }),
      ).rejects.toThrow('CONFLICT')
    })
  })

  describe('updateLead', () => {
    it('updates with PATCH', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '1', name: 'Maria Updated', status: 'contacted' }),
      })

      const result = await service.updateLead('1', { status: 'contacted' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/leads/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'contacted' }),
        }),
      )
      expect(result.status).toBe('contacted')
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.updateLead('x', { name: 'Test' })).rejects.toThrow('NOT_FOUND')
    })

    it('throws CONFLICT on 409 (duplicate email)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({}),
      })

      await expect(
        service.updateLead('1', { email: 'dup@email.com' }),
      ).rejects.toThrow('CONFLICT')
    })
  })

  describe('deleteLead', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      await service.deleteLead('1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/leads/1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.deleteLead('x')).rejects.toThrow('NOT_FOUND')
    })

    it('throws FORBIDDEN on 403', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({}),
      })

      await expect(service.deleteLead('x')).rejects.toThrow('FORBIDDEN')
    })
  })

  describe('getTimeline', () => {
    it('fetches timeline entries', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { type: 'message', timestamp: '2026-04-09T10:30:00Z', data: {} },
              { type: 'status_change', timestamp: '2026-04-09T14:00:00Z', data: {} },
            ],
          }),
      })

      const result = await service.getTimeline('1')
      expect(result.data).toHaveLength(2)
    })

    it('sends query params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })

      await service.getTimeline('1', { limit: 10, type: 'message' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/leads\/1\/timeline\?.*limit=10/),
        expect.any(Object),
      )
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.getTimeline('x')).rejects.toThrow('NOT_FOUND')
    })
  })

  describe('authentication', () => {
    it('throws NOT_AUTHENTICATED when no token', async () => {
      const { cookies } = await import('next/headers')
      vi.mocked(cookies).mockResolvedValueOnce({
        get: vi.fn().mockReturnValue(undefined),
      } as never)

      await expect(service.getBoard()).rejects.toThrow('NOT_AUTHENTICATED')
    })
  })
})
