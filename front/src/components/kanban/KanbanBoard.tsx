import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { Task, TaskStatus } from '@/types/task.types'
import { ProjectMember } from '@/types/project.types'
import { useTaskStore } from '@/store/taskStore'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { Modal } from '@/components/common/Modal'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskFormData } from '@/utils/validation.utils'
import { KANBAN_COLUMNS } from '@/utils/constants'
import toast from 'react-hot-toast'
import styles from './KanbanBoard.module.css'

interface KanbanBoardProps {
  projectId: string
  members?: ProjectMember[]
  searchQuery?: string
  filterAssigneeId?: string
}

export function KanbanBoard({ projectId, members, searchQuery, filterAssigneeId }: KanbanBoardProps) {
  const { tasks, updateTaskStatus, createTask } = useTaskStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createStatus, setCreateStatus] = useState<TaskStatus>(TaskStatus.TODO)
  const [isCreating, setIsCreating] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const filteredTasks = tasks.filter((t) => {
    if (t.projectId !== projectId) return false
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterAssigneeId && t.assigneeId !== filterAssigneeId) return false
    return true
  })

  const getByStatus = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status)

  const handleDragStart = ({ active }: DragStartEvent) => {
    const task = tasks.find((t) => t.id === active.id)
    setActiveTask(task ?? null)
  }

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const overId = over.id as string
    const isColumn = Object.values(TaskStatus).includes(overId as TaskStatus)
    if (isColumn) {
      const task = tasks.find((t) => t.id === active.id)
      if (task && task.status !== overId) {
        updateTaskStatus(task.id, overId as TaskStatus)
      }
    }
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null)
    if (!over) return
    const overId = over.id as string
    const task = tasks.find((t) => t.id === active.id)
    if (!task) return
    const isColumn = Object.values(TaskStatus).includes(overId as TaskStatus)
    if (isColumn && task.status !== overId) {
      updateTaskStatus(task.id, overId as TaskStatus)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailOpen(true)
  }

  const handleAddTask = (status: TaskStatus) => {
    setCreateStatus(status)
    setIsCreateOpen(true)
  }

  const handleCreateTask = async (data: TaskFormData) => {
    setIsCreating(true)
    try {
      await createTask(projectId, { ...data, status: createStatus } as TaskFormData & { status: TaskStatus })
      setIsCreateOpen(false)
      toast.success('Задача создана')
    } catch {
      toast.error('Ошибка создания задачи')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.board}>
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={getByStatus(col.id)}
              onTaskClick={handleTaskClick}
              onAddTask={() => handleAddTask(col.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard task={activeTask} onClick={() => {}} isDragging />
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        members={members}
      />

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Новая задача">
        <TaskForm
          onSubmit={handleCreateTask}
          members={members}
          isLoading={isCreating}
        />
      </Modal>
    </>
  )
}
