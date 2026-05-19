import { LoginForm } from '@/components/auth/LoginForm'
import styles from './AuthPage.module.css'

export function LoginPage() {
  return (
    <div className={styles.page}>
      <LoginForm />
    </div>
  )
}
