export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  workType: 'services' | 'sales' | 'hybrid'
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface IAuthService {
  login(email: string, password: string): Promise<LoginResponse>
  logout(): Promise<void>
  getSession(): Promise<AuthUser | null>
}
