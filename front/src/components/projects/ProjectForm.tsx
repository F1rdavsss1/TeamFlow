import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { projectSchema, ProjectFormData } from '@/utils/validation.utils'
import { Project } from '@/types/project.types'
import styles from './ProjectForm.module.css'

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => Promise<void>
  defaultValues?: Partial<Project>
  isLoading?: boolean
}

export function ProjectForm({ onSubmit, defaultValues, isLoading }: ProjectFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      startDate: defaultValues?.startDate?.slice(0, 10) ?? '',
      endDate: defaultValues?.endDate?.slice(0, 10) ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Название *</label>
        <input
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="Название проекта"
          {...register('name')}
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Описание</label>
        <textarea
          className={styles.textarea}
          placeholder="Краткое описание проекта"
          rows={3}
          {...register('description')}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Дата начала</label>
          <input type="date" className={styles.input} {...register('startDate')} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Дата окончания</label>
          <input type="date" className={styles.input} {...register('endDate')} />
        </div>
      </div>

      <button type="submit" className={styles.button} disabled={isLoading}>
        {isLoading ? 'Сохранение...' : defaultValues ? 'Сохранить' : 'Создать проект'}
      </button>
    </form>
  )
}
