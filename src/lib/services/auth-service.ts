import type { IAuthService, AuthUser, LoginResponse } from './interfaces/auth-service'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Login failed')
    }

    const data: LoginResponse = await res.json()

    const cookieStore = await cookies()
    cookieStore.set('access_token', data.accessToken, { ...COOKIE_OPTS, maxAge: 60 * 60 })
    cookieStore.set('refresh_token', data.refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })

    return data
  }

  async logout(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('access_token')
    cookieStore.delete('refresh_token')
  }

  async getSession(): Promise<AuthUser | null> {
    const cookieStore = await cookies()
    let token: string | null = cookieStore.get('access_token')?.value ?? null

    if (!token) {
      token = await this.tryRefresh()
      if (!token) return null
    }

    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.ok) {
      return await res.json() as AuthUser
    }

    if (res.status === 401) {
      const currentRefresh = cookieStore.get('refresh_token')?.value
      if (!currentRefresh) return null

      token = await this.tryRefresh()
      if (!token) return null

      const retry = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (retry.ok) {
        return await retry.json() as AuthUser
      }
    }

    return null
  }

  private async tryRefresh(): Promise<string | null> {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) return null

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!res.ok) return null

      const data: { accessToken: string; refreshToken: string } = await res.json()

      // cookies().set() only works in Server Actions, Route Handlers, and Middleware.
      // In Server Component context this throws — the in-memory token still works for the current request.
      try {
        cookieStore.set('access_token', data.accessToken, { ...COOKIE_OPTS, maxAge: 60 * 60 })
        cookieStore.set('refresh_token', data.refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })
      } catch {
        // Server Component context — cookie will be refreshed by middleware on next navigation
      }

      return data.accessToken
    } catch {
      return null
    }
  }
}
