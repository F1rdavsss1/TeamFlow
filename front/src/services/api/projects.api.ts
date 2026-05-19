import api from './axios'
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project.types'
import { UserRole } from '@/types/user.types'

export const projectsApi = {
  getAll: () =>
    api.get<Project[]>('/projects'),

  getById: (id: string) =>
    api.get<Project>(`/projects/${id}`),

  create: (data: CreateProjectDto) =>
    api.post<Project>('/projects', data),

  update: (id: string, data: UpdateProjectDto) =>
    api.put<Project>(`/projects/${id}`, data),

  delete: (id: string) =>
    api.delete(`/projects/${id}`),

  addMember: (projectId: string, userId: string, role: UserRole) =>
    api.post(`/projects/${projectId}/members`, { userId, role }),

  removeMember: (projectId: string, userId: string) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
}
