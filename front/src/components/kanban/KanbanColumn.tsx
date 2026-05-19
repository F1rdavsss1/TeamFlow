import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task } from '@/types/task.types'
import { TaskCard } from '@/components/tasks/TaskCard'
import styles from './KanbanColumn.module.css'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddTask: () => void
}

export function KanbanColumn({ id, title, tasks, onTaskClick, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className={`${styles.column} ${isOver ? styles.over : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          <span className={styles.count}>{tasks.length}</span>
        </div>
        <button className={styles.addBtn} onClick={onAddTask} aria-label="Добавить задачу">+</button>
      </div>

      <div ref={setNodeRef} className={styles.taskList}>
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className={styles.empty}>Нет задач</div>
        )}
      </div>
    </div>
  )
}
