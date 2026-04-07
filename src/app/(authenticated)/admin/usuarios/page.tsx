import { adminUserService, planService } from '@/lib/services'
import { UsersTable } from './_components/users-table'
import type { AdminUser, AdminUserPagination } from '@/lib/services/interfaces/admin-user-service'
import type { Plan } from '@/lib/services/interfaces/plan-service'

async function fetchUsers(
  page: number,
  role?: 'admin' | 'user',
  search?: string,
) {
  let users: AdminUser[] = []
  let pagination: AdminUserPagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await adminUserService.list({ page, role, search })
    users = result.data
    pagination = result.pagination
  } catch {
    // empty
  }

  return { users, pagination }
}

async function fetchPlans() {
  let plans: Plan[] = []
  try {
    const result = await planService.list({ limit: 100 })
    plans = result.data
  } catch {
    // empty
  }
  return plans
}

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; role?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const role =
    params.role === 'admin' || params.role === 'user'
      ? params.role
      : undefined
  const search = params.search || undefined

  const [{ users, pagination }, plans] = await Promise.all([
    fetchUsers(page, role, search),
    fetchPlans(),
  ])

  return (
    <div className="px-6 py-8 lg:py-10">
      <UsersTable
        users={users}
        pagination={pagination}
        plans={plans}
        currentRole={role}
        currentSearch={search}
      />
    </div>
  )
}
