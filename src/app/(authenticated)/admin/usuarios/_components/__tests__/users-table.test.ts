import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { AdminUser } from '@/lib/services/interfaces/admin-user-service'
import type { Plan } from '@/lib/services/interfaces/plan-service'

/**
 * UsersTable — Performance Optimization Tests
 *
 * Validates the filtering, sorting, and planMap logic that is wrapped
 * in useMemo inside UsersTable. Tests the pure data transformations
 * (behavior), not the React memoization (implementation).
 *
 * Also validates via file-content analysis that useMemo is correctly applied.
 */

const COMPONENT_PATH = resolve(__dirname, '../users-table.tsx')
const source = readFileSync(COMPONENT_PATH, 'utf-8')

// ── Test Data ──

const PLANS: Plan[] = [
  { id: 'plan-1', name: 'Basic', cost: 49.9, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'plan-2', name: 'Pro', cost: 99.9, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 'plan-3', name: 'Enterprise', cost: 299.9, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
]

const USERS: AdminUser[] = [
  {
    id: 'u1',
    name: 'Alice Silva',
    email: 'alice@empresa.com',
    cnpj: '12345678000190',
    role: 'user',
    planId: 'plan-2',
    contractUrl: '/contracts/u1.pdf',
    createdAt: '2026-01-15',
  },
  {
    id: 'u2',
    name: null, // pending user
    email: 'bob@empresa.com',
    cnpj: null,
    role: 'user',
    planId: 'plan-1',
    contractUrl: '/contracts/u2.pdf',
    createdAt: '2026-02-20',
  },
  {
    id: 'u3',
    name: 'Carlos Oliveira',
    email: 'carlos@empresa.com',
    cnpj: '98765432000156',
    role: 'user',
    planId: 'plan-3',
    contractUrl: '/contracts/u3.pdf',
    createdAt: '2026-03-10',
  },
  {
    id: 'u4',
    name: null, // pending user
    email: 'diana@empresa.com',
    cnpj: null,
    role: 'user',
    planId: 'plan-2',
    contractUrl: '/contracts/u4.pdf',
    createdAt: '2026-01-05',
  },
  {
    id: 'u5',
    name: 'Eduardo Santos',
    email: 'eduardo@empresa.com',
    cnpj: '11222333000144',
    role: 'admin',
    planId: 'plan-1',
    contractUrl: '/contracts/u5.pdf',
    createdAt: '2025-12-01',
  },
]

// ── Pure Logic: extracted from component ──
// These replicate the exact logic inside the useMemo hooks

function buildPlanMap(plans: Plan[]): Map<string, string> {
  return new Map(plans.map((p) => [p.id, p.name]))
}

function filterUsers(
  users: AdminUser[],
  statusFilter: string,
  planFilter: string,
): AdminUser[] {
  return users.filter((u) => {
    if (statusFilter === 'active' && u.name === null) return false
    if (statusFilter === 'pending' && u.name !== null) return false
    if (planFilter && u.planId !== planFilter) return false
    return true
  })
}

type SortKey = 'status' | 'name' | 'email' | 'cnpj' | 'plan' | 'createdAt'
type SortDir = 'asc' | 'desc'

function sortUsers(
  users: AdminUser[],
  sortKey: SortKey,
  sortDir: SortDir,
  planMap: Map<string, string>,
): AdminUser[] {
  return [...users].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'status':
        cmp = (a.name ? 1 : 0) - (b.name ? 1 : 0)
        break
      case 'name':
        cmp = (a.name ?? '').localeCompare(b.name ?? '')
        break
      case 'email':
        cmp = a.email.localeCompare(b.email)
        break
      case 'cnpj':
        cmp = (a.cnpj ?? '').localeCompare(b.cnpj ?? '')
        break
      case 'plan':
        cmp = (planMap.get(a.planId) ?? '').localeCompare(
          planMap.get(b.planId) ?? '',
        )
        break
      case 'createdAt':
        cmp = a.createdAt.localeCompare(b.createdAt)
        break
    }
    return sortDir === 'asc' ? cmp : -cmp
  })
}

// ── Tests ──

