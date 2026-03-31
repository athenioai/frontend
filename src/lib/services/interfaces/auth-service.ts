export interface AuthUser {
  id: string
  email: string
  empresa_id: string
  role: 'client' | 'admin'
  nome: string
}

export interface IAuthService {
  login(email: string, password: string): Promise<AuthUser>
  logout(): Promise<void>
  getSession(): Promise<AuthUser | null>
}
