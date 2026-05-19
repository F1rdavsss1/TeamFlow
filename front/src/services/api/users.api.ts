import api from './axios'
import { User } from '@/types/user.types'

export const usersApi = {
  getProfile: () =>
    api.get<User>('/users/profile'),

  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    api.put<User>('/users/profile', data),

  getById: (id: string) =>
    api.get<Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>>(`/users/${id}`),

  search: (query: string) =>
    api.get<Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>[]>(`/users/search?q=${encodeURIComponent(query)}`),
}