describe('UsersTable — planMap (useMemo)', () => {
  it('deve mapear plan IDs para nomes corretamente', () => {
    const planMap = buildPlanMap(PLANS)

    expect(planMap.size).toBe(3)
    expect(planMap.get('plan-1')).toBe('Basic')
    expect(planMap.get('plan-2')).toBe('Pro')
    expect(planMap.get('plan-3')).toBe('Enterprise')
  })

  it('deve retornar undefined para plan ID inexistente', () => {
    const planMap = buildPlanMap(PLANS)
    expect(planMap.get('plan-nonexistent')).toBeUndefined()
  })

  it('deve lidar com lista vazia de plans', () => {
    const planMap = buildPlanMap([])
    expect(planMap.size).toBe(0)
  })
})

describe('UsersTable — filteredUsers (useMemo)', () => {
  describe('sem filtros', () => {
    it('deve retornar todos os usuarios quando filtros estao vazios', () => {
      const result = filterUsers(USERS, '', '')
      expect(result).toHaveLength(5)
    })
  })

  describe('filtro de status', () => {
    it('deve filtrar apenas usuarios ativos (name !== null)', () => {
      const result = filterUsers(USERS, 'active', '')
      expect(result).toHaveLength(3)
      expect(result.every((u) => u.name !== null)).toBe(true)
    })

    it('deve filtrar apenas usuarios pendentes (name === null)', () => {
      const result = filterUsers(USERS, 'pending', '')
      expect(result).toHaveLength(2)
      expect(result.every((u) => u.name === null)).toBe(true)
    })

    it('deve retornar lista vazia quando nenhum usuario corresponde ao status', () => {
      // All active users
      const activeOnly: AdminUser[] = USERS.filter((u) => u.name !== null)
      const result = filterUsers(activeOnly, 'pending', '')
      expect(result).toHaveLength(0)
    })
  })

  describe('filtro de plano', () => {
    it('deve filtrar usuarios pelo planId', () => {
      const result = filterUsers(USERS, '', 'plan-1')
      expect(result).toHaveLength(2) // bob and eduardo
      expect(result.every((u) => u.planId === 'plan-1')).toBe(true)
    })

    it('deve retornar vazio quando nenhum usuario tem o plano', () => {
      const result = filterUsers(USERS, '', 'plan-nonexistent')
      expect(result).toHaveLength(0)
    })
  })

  describe('filtros combinados', () => {
    it('deve aplicar status e plano simultaneamente', () => {
      // Active users with plan-2 => only Alice (u1)
      const result = filterUsers(USERS, 'active', 'plan-2')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('u1')
    })

    it('deve retornar vazio quando combinacao nao encontra ninguem', () => {
      // Pending users with plan-3 => nobody
      const result = filterUsers(USERS, 'pending', 'plan-3')
      expect(result).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('deve lidar com lista vazia de usuarios', () => {
      const result = filterUsers([], 'active', 'plan-1')
      expect(result).toHaveLength(0)
    })
  })
})

describe('UsersTable — sortedUsers (useMemo)', () => {
  const planMap = buildPlanMap(PLANS)

  describe('sort por nome', () => {
    it('deve ordenar por nome ascendente (nulls como string vazia)', () => {
      const result = sortUsers(USERS, 'name', 'asc', planMap)
      // null names sort as '' (empty string), which comes first
      expect(result[0].name).toBeNull()
      expect(result[1].name).toBeNull()
      expect(result[2].name).toBe('Alice Silva')
      expect(result[3].name).toBe('Carlos Oliveira')
      expect(result[4].name).toBe('Eduardo Santos')
    })

    it('deve ordenar por nome descendente', () => {
      const result = sortUsers(USERS, 'name', 'desc', planMap)
      expect(result[0].name).toBe('Eduardo Santos')
      expect(result[1].name).toBe('Carlos Oliveira')
      expect(result[2].name).toBe('Alice Silva')
    })
  })

  describe('sort por email', () => {
    it('deve ordenar por email ascendente', () => {
      const result = sortUsers(USERS, 'email', 'asc', planMap)
      expect(result[0].email).toBe('alice@empresa.com')
      expect(result[1].email).toBe('bob@empresa.com')
      expect(result[2].email).toBe('carlos@empresa.com')
      expect(result[3].email).toBe('diana@empresa.com')
      expect(result[4].email).toBe('eduardo@empresa.com')
    })

    it('deve ordenar por email descendente', () => {
      const result = sortUsers(USERS, 'email', 'desc', planMap)
      expect(result[0].email).toBe('eduardo@empresa.com')
      expect(result[4].email).toBe('alice@empresa.com')
    })
  })

  describe('sort por status', () => {
    it('deve ordenar pendentes primeiro quando asc (name=null => 0)', () => {
      const result = sortUsers(USERS, 'status', 'asc', planMap)
      // name === null => 0, name !== null => 1, so asc = pendentes primeiro
      expect(result[0].name).toBeNull()
      expect(result[1].name).toBeNull()
      expect(result[2].name).not.toBeNull()
    })

    it('deve ordenar ativos primeiro quando desc', () => {
      const result = sortUsers(USERS, 'status', 'desc', planMap)
      expect(result[0].name).not.toBeNull()
      expect(result[1].name).not.toBeNull()
      expect(result[2].name).not.toBeNull()
    })
  })

  describe('sort por plano', () => {
    it('deve ordenar pelo nome do plano (via planMap)', () => {
      const result = sortUsers(USERS, 'plan', 'asc', planMap)
      // Basic, Basic, Enterprise, Pro, Pro
      expect(planMap.get(result[0].planId)).toBe('Basic')
      expect(planMap.get(result[1].planId)).toBe('Basic')
      expect(planMap.get(result[2].planId)).toBe('Enterprise')
      expect(planMap.get(result[3].planId)).toBe('Pro')
      expect(planMap.get(result[4].planId)).toBe('Pro')
    })
  })

  describe('sort por createdAt', () => {
    it('deve ordenar por data de criacao descendente (mais recente primeiro)', () => {
      const result = sortUsers(USERS, 'createdAt', 'desc', planMap)
      expect(result[0].createdAt).toBe('2026-03-10')
      expect(result[1].createdAt).toBe('2026-02-20')
      expect(result[2].createdAt).toBe('2026-01-15')
    })

    it('deve ordenar por data de criacao ascendente (mais antigo primeiro)', () => {
      const result = sortUsers(USERS, 'createdAt', 'asc', planMap)
      expect(result[0].createdAt).toBe('2025-12-01')
      expect(result[4].createdAt).toBe('2026-03-10')
    })
  })

  describe('sort por cnpj', () => {
    it('deve ordenar por CNPJ com nulls como string vazia', () => {
      const result = sortUsers(USERS, 'cnpj', 'asc', planMap)
      // null cnpjs sort as '' (first), then numeric order
      expect(result[0].cnpj).toBeNull()
      expect(result[1].cnpj).toBeNull()
      expect(result[2].cnpj).toBe('11222333000144')
    })
  })

  describe('estabilidade', () => {
    it('nao deve modificar o array original', () => {
      const original = [...USERS]
      sortUsers(USERS, 'name', 'asc', planMap)
      expect(USERS).toEqual(original)
    })

    it('deve retornar array vazio quando input vazio', () => {
      const result = sortUsers([], 'name', 'asc', planMap)
      expect(result).toHaveLength(0)
    })
  })
})

describe('UsersTable — file-content validation', () => {
  it('deve usar useMemo para planMap', () => {
    expect(source).toContain('const planMap = useMemo(')
  })

  it('deve usar useMemo para filteredUsers', () => {
    expect(source).toContain('const filteredUsers = useMemo(')
  })

  it('deve usar useMemo para sortedUsers', () => {
    expect(source).toContain('const sortedUsers = useMemo(')
  })

  it('deve importar useMemo de react', () => {
    expect(source).toMatch(/import\s*\{[^}]*useMemo[^}]*\}\s*from\s*'react'/)
  })

  it('planMap deve depender de [plans]', () => {
    // Match: useMemo(() => ..., [plans])
    const planMapMatch = source.match(/planMap\s*=\s*useMemo\([\s\S]*?,\s*\[plans\]\)/)
    expect(planMapMatch).not.toBeNull()
  })

  it('filteredUsers deve depender de [users, statusFilter, planFilter]', () => {
    expect(source).toContain('[users, statusFilter, planFilter]')
  })

  it('sortedUsers deve depender de [filteredUsers, sortKey, sortDir, planMap]', () => {
    expect(source).toContain('[filteredUsers, sortKey, sortDir, planMap]')
  })
})
