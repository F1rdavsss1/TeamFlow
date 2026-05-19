import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { registerSchema, RegisterFormData } from '@/utils/validation.utils'
import styles from './AuthForm.module.css'

export function RegisterForm() {
  const { register: registerUser, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.email, data.password, data.name)
      navigate('/')
    } catch {
      toast.error('Ошибка регистрации')
    }
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Создать аккаунт</h1>
      <p className={styles.subtitle}>Начните управлять проектами бесплатно</p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Имя</label>
          <input
            type="text"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            placeholder="Иван Иванов"
            {...register('name')}
          />
          {errors.name && <span className={styles.error}>{errors.name.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Пароль</label>
          <input
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder="••••••"
            {...register('password')}
          />
          {errors.password && <span className={styles.error}>{errors.password.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Подтвердите пароль</label>
          <input
            type="password"
            className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
            placeholder="••••••"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>

      <p className={styles.footer}>
        Уже есть аккаунт? <Link to="/login" className={styles.link}>Войти</Link>
      </p>
    </div>
  )
}
