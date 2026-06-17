import { createContext, useContext, useMemo, useState } from 'react'

export type UserRole = 'admin' | 'manager' | 'user' | string

export interface User {
  id: string
  email: string
  role: UserRole
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  apiFetch: (input: RequestInfo, init?: RequestInit) => Promise<any>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const login = async ({ email, password }: LoginCredentials) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (response.status === 401) {
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      const message =
        body?.message || body?.error || response.statusText || 'Login failed'
      throw new Error(message)
    }

    const data = await response.json()
    const accessToken = data.accessToken || data.token || data.jwt
    if (!accessToken) {
      throw new Error('Login response did not include an access token')
    }

    const currentUser: User = {
      id: data.user?.id ?? data.id ?? '',
      email: data.user?.email ?? data.email ?? '',
      role: data.user?.role ?? data.role ?? 'user',
    }

    setToken(accessToken)
    setUser(currentUser)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const apiFetch = async (input: RequestInfo, init: RequestInit = {}) => {
    const headers = new Headers(init.headers ?? {})
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(input, { ...init, headers })

    if (response.status === 401) {
      logout()
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      const message =
        body?.message || body?.error || response.statusText || 'Request failed'
      const error = new Error(message)
      ;(error as any).status = response.status
      throw error
    }

    return response.json().catch(() => null)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      apiFetch,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
