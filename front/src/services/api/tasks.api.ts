import api from './axios'
import { Task, CreateTaskDto, UpdateTaskDto, TaskStatus, Comment } from '@/types/task.types'

export const tasksApi = {
  getByProject: (projectId: string) =>
    api.get<Task[]>(`/projects/${projectId}/tasks`),

  getById: (id: string) =>
    api.get<Task>(`/tasks/${id}`),

  create: (projectId: string, data: CreateTaskDto) =>
    api.post<Task>(`/projects/${projectId}/tasks`, data),

  update: (id: string, data: UpdateTaskDto) =>
    api.put<Task>(`/tasks/${id}`, data),

  updateStatus: (id: string, status: TaskStatus) =>
    api.patch<Task>(`/tasks/${id}/status`, { status }),

  delete: (id: string) =>
    api.delete(`/tasks/${id}`),

  addComment: (taskId: string, content: string) =>
    api.post<Comment>(`/tasks/${taskId}/comments`, { content }),

  deleteComment: (taskId: string, commentId: string) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),
}
