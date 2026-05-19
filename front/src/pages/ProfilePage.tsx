import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { usersApi } from '@/services/api/users.api'
import { formatDate } from '@/utils/date.utils'
import styles from './ProfilePage.module.css'

const profileSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  })

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Только изображения')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл не должен превышать 5 МБ')
      return
    }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setAvatarPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [])

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      let avatarUrl = user?.avatarUrl

      // если выбран файл — конвертируем в base64 и отправляем
      if (avatarFile && avatarPreview) {
        avatarUrl = avatarPreview
      }

      const { data: updated } = await usersApi.updateProfile({
        name: data.name,
        avatarUrl: avatarUrl || undefined,
      })
      setUser(updated)
      setAvatarFile(null)
      toast.success('Профиль обновлён')
    } catch {
      toast.error('Ошибка обновления профиля')
    } finally {
      setIsLoading(false)
    }
  }

  const initials = user?.name.charAt(0).toUpperCase() ?? '?'

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Профиль</h1>

      <div className={styles.card}>
        <div className={styles.avatarSection}>
          <div
            className={`${styles.avatarUpload} ${isDragging ? styles.dragging : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Загрузить фото профиля"
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Аватар" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatarInitials}>{initials}</span>
            )}
            <div className={styles.avatarOverlay}>
              <span className={styles.avatarOverlayIcon}>📷</span>
              <span className={styles.avatarOverlayText}>
                {isDragging ? 'Отпустите файл' : 'Изменить фото'}
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileChange}
          />

          <p className={styles.avatarHint}>
            Перетащите фото или нажмите для выбора<br />
            JPG, PNG, GIF · до 5 МБ
          </p>
        </div>

        <div className={styles.info}>
          <p className={styles.name}>{user?.name}</p>
          <p className={styles.email}>{user?.email}</p>
          {user?.createdAt && (
            <p className={styles.joined}>Зарегистрирован {formatDate(user.createdAt)}</p>
          )}
        </div>
      </div>

      <div className={styles.form}>
        <h2 className={styles.sectionTitle}>Редактировать профиль</h2>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.formInner}>
          <div className={styles.field}>
            <label className={styles.label}>Имя</label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="Ваше имя"
              {...register('name')}
            />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.inputDisabled}
              value={user?.email ?? ''}
              disabled
            />
          </div>

          <button type="submit" className={styles.button} disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  )
}
