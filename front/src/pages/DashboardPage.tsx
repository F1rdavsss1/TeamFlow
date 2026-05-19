import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
import { TaskStatus } from '@/types/task.types'
import { Loader } from '@/components/common/Loader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const { user } = useAuthStore()
  const { projects, fetchProjects, isLoading } = useProjectStore()
  const { tasks } = useTaskStore()

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  if (isLoading) return <Loader />

  const totalTasks = tasks.length
  const doneTasks = tasks.filter((t) => t.status === TaskStatus.DONE).length
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
  const todoTasks = tasks.filter((t) => t.status === TaskStatus.TODO).length

  const chartData = [
    { name: 'К выполнению', value: todoTasks },
    { name: 'В работе', value: inProgressTasks },
    { name: 'Готово', value: doneTasks },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <h1 className={styles.title}>Привет, {user?.name} 👋</h1>
        <p className={styles.subtitle}>Вот что происходит в ваших проектах</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{projects.length}</span>
          <span className={styles.statLabel}>Проектов</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{totalTasks}</span>
          <span className={styles.statLabel}>Задач всего</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{inProgressTasks}</span>
          <span className={styles.statLabel}>В работе</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{doneTasks}</span>
          <span className={styles.statLabel}>Выполнено</span>
        </div>
      </div>

      {totalTasks > 0 && (
        <div className={styles.chart}>
          <h2 className={styles.sectionTitle}>Статус задач</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9399b2' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9399b2' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1a1e2a', border: '1px solid #2a2f3d', borderRadius: 8, color: '#e8eaf0' }}
                cursor={{ fill: 'rgba(167,139,250,0.06)' }}
              />
              <Bar dataKey="value" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Последние проекты</h2>
          <Link to="/projects" className={styles.seeAll}>Все проекты →</Link>
        </div>

        {projects.length === 0 ? (
          <div className={styles.empty}>
            <p>У вас пока нет проектов</p>
            <Link to="/projects" className={styles.createLink}>Создать первый проект</Link>
          </div>
        ) : (
          <div className={styles.projectList}>
            {projects.slice(0, 4).map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className={styles.projectItem}>
                <span className={styles.projectName}>{p.name}</span>
                <span className={styles.projectTasks}>{p._count?.tasks ?? 0} задач</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
