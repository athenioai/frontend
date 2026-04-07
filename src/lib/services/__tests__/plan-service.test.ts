import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/headers before importing the service
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'mock-token' }),
  }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Import after mocks are set
const { PlanService } = await import('../plan-service')

describe('PlanService', () => {
  let service: InstanceType<typeof PlanService>

  beforeEach(() => {
    service = new PlanService()
    mockFetch.mockReset()
  })

  describe('list', () => {
    it('fetches plans with default params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: '1', name: 'Pro', cost: 99.9 }],
            pagination: { page: 1, limit: 20, total: 1 },
          }),
      })

      const result = await service.list()

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/plans'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        }),
      )
      expect(result.data).toHaveLength(1)
      expect(result.data[0].name).toBe('Pro')
    })

    it('passes search param', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ data: [], pagination: { page: 1, limit: 20, total: 0 } }),
      })

      await service.list({ search: 'Pro' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=Pro'),
        expect.any(Object),
      )
    })

    it('throws on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Forbidden' }),
      })

      await expect(service.list()).rejects.toThrow('Forbidden')
    })
  })

  describe('create', () => {
    it('sends POST with name and cost', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ id: '1', name: 'Basic', cost: 49.9 }),
      })

      const result = await service.create({ name: 'Basic', cost: 49.9 })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/plans'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Basic', cost: 49.9 }),
        }),
      )
      expect(result.name).toBe('Basic')
    })

    it('throws CONFLICT on 409', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ message: 'Conflict' }),
      })

      await expect(service.create({ name: 'Dup', cost: 10 })).rejects.toThrow(
        'CONFLICT',
      )
    })
  })

  describe('update', () => {
    it('sends PATCH with partial data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ id: '1', name: 'Updated', cost: 199.9 }),
      })

      await service.update('1', { name: 'Updated' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/plans/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated' }),
        }),
      )
    })

    it('throws CONFLICT on 409', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({}),
      })

      await expect(service.update('1', { name: 'Dup' })).rejects.toThrow(
        'CONFLICT',
      )
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.update('x', { name: 'X' })).rejects.toThrow(
        'NOT_FOUND',
      )
    })
  })

  describe('delete', () => {
    it('sends DELETE request', async () => {
      mockFetch.mockResolvedValue({ ok: true })

      await service.delete('1')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/admin/plans/1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })

    it('throws NOT_FOUND on 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      })

      await expect(service.delete('x')).rejects.toThrow('NOT_FOUND')
    })
  })
})
