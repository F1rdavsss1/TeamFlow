import { Link } from 'react-router-dom'
import { Project } from '@/types/project.types'
import { formatDate } from '@/utils/date.utils'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
}

const statusLabels = {
  ACTIVE: 'Активный',
  ARCHIVED: 'Архив',
  COMPLETED: 'Завершён',
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={`${styles.status} ${styles[project.status.toLowerCase()]}`}>
          {statusLabels[project.status]}
        </span>
        <button
          className={styles.deleteBtn}
          onClick={(e) => { e.preventDefault(); onDelete(project.id) }}
          aria-label="Удалить проект"
        >
          ✕
        </button>
      </div>

      <Link to={`/projects/${project.id}`} className={styles.name}>
        {project.name}
      </Link>

      {project.description && (
        <p className={styles.description}>{project.description}</p>
      )}

      <div className={styles.meta}>
        <span className={styles.tasks}>{project._count?.tasks ?? 0} задач</span>
        {project.endDate && (
          <span className={styles.date}>до {formatDate(project.endDate)}</span>
        )}
      </div>

      <div className={styles.members}>
        {project.members.slice(0, 5).map((m) => (
          <div key={m.userId} className={styles.avatar} title={m.user.name}>
            {m.user.avatarUrl ? (
              <img src={m.user.avatarUrl} alt={m.user.name} />
            ) : (
              m.user.name.charAt(0).toUpperCase()
            )}
          </div>
        ))}
        {project.members.length > 5 && (
          <div className={styles.avatarMore}>+{project.members.length - 5}</div>
        )}
      </div>

      <Link to={`/projects/${project.id}/board`} className={styles.boardLink}>
        Открыть доску →
      </Link>
    </div>
  )
}
