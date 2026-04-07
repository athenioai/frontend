import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'mock-token' }),
  }),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const { AdminDashboardService } = await import('../admin-dashboard-service')

const MOCK_DATA = {
  users: { total: 42, newThisMonth: 8, pendingOnboarding: 3 },
  revenue: {
    mrr: 4196.0,
    planBreakdown: [
      { planId: '1', planName: 'Starter', cost: 29.9, userCount: 10 },
    ],
  },
  appointments: { totalThisMonth: 156, cancelledThisMonth: 12 },
  leads: { totalThisMonth: 89, conversionRate: 0.34 },
  chats: { totalMessagesThisMonth: 1240, activeSessionsThisMonth: 87 },
}

describe('AdminDashboardService', () => {
  let service: InstanceType<typeof AdminDashboardService>

  beforeEach(() => {
    service = new AdminDashboardService()
    mockFetch.mockReset()
  })

  it('fetches dashboard data with auth header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_DATA),
    })

    const result = await service.get()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/dashboard'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-token' },
      }),
    )
    expect(result.users.total).toBe(42)
    expect(result.revenue.mrr).toBe(4196.0)
    expect(result.appointments.totalThisMonth).toBe(156)
    expect(result.leads.conversionRate).toBe(0.34)
    expect(result.chats.totalMessagesThisMonth).toBe(1240)
  })

  it('returns all sections of the response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_DATA),
    })

    const result = await service.get()

    expect(result.users.newThisMonth).toBe(8)
    expect(result.users.pendingOnboarding).toBe(3)
    expect(result.revenue.planBreakdown).toHaveLength(1)
    expect(result.revenue.planBreakdown[0].planName).toBe('Starter')
    expect(result.appointments.cancelledThisMonth).toBe(12)
    expect(result.chats.activeSessionsThisMonth).toBe(87)
  })

  it('throws on API error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Forbidden' }),
    })

    await expect(service.get()).rejects.toThrow('Forbidden')
  })
})
