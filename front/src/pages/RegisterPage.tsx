import { RegisterForm } from '@/components/auth/RegisterForm'
import styles from './AuthPage.module.css'

export function RegisterPage() {
  return (
    <div className={styles.page}>
      <RegisterForm />
    </div>
  )
}
