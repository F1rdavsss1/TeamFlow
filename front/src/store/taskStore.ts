import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Task, TaskStatus, CreateTaskDto, UpdateTaskDto } from '@/types/task.types'
import { tasksApi } from '@/services/api/tasks.api'

interface TaskStore {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  fetchTasks: (projectId: string) => Promise<void>
  createTask: (projectId: string, data: CreateTaskDto) => Promise<void>
  updateTask: (id: string, data: UpdateTaskDto) => Promise<void>
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  addComment: (taskId: string, content: string) => Promise<void>
  deleteComment: (taskId: string, commentId: string) => Promise<void>
}

export const useTaskStore = create<TaskStore>()(
  devtools((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async (projectId) => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await tasksApi.getByProject(projectId)
        set({ tasks: data, isLoading: false })
      } catch {
        set({ error: 'Ошибка загрузки задач', isLoading: false })
      }
    },

    createTask: async (projectId, data) => {
      const { data: task } = await tasksApi.create(projectId, data)
      set({ tasks: [task, ...get().tasks] })
    },

    updateTask: async (id, data) => {
      const { data: updated } = await tasksApi.update(id, data)
      set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) })
    },

    updateTaskStatus: async (id, status) => {
      const prev = get().tasks.find((t) => t.id === id)
      if (!prev) return

      set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, status } : t)) })

      try {
        await tasksApi.updateStatus(id, status)
      } catch {
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, status: prev.status } : t)) })
      }
    },

    deleteTask: async (id) => {
      await tasksApi.delete(id)
      set({ tasks: get().tasks.filter((t) => t.id !== id) })
    },

    addComment: async (taskId, content) => {
      const { data: comment } = await tasksApi.addComment(taskId, content)
      set({
        tasks: get().tasks.map((t) =>
          t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t
        ),
      })
    },

    deleteComment: async (taskId, commentId) => {
      await tasksApi.deleteComment(taskId, commentId)
      set({
        tasks: get().tasks.map((t) =>
          t.id === taskId
            ? { ...t, comments: t.comments.filter((c) => c.id !== commentId) }
            : t
        ),
      })
    },
  }))
)
