import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { User } from '@/types/user.types'
import { authApi } from '@/services/api/auth.api'

interface AuthStore {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,

        login: async (email, password) => {
          set({ isLoading: true, error: null })
          try {
            const { data } = await authApi.login({ email, password })
            set({ user: data.user as User, isAuthenticated: true, isLoading: false })
          } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message || 'Ошибка входа'
            set({ error: message, isLoading: false })
            throw err
          }
        },

        register: async (email, password, name) => {
          set({ isLoading: true, error: null })
          try {
            const { data } = await authApi.register({ email, password, name })
            set({ user: data.user as User, isAuthenticated: true, isLoading: false })
          } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message || 'Ошибка регистрации'
            set({ error: message, isLoading: false })
            throw err
          }
        },

        logout: async () => {
          await authApi.logout()
          set({ user: null, isAuthenticated: false })
        },

        logoutAll: async () => {
          await authApi.logoutAll()
          set({ user: null, isAuthenticated: false })
        },

        setUser: (user) => set({ user, isAuthenticated: true }),

        clearError: () => set({ error: null }),
      }),
      { name: 'auth-store', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
    )
  )
)
