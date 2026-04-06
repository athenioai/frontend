export interface AuthUser {
  id: string
  name: string
  email: string
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
