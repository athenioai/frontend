import type { IAuthService, AuthUser } from './interfaces/auth-service'
import { createClient } from '@/lib/supabase/server'

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<AuthUser> {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user) {
      throw new Error(error?.message ?? 'Login failed')
    }

    const meta = data.user.user_metadata
    return {
      id: data.user.id,
      email: data.user.email!,
      company_id: meta.company_id ?? '',
      role: meta.role ?? 'client',
      name: meta.name ?? '',
    }
  }

  async logout(): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  async getSession(): Promise<AuthUser | null> {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    const meta = user.user_metadata
    return {
      id: user.id,
      email: user.email!,
      company_id: meta.company_id ?? '',
      role: meta.role ?? 'client',
      name: meta.name ?? '',
    }
  }
}
