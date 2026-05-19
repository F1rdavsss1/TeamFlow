import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { taskSchema, TaskFormData } from '@/utils/validation.utils'
import { Task, TaskPriority } from '@/types/task.types'
import { ProjectMember } from '@/types/project.types'
import { TASK_PRIORITY_LABELS } from '@/utils/constants'
import styles from './TaskForm.module.css'

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>
  defaultValues?: Partial<Task>
  members?: ProjectMember[]
  isLoading?: boolean
}

export function TaskForm({ onSubmit, defaultValues, members, isLoading }: TaskFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      priority: defaultValues?.priority ?? TaskPriority.MEDIUM,
      assigneeId: defaultValues?.assigneeId ?? '',
      dueDate: defaultValues?.dueDate?.slice(0, 10) ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Название *</label>
        <input
          className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
          placeholder="Название задачи"
          {...register('title')}
        />
        {errors.title && <span className={styles.error}>{errors.title.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Описание</label>
        <textarea
          className={styles.textarea}
          placeholder="Подробное описание задачи"
          rows={3}
          {...register('description')}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Приоритет</label>
          <select className={styles.select} {...register('priority')}>
            {Object.values(TaskPriority).map((p) => (
              <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Дедлайн</label>
          <input type="date" className={styles.input} {...register('dueDate')} />
        </div>
      </div>

      {members && members.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>Исполнитель</label>
          <select className={styles.select} {...register('assigneeId')}>
            <option value="">Не назначен</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.user.name}</option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? 'Сохранение...' : defaultValues ? 'Сохранить' : 'Создать задачу'}
      </button>
    </form>
  )
}
