import type { IAuthService, AuthUser } from '../interfaces/auth-service'
import { cookies } from 'next/headers'
import { MOCK_COMPANY_ID } from './data'

const COOKIE_NAME = 'athenio-session'

const mockUsers: AuthUser[] = [
  { id: 'user-001', email: 'cliente@techfit.com', empresa_id: MOCK_COMPANY_ID, role: 'client', name: 'João TechFit' },
  { id: 'user-admin', email: 'admin@athenio.ai', empresa_id: MOCK_COMPANY_ID, role: 'admin', name: 'Admin Athenio' },
]

export class MockAuthService implements IAuthService {
  async login(email: string, _password: string): Promise<AuthUser> {
    const isAdmin = email.includes('admin') || email.includes('athenio')
    const user: AuthUser = isAdmin ? mockUsers[1] : { ...mockUsers[0], email }
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, JSON.stringify(user), {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return user
  }

  async logout(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
  }

  async getSession(): Promise<AuthUser | null> {
    const cookieStore = await cookies()
    const session = cookieStore.get(COOKIE_NAME)
    if (!session?.value) return null
    try {
      return JSON.parse(session.value) as AuthUser
    } catch {
      return null
    }
  }
}
