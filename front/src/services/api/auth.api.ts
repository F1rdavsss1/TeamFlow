import api from './axios'
import { AuthResponse } from '@/types/api.types'

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  logoutAll: () =>
    api.post('/auth/logout-all'),

  refresh: () =>
    api.post<{ accessToken: string }>('/auth/refresh'),
}
