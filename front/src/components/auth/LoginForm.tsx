import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { loginSchema, LoginFormData } from '@/utils/validation.utils'
import styles from './AuthForm.module.css'

export function LoginForm() {
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch {
      toast.error('Неверный email или пароль')
    }
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Войти в TeamFlow</h1>
      <p className={styles.subtitle}>Управляйте задачами вместе с командой</p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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

        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Войти'}
        </button>
      </form>

      <p className={styles.footer}>
        Нет аккаунта? <Link to="/register" className={styles.link}>Зарегистрироваться</Link>
      </p>
    </div>
  )
}
