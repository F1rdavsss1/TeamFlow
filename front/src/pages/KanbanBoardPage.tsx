import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'
import { useTaskStore } from '@/store/taskStore'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Loader } from '@/components/common/Loader'
import styles from './KanbanBoardPage.module.css'

export function KanbanBoardPage() {
  const { id } = useParams<{ id: string }>()
  const { currentProject, fetchProject } = useProjectStore()
  const { fetchTasks, isLoading } = useTaskStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAssigneeId, setFilterAssigneeId] = useState('')

  useEffect(() => {
    if (id) {
      fetchProject(id)
      fetchTasks(id)
    }
  }, [id, fetchProject, fetchTasks])

  if (isLoading) return <Loader />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <Link to="/projects" className={styles.breadcrumbLink}>Проекты</Link>
            <span>/</span>
            <Link to={`/projects/${id}`} className={styles.breadcrumbLink}>
              {currentProject?.name}
            </Link>
            <span>/</span>
            <span>Доска</span>
          </div>
          <h1 className={styles.title}>Kanban доска</h1>
        </div>

        <div className={styles.filters}>
          <input
            className={styles.search}
            placeholder="Поиск задач..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {currentProject && currentProject.members.length > 0 && (
            <select
              className={styles.select}
              value={filterAssigneeId}
              onChange={(e) => setFilterAssigneeId(e.target.value)}
            >
              <option value="">Все исполнители</option>
              {currentProject.members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.user.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {id && (
        <KanbanBoard
          projectId={id}
          members={currentProject?.members}
          searchQuery={searchQuery}
          filterAssigneeId={filterAssigneeId}
        />
      )}
    </div>
  )
}
