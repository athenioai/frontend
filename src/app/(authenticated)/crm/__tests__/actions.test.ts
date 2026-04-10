import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockService = {
  getBoard: vi.fn(),
  createLead: vi.fn(),
  updateLead: vi.fn(),
  deleteLead: vi.fn(),
  getTimeline: vi.fn(),
}

vi.mock('@/lib/services', () => ({
  leadService: mockService,
}))

const {
  fetchBoard,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  fetchTimeline,
} = await import('../actions')

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('CRM Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchBoard', () => {
    it('returns board data', async () => {
      const board = { new: [], contacted: [], qualified: [], converted: [], lost: [] }
      mockService.getBoard.mockResolvedValue(board)

      const result = await fetchBoard()

      expect(result.success).toBe(true)
      expect(result.data).toEqual(board)
    })

    it('returns error on failure', async () => {
      mockService.getBoard.mockRejectedValue(new Error('NOT_AUTHENTICATED'))

      const result = await fetchBoard()

      expect(result.success).toBe(false)
      expect(result.error).toContain('expirada')
    })
  })

  describe('createLead', () => {
    it('creates lead with valid data', async () => {
      mockService.createLead.mockResolvedValue({ id: '1', name: 'Maria', status: 'new' })

      const result = await createLead('Maria', 'maria@email.com', '+5511999990000')

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Maria')
      expect(mockService.createLead).toHaveBeenCalledWith({
        name: 'Maria',
        email: 'maria@email.com',
        phone: '+5511999990000',
      })
    })

    it('rejects empty name', async () => {
      const result = await createLead('', 'maria@email.com')

      expect(result.success).toBe(false)
      expect(result.error).toContain('obrigatorio')
      expect(mockService.createLead).not.toHaveBeenCalled()
    })

    it('rejects name over 255 chars', async () => {
      const result = await createLead('a'.repeat(256), 'maria@email.com')

      expect(result.success).toBe(false)
      expect(result.error).toContain('255')
    })

    it('rejects empty email', async () => {
      const result = await createLead('Maria', '')

      expect(result.success).toBe(false)
      expect(result.error).toContain('obrigatorio')
    })

    it('rejects invalid email format', async () => {
      const result = await createLead('Maria', 'not-an-email')

      expect(result.success).toBe(false)
      expect(result.error).toContain('invalido')
    })

    it('rejects email over 320 chars', async () => {
      const result = await createLead('Maria', 'a'.repeat(311) + '@email.com')

      expect(result.success).toBe(false)
      expect(result.error).toContain('320')
    })

    it('rejects phone over 50 chars', async () => {
      const result = await createLead('Maria', 'maria@email.com', 'x'.repeat(51))

      expect(result.success).toBe(false)
      expect(result.error).toContain('50')
    })

    it('handles CONFLICT (duplicate email)', async () => {
      mockService.createLead.mockRejectedValue(new Error('CONFLICT'))

      const result = await createLead('Maria', 'maria@email.com')

      expect(result.success).toBe(false)
      expect(result.error).toContain('email')
    })

    it('creates lead without optional phone', async () => {
      mockService.createLead.mockResolvedValue({ id: '1', name: 'Maria' })

      const result = await createLead('Maria', 'maria@email.com')

      expect(result.success).toBe(true)
      expect(mockService.createLead).toHaveBeenCalledWith({
        name: 'Maria',
        email: 'maria@email.com',
        phone: undefined,
      })
    })
  })

  describe('updateLead', () => {
    it('updates lead with valid UUID', async () => {
      mockService.updateLead.mockResolvedValue({ id: VALID_UUID, name: 'Updated' })

      const result = await updateLead(VALID_UUID, { name: 'Updated' })

      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Updated')
    })

    it('rejects non-UUID id', async () => {
      const result = await updateLead('../../admin', { name: 'Hack' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('invalido')
      expect(mockService.updateLead).not.toHaveBeenCalled()
    })

    it('rejects empty name', async () => {
      const result = await updateLead(VALID_UUID, { name: '   ' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('vazio')
    })

    it('rejects invalid email', async () => {
      const result = await updateLead(VALID_UUID, { email: 'bad-email' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('invalido')
    })

    it('rejects email over 320 chars', async () => {
      const result = await updateLead(VALID_UUID, { email: 'a'.repeat(311) + '@email.com' })

      expect(result.success).toBe(false)
      expect(result.error).toContain('320')
    })

    it('rejects phone over 50 chars', async () => {
      const result = await updateLead(VALID_UUID, { phone: 'x'.repeat(51) })

      expect(result.success).toBe(false)
      expect(result.error).toContain('50')
    })

    it('rejects invalid status', async () => {
      const result = await updateLead(VALID_UUID, { status: 'hacked' as never })

      expect(result.success).toBe(false)
      expect(result.error).toContain('invalido')
    })

    it('rejects oversized metadata', async () => {
      const bigMetadata: Record<string, unknown> = { data: 'x'.repeat(10001) }
      const result = await updateLead(VALID_UUID, { metadata: bigMetadata })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Metadata')
    })

    it('accepts null metadata', async () => {
      mockService.updateLead.mockResolvedValue({ id: VALID_UUID })

      const result = await updateLead(VALID_UUID, { metadata: null })

      expect(result.success).toBe(true)
    })
  })

  describe('updateLeadStatus', () => {
    it('updates status with valid UUID and status', async () => {
      mockService.updateLead.mockResolvedValue({ id: VALID_UUID, status: 'contacted' })

      const result = await updateLeadStatus(VALID_UUID, 'contacted')

      expect(result.success).toBe(true)
      expect(mockService.updateLead).toHaveBeenCalledWith(VALID_UUID, { status: 'contacted' })
    })

    it('rejects non-UUID id', async () => {
      const result = await updateLeadStatus('bad-id', 'new')

      expect(result.success).toBe(false)
      expect(mockService.updateLead).not.toHaveBeenCalled()
    })

    it('rejects invalid status', async () => {
      const result = await updateLeadStatus(VALID_UUID, 'invalid' as never)

      expect(result.success).toBe(false)
      expect(result.error).toContain('invalido')
    })

    it('handles server error gracefully', async () => {
      mockService.updateLead.mockRejectedValue(new Error('FORBIDDEN'))

      const result = await updateLeadStatus(VALID_UUID, 'contacted')

      expect(result.success).toBe(false)
      expect(result.error).toContain('permissao')
    })
  })

  describe('deleteLead', () => {
    it('deletes lead with valid UUID', async () => {
      mockService.deleteLead.mockResolvedValue(undefined)

      const result = await deleteLead(VALID_UUID)

      expect(result.success).toBe(true)
    })

    it('rejects non-UUID id', async () => {
      const result = await deleteLead('not-uuid')

      expect(result.success).toBe(false)
      expect(mockService.deleteLead).not.toHaveBeenCalled()
    })

    it('handles NOT_FOUND error', async () => {
      mockService.deleteLead.mockRejectedValue(new Error('NOT_FOUND'))

      const result = await deleteLead(VALID_UUID)

      expect(result.success).toBe(false)
      expect(result.error).toContain('encontrado')
    })
  })

  describe('fetchTimeline', () => {
    it('fetches timeline with valid UUID', async () => {
      mockService.getTimeline.mockResolvedValue({
        data: [{ type: 'message', timestamp: '2026-04-09T10:00:00Z', data: {} }],
      })

      const result = await fetchTimeline(VALID_UUID)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })

    it('passes filter params', async () => {
      mockService.getTimeline.mockResolvedValue({ data: [] })

      await fetchTimeline(VALID_UUID, 10, 'message')

      expect(mockService.getTimeline).toHaveBeenCalledWith(VALID_UUID, {
        limit: 10,
        type: 'message',
      })
    })

    it('rejects non-UUID id', async () => {
      const result = await fetchTimeline('bad-id')

      expect(result.success).toBe(false)
      expect(mockService.getTimeline).not.toHaveBeenCalled()
    })

    it('rejects limit out of range', async () => {
      const result = await fetchTimeline(VALID_UUID, 0)

      expect(result.success).toBe(false)
      expect(result.error).toContain('1 e 200')
    })

    it('rejects limit over 200', async () => {
      const result = await fetchTimeline(VALID_UUID, 201)

      expect(result.success).toBe(false)
      expect(result.error).toContain('1 e 200')
    })

    it('rejects invalid timeline type', async () => {
      const result = await fetchTimeline(VALID_UUID, 50, 'hacked' as never)

      expect(result.success).toBe(false)
      expect(result.error).toContain('invalido')
    })

    it('handles NOT_FOUND error', async () => {
      mockService.getTimeline.mockRejectedValue(new Error('NOT_FOUND'))

      const result = await fetchTimeline(VALID_UUID)

      expect(result.success).toBe(false)
      expect(result.error).toContain('encontrado')
    })
  })
})
