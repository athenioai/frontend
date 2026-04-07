export interface Plan {
  id: string
  name: string
  cost: number
  createdAt: string
  updatedAt: string
}

export interface PlanPagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedPlans {
  data: Plan[]
  pagination: PlanPagination
}

export interface ListPlansParams {
  page?: number
  limit?: number
  search?: string
}

export interface CreatePlanParams {
  name: string
  cost: number
}

export interface UpdatePlanParams {
  name?: string
  cost?: number
}

export interface IPlanService {
  list(params?: ListPlansParams): Promise<PaginatedPlans>
  getById(id: string): Promise<Plan>
  create(data: CreatePlanParams): Promise<Plan>
  update(id: string, data: UpdatePlanParams): Promise<Plan>
  delete(id: string): Promise<void>
}
