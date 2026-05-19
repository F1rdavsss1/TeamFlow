import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProjectStore } from '@/store/projectStore'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
import { Modal } from '@/components/common/Modal'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Loader } from '@/components/common/Loader'
import { ProjectFormData } from '@/utils/validation.utils'
import { formatDate } from '@/utils/date.utils'
import { TaskStatus } from '@/types/task.types'
import { UserRole, User } from '@/types/user.types'
import { usersApi } from '@/services/api/users.api'
import styles from './ProjectDetailPage.module.css'

const roleLabels: Record<UserRole, string> = {
  [UserRole.OWNER]: 'Владелец',
  [UserRole.EDITOR]: 'Редактор',
  [UserRole.VIEWER]: 'Наблюдатель',
}

const roleBadgeClass: Record<UserRole, string> = {
  [UserRole.OWNER]: styles.roleOwner,
  [UserRole.EDITOR]: styles.roleEditor,
  [UserRole.VIEWER]: styles.roleViewer,
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentProject, fetchProject, updateProject, deleteProject, addMember, removeMember, isLoading } = useProjectStore()
  const { tasks, fetchTasks } = useTaskStore()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRemovingMember, setIsRemovingMember] = useState(false)

  // inline поиск участников
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [addRole, setAddRole] = useState<UserRole>(UserRole.EDITOR)
  const [isAdding, setIsAdding] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      fetchProject(id)
      fetchTasks(id)
    }
  }, [id, fetchProject, fetchTasks])

  // поиск с дебаунсом
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (searchQuery.trim().length < 2) { setSearchResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const { data } = await usersApi.search(searchQuery.trim())
        const existingIds = currentProject?.members.map((m) => m.userId) ?? []
        setSearchResults(data.filter((u) => !existingIds.includes(u.id)))
      } catch { setSearchResults([]) }
      finally { setIsSearching(false) }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery, currentProject?.members])

  // закрытие поиска по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (isLoading || !currentProject) return <Loader />

  const projectTasks = tasks.filter((t) => t.projectId === id)
  const done = projectTasks.filter((t) => t.status === TaskStatus.DONE).length
  const inProgress = projectTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
  const progress = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0
  const isOwner = currentProject.ownerId === user?.id

  const handleUpdate = async (data: ProjectFormData) => {
    if (!id) return
    setIsSaving(true)
    try {
      await updateProject(id, data)
      setIsEditOpen(false)
      toast.success('Проект обновлён')
    } catch { toast.error('Ошибка обновления') }
    finally { setIsSaving(false) }
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await deleteProject(id)
      navigate('/projects')
      toast.success('Проект удалён')
    } catch { toast.error('Ошибка удаления') }
    finally { setIsDeleting(false) }
  }

  const handleAddMember = async (u: Pick<User, 'id' | 'email' | 'name' | 'avatarUrl'>) => {
    if (!id) return
    setIsAdding(true)
    try {
      await addMember(id, u.id, addRole)
      toast.success(`${u.name} добавлен`)
      setSearchQuery('')
      setSearchResults([])
      setShowSearch(false)
    } catch { toast.error('Ошибка добавления') }
    finally { setIsAdding(false) }
  }

  const handleRemoveMember = async () => {
    if (!id || !removingMemberId) return
    setIsRemovingMember(true)
    try {
      await removeMember(id, removingMemberId)
      setRemovingMemberId(null)
      toast.success('Участник удалён')
    } catch { toast.error('Ошибка') }
    finally { setIsRemovingMember(false) }
  }

  const removingMember = currentProject.members.find((m) => m.userId === removingMemberId)

  return (
    <div className={styles.page}>

      {/* шапка */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumb}>
            <Link to="/projects" className={styles.breadcrumbLink}>Проекты</Link>
            <span>/</span>
            <span>{currentProject.name}</span>
          </div>
          <h1 className={styles.title}>{currentProject.name}</h1>
          {currentProject.description && (
            <p className={styles.description}>{currentProject.description}</p>
          )}
        </div>
        <div className={styles.headerRight}>
          <Link to={`/projects/${id}/board`} className={styles.boardBtn}>
            Открыть доску →
          </Link>
          {isOwner && (
            <div className={styles.moreActions}>
              <button className={styles.iconBtn} onClick={() => setIsEditOpen(true)} title="Редактировать">✎</button>
              <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} onClick={() => setIsDeleteOpen(true)} title="Удалить">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* статистика + прогресс */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{projectTasks.length}</span>
          <span className={styles.statLabel}>задач</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum} style={{ color: 'var(--warning)' }}>{inProgress}</span>
          <span className={styles.statLabel}>в работе</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className={styles.statNum} style={{ color: 'var(--success)' }}>{done}</span>
          <span className={styles.statLabel}>готово</span>
        </div>
        {currentProject.endDate && (
          <>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNum} style={{ fontSize: 14 }}>{formatDate(currentProject.endDate)}</span>
              <span className={styles.statLabel}>дедлайн</span>
            </div>
          </>
        )}
        <div className={styles.progressWrap}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressPct}>{progress}%</span>
        </div>
      </div>

      {/* участники */}
      <div className={styles.membersSection}>
        <span className={styles.membersLabel}>Команда</span>

        <div className={styles.membersRow}>
          {/* аватары */}
          {currentProject.members.map((m) => (
            <div key={m.userId} className={styles.memberBubble}>
              <div className={styles.memberAvatar}>
                {m.user.avatarUrl
                  ? <img src={m.user.avatarUrl} alt={m.user.name} />
                  : m.user.name.charAt(0).toUpperCase()
                }
              </div>
              {/* тултип */}
              <div className={styles.memberTooltip}>
                <span className={styles.tooltipName}>{m.user.name}</span>
                <span className={`${styles.tooltipRole} ${roleBadgeClass[m.role]}`}>
                  {roleLabels[m.role]}
                </span>
                {isOwner && m.role !== UserRole.OWNER && (
                  <button
                    className={styles.tooltipRemove}
                    onClick={() => setRemovingMemberId(m.userId)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* кнопка добавить */}
          {isOwner && (
            <div className={styles.addMemberWrap} ref={searchRef}>
              <button
                className={styles.addMemberTrigger}
                onClick={() => setShowSearch((v) => !v)}
                title="Добавить участника"
              >
                +
              </button>

              {showSearch && (
                <div className={styles.searchPopup}>
                  <p className={styles.popupTitle}>Добавить участника</p>

                  <input
                    className={styles.searchInput}
                    placeholder="Имя или email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />

                  {/* роль */}
                  <div className={styles.roleToggle}>
                    {([UserRole.EDITOR, UserRole.VIEWER] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        className={`${styles.roleBtn} ${addRole === r ? styles.roleBtnActive : ''}`}
                        onClick={() => setAddRole(r)}
                      >
                        {roleLabels[r]}
                      </button>
                    ))}
                  </div>

                  {isSearching && <p className={styles.searchHint}>Поиск...</p>}
                  {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <p className={styles.searchHint}>Не найдено</p>
                  )}

                  {searchResults.length > 0 && (
                    <div className={styles.searchResults}>
                      {searchResults.map((u) => (
                        <button
                          key={u.id}
                          className={styles.searchResultItem}
                          onClick={() => handleAddMember(u)}
                          disabled={isAdding}
                        >
                          <div className={styles.resultAvatar}>
                            {u.avatarUrl
                              ? <img src={u.avatarUrl} alt={u.name} />
                              : u.name.charAt(0).toUpperCase()
                            }
                          </div>
                          <div className={styles.resultInfo}>
                            <span className={styles.resultName}>{u.name}</span>
                            <span className={styles.resultEmail}>{u.email}</span>
                          </div>
                          <span className={styles.resultAdd}>+</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* задачи по статусам */}
      <div className={styles.tasksSection}>
        <div className={styles.tasksSectionHeader}>
          <span className={styles.membersLabel}>Задачи</span>
          <Link to={`/projects/${id}/board`} className={styles.viewBoardLink}>
            Открыть доску →
          </Link>
        </div>

        <div className={styles.taskColumns}>
          {[
            { status: TaskStatus.TODO, label: 'К выполнению', color: 'var(--text-3)' },
            { status: TaskStatus.IN_PROGRESS, label: 'В работе', color: 'var(--warning)' },
            { status: TaskStatus.DONE, label: 'Готово', color: 'var(--success)' },
          ].map((col) => {
            const colTasks = projectTasks.filter((t) => t.status === col.status)
            return (
              <div key={col.status} className={styles.taskCol}>
                <div className={styles.taskColHeader}>
                  <span className={styles.taskColDot} style={{ background: col.color }} />
                  <span className={styles.taskColLabel}>{col.label}</span>
                  <span className={styles.taskColCount}>{colTasks.length}</span>
                </div>
                <div className={styles.taskColList}>
                  {colTasks.length === 0 && (
                    <p className={styles.taskColEmpty}>Нет задач</p>
                  )}
                  {colTasks.slice(0, 4).map((t) => (
                    <div key={t.id} className={styles.taskItem}>
                      <span className={styles.taskItemTitle}>{t.title}</span>
                      {t.assignee && (
                        <div className={styles.taskItemAvatar} title={t.assignee.name}>
                          {t.assignee.avatarUrl
                            ? <img src={t.assignee.avatarUrl} alt={t.assignee.name} />
                            : t.assignee.name.charAt(0).toUpperCase()
                          }
                        </div>
                      )}
                    </div>
                  ))}
                  {colTasks.length > 4 && (
                    <p className={styles.taskColMore}>+{colTasks.length - 4} ещё</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Редактировать проект">
        <ProjectForm onSubmit={handleUpdate} defaultValues={currentProject} isLoading={isSaving} />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Удалить проект"
        message="Это действие удалит проект и все его задачи. Отменить нельзя."
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={!!removingMemberId}
        onClose={() => setRemovingMemberId(null)}
        onConfirm={handleRemoveMember}
        title="Удалить участника"
        message={`Удалить ${removingMember?.user.name ?? 'участника'} из проекта?`}
        confirmLabel="Удалить"
        isLoading={isRemovingMember}
      />
    </div>
  )
}
