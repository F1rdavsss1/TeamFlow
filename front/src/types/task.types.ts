import { User } from './user.types'

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  user: Pick<User, 'id' | 'name' | 'avatarUrl'>
}

export interface Attachment {
  id: string
  taskId: string
  fileName: string
  fileUrl: string
  fileSize?: number
  uploadedBy: string
  uploadedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeId?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  assignee?: Pick<User, 'id' | 'name' | 'avatarUrl'>
  comments: Comment[]
  attachments: Attachment[]
}

export interface CreateTaskDto {
  title: string
  description?: string
  priority?: TaskPriority
  assigneeId?: string
  dueDate?: string
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus
}
