import { create } from 'zustand'
import api from '@/lib/api'

interface User {
  id: string
  username: string
  email: string
  role: string
  status: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true })
    try {
      const res = await api.post('/auth/login', { username, password })
      const { token, user } = res.data.data
      localStorage.setItem('token', token)
      set({ token, user, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
    window.location.href = '/login'
  },

  setUser: (user) => set({ user }),
}))
