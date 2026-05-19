import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useProjectStore } from '@/store/projectStore'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Loader } from '@/components/common/Loader'
import { ProjectFormData } from '@/utils/validation.utils'
import styles from './ProjectsPage.module.css'

export function ProjectsPage() {
  const { projects, fetchProjects, createProject, deleteProject, isLoading } = useProjectStore()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreate = async (data: ProjectFormData) => {
    setIsCreating(true)
    try {
      await createProject(data)
      setIsCreateOpen(false)
      toast.success('Проект создан')
    } catch {
      toast.error('Ошибка создания проекта')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await deleteProject(deleteId)
      setDeleteId(null)
      toast.success('Проект удалён')
    } catch {
      toast.error('Ошибка удаления')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return <Loader />

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Проекты</h1>
        <button className={styles.createBtn} onClick={() => setIsCreateOpen(true)}>
          + Новый проект
        </button>
      </div>

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <p>Нет проектов. Создайте первый!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Новый проект">
        <ProjectForm onSubmit={handleCreate} isLoading={isCreating} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Удалить проект"
        message="Это действие удалит проект и все его задачи. Отменить нельзя."
        isLoading={isDeleting}
      />
    </div>
  )
}
