import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types/task.types'
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '@/utils/constants'
import { formatDate, isOverdue } from '@/utils/date.utils'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
  isDragging?: boolean
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      onClick={() => onClick(task)}
      {...attributes}
      {...listeners}
    >
      <div className={styles.header}>
        <span
          className={styles.priority}
          style={{ color: TASK_PRIORITY_COLORS[task.priority] }}
        >
          ● {TASK_PRIORITY_LABELS[task.priority]}
        </span>
        {task.comments.length > 0 && (
          <span className={styles.comments}>💬 {task.comments.length}</span>
        )}
      </div>

      <p className={styles.title}>{task.title}</p>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.footer}>
        {task.assignee && (
          <div className={styles.assignee} title={task.assignee.name}>
            {task.assignee.avatarUrl ? (
              <img src={task.assignee.avatarUrl} alt={task.assignee.name} />
            ) : (
              task.assignee.name.charAt(0).toUpperCase()
            )}
          </div>
        )}
        {task.dueDate && (
          <span className={`${styles.dueDate} ${isOverdue(task.dueDate) ? styles.overdue : ''}`}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}
