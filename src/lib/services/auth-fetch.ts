import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

async function tryRefresh(): Promise<string | null> {
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

export async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies()
  let token = cookieStore.get('access_token')?.value ?? null
  if (!token) throw new Error('NOT_AUTHENTICATED')

  const doFetch = (t: string) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${t}`,
      },
    })

  const res = await doFetch(token)

  if (res.status === 401) {
    token = await tryRefresh()
    if (!token) throw new Error('NOT_AUTHENTICATED')
    return doFetch(token)
  }

  return res
}
