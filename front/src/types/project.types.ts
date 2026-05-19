import { User, UserRole } from './user.types'

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'

export interface ProjectMember {
  userId: string
  projectId: string
  role: UserRole
  joinedAt: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
}

export interface Project {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  ownerId: string
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
  owner: Pick<User, 'id' | 'name' | 'avatarUrl'>
  members: ProjectMember[]
  _count?: { tasks: number }
}

export interface CreateProjectDto {
  name: string
  description?: string
  startDate?: string
  endDate?: string
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {
  status?: ProjectStatus
}
