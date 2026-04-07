export interface AdminUser {
  id: string
  name: string | null
  email: string
  role: 'admin' | 'user'
  planId: string
  contractUrl: string
  createdAt: string
}

export interface AdminUserPagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedAdminUsers {
  data: AdminUser[]
  pagination: AdminUserPagination
}

export interface ListAdminUsersParams {
  page?: number
  limit?: number
  role?: 'admin' | 'user'
  search?: string
}

export interface IAdminUserService {
  list(params?: ListAdminUsersParams): Promise<PaginatedAdminUsers>
  getById(id: string): Promise<AdminUser>
  create(formData: FormData): Promise<AdminUser>
}
