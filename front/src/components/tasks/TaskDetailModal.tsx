import { useState } from 'react'
import toast from 'react-hot-toast'
import { Task } from '@/types/task.types'
import { ProjectMember } from '@/types/project.types'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
import { Modal } from '@/components/common/Modal'
import { TaskForm } from './TaskForm'
import { TaskFormData } from '@/utils/validation.utils'
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS } from '@/utils/constants'
import { formatDate, formatRelative } from '@/utils/date.utils'
import styles from './TaskDetailModal.module.css'

interface TaskDetailModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  members?: ProjectMember[]
}

export function TaskDetailModal({ task, isOpen, onClose, members }: TaskDetailModalProps) {
  const { updateTask, deleteTask, addComment, deleteComment } = useTaskStore()
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!task) return null

  const handleUpdate = async (data: TaskFormData) => {
    setIsSubmitting(true)
    try {
      await updateTask(task.id, data)
      setIsEditing(false)
      toast.success('Задача обновлена')
    } catch {
      toast.error('Ошибка обновления')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTask(task.id)
      onClose()
      toast.success('Задача удалена')
    } catch {
      toast.error('Ошибка удаления')
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    try {
      await addComment(task.id, commentText.trim())
      setCommentText('')
    } catch {
      toast.error('Ошибка добавления комментария')
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(task.id, commentId)
    } catch {
      toast.error('Ошибка удаления комментария')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Редактировать задачу' : 'Задача'} size="lg">
      {isEditing ? (
        <TaskForm
          onSubmit={handleUpdate}
          defaultValues={task}
          members={members}
          isLoading={isSubmitting}
        />
      ) : (
        <div className={styles.detail}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{task.title}</h3>
            <div className={styles.actions}>
              <button className={styles.editBtn} onClick={() => setIsEditing(true)}>Изменить</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>Удалить</button>
            </div>
          </div>

          <div className={styles.badges}>
            <span className={styles.badge}>{TASK_STATUS_LABELS[task.status]}</span>
            <span
              className={styles.badge}
              style={{ color: TASK_PRIORITY_COLORS[task.priority] }}
            >
              {TASK_PRIORITY_LABELS[task.priority]}
            </span>
            {task.dueDate && (
              <span className={styles.badge}>до {formatDate(task.dueDate)}</span>
            )}
          </div>

          {task.description && (
            <p className={styles.description}>{task.description}</p>
          )}

          {task.assignee && (
            <div className={styles.assigneeRow}>
              <span className={styles.metaLabel}>Исполнитель:</span>
              <div className={styles.assigneeAvatar}>
                {task.assignee.avatarUrl ? (
                  <img src={task.assignee.avatarUrl} alt={task.assignee.name} />
                ) : (
                  task.assignee.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className={styles.assigneeName}>{task.assignee.name}</span>
            </div>
          )}

          <div className={styles.comments}>
            <h4 className={styles.commentsTitle}>Комментарии ({task.comments.length})</h4>

            <div className={styles.commentList}>
              {task.comments.map((c) => (
                <div key={c.id} className={styles.comment}>
                  <div className={styles.commentAvatar}>
                    {c.user.avatarUrl ? (
                      <img src={c.user.avatarUrl} alt={c.user.name} />
                    ) : (
                      c.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className={styles.commentBody}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{c.user.name}</span>
                      <span className={styles.commentTime}>{formatRelative(c.createdAt)}</span>
                      {c.userId === user?.id && (
                        <button
                          className={styles.commentDelete}
                          onClick={() => handleDeleteComment(c.id)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className={styles.commentText}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.commentInput}>
              <textarea
                className={styles.commentTextarea}
                placeholder="Написать комментарий..."
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
              />
              <button
                className={styles.commentSubmit}
                onClick={handleAddComment}
                disabled={!commentText.trim()}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
