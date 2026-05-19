import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Project, CreateProjectDto, UpdateProjectDto } from '@/types/project.types'
import { UserRole } from '@/types/user.types'
import { projectsApi } from '@/services/api/projects.api'

interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>
  createProject: (data: CreateProjectDto) => Promise<Project>
  updateProject: (id: string, data: UpdateProjectDto) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  addMember: (projectId: string, userId: string, role: UserRole) => Promise<void>
  removeMember: (projectId: string, userId: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void
}

export const useProjectStore = create<ProjectStore>()(
  devtools((set, get) => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,

    fetchProjects: async () => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await projectsApi.getAll()
        set({ projects: data, isLoading: false })
      } catch {
        set({ error: 'Ошибка загрузки проектов', isLoading: false })
      }
    },

    fetchProject: async (id) => {
      set({ isLoading: true, error: null })
      try {
        const { data } = await projectsApi.getById(id)
        set({ currentProject: data, isLoading: false })
      } catch {
        set({ error: 'Ошибка загрузки проекта', isLoading: false })
      }
    },

    createProject: async (data) => {
      const { data: project } = await projectsApi.create(data)
      set({ projects: [project, ...get().projects] })
      return project
    },

    updateProject: async (id, data) => {
      const { data: updated } = await projectsApi.update(id, data)
      set({
        projects: get().projects.map((p) => (p.id === id ? updated : p)),
        currentProject: get().currentProject?.id === id ? updated : get().currentProject,
      })
    },

    deleteProject: async (id) => {
      await projectsApi.delete(id)
      set({
        projects: get().projects.filter((p) => p.id !== id),
        currentProject: get().currentProject?.id === id ? null : get().currentProject,
      })
    },

    addMember: async (projectId, userId, role) => {
      await projectsApi.addMember(projectId, userId, role)
      // перезагружаем проект чтобы получить актуальный список участников
      const { data } = await projectsApi.getById(projectId)
      set({ currentProject: data })
    },

    removeMember: async (projectId, userId) => {
      await projectsApi.removeMember(projectId, userId)
      const current = get().currentProject
      if (current?.id === projectId) {
        set({
          currentProject: {
            ...current,
            members: current.members.filter((m) => m.userId !== userId),
          },
        })
      }
    },

    setCurrentProject: (project) => set({ currentProject: project }),
  }))
)
