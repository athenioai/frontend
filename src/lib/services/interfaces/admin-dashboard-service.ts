export interface PlanBreakdown {
  planId: string
  planName: string
  cost: number
  userCount: number
}

export interface AdminDashboardData {
  users: {
    total: number
    newThisMonth: number
    pendingOnboarding: number
  }
  revenue: {
    mrr: number
    planBreakdown: PlanBreakdown[]
  }
  appointments: {
    totalThisMonth: number
    cancelledThisMonth: number
  }
  leads: {
    totalThisMonth: number
    conversionRate: number
  }
  chats: {
    totalMessagesThisMonth: number
    activeSessionsThisMonth: number
  }
}

export interface IAdminDashboardService {
  get(): Promise<AdminDashboardData>
}
