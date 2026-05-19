import { TaskStatus, TaskPriority } from '@/types/task.types'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'К выполнению',
  [TaskStatus.IN_PROGRESS]: 'В работе',
  [TaskStatus.DONE]: 'Готово',
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Низкий',
  [TaskPriority.MEDIUM]: 'Средний',
  [TaskPriority.HIGH]: 'Высокий',
  [TaskPriority.URGENT]: 'Срочный',
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: '#6b7280',
  [TaskPriority.MEDIUM]: '#f59e0b',
  [TaskPriority.HIGH]: '#ef4444',
  [TaskPriority.URGENT]: '#7c3aed',
}

export const KANBAN_COLUMNS = [
  { id: TaskStatus.TODO, title: 'К выполнению' },
  { id: TaskStatus.IN_PROGRESS, title: 'В работе' },
  { id: TaskStatus.DONE, title: 'Готово' },
]
