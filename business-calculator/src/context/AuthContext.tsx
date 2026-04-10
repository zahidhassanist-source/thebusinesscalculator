'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, remember: boolean) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const USERS_KEY = 'bizcalc_users'
const SESSION_KEY = 'bizcalc_session'
const REMEMBER_KEY = 'bizcalc_remember'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY)
    if (session) {
      try {
        setUser(JSON.parse(session))
      } catch {}
    }
    setIsLoading(false)
  }, [])

  const getUsers = (): Record<string, { name: string; password: string }> => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}') } catch { return {} }
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = getUsers()
    if (users[email]) return false
    users[email] = { name, password }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    const u = { name, email }
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    setUser(u)
    return true
  }

  const login = async (email: string, password: string, remember: boolean): Promise<boolean> => {
    const users = getUsers()
    const found = users[email]
    if (!found || found.password !== password) return false
    const u = { name: found.name, email }
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(SESSION_KEY, JSON.stringify(u))
    if (remember) localStorage.setItem(REMEMBER_KEY, password)
    setUser(u)
    return true
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
