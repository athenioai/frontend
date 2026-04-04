'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AuthUser {
  id: string
  email: string
  company_id: string
  role: 'client' | 'admin'
  name: string
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<{ access_token: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadSession() {
      const { data: { session: s } } = await supabase.auth.getSession()
      if (s?.user) {
        const meta = s.user.user_metadata
        setUser({
          id: s.user.id,
          email: s.user.email!,
          company_id: meta.company_id ?? '',
          role: meta.role ?? 'client',
          name: meta.name ?? '',
        })
        setSession({ access_token: s.access_token })
      }
      setLoading(false)
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        const meta = s.user.user_metadata
        setUser({
          id: s.user.id,
          email: s.user.email!,
          company_id: meta.company_id ?? '',
          role: meta.role ?? 'client',
          name: meta.name ?? '',
        })
        setSession({ access_token: s.access_token })
      } else {
        setUser(null)
        setSession(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  return {
    user,
    session,
    loading,
    role: user?.role ?? null,
    tenantId: user?.company_id ?? null,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    logout,
  }
}
