import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import styles from './Header.module.css'

export function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.spacer} />
      <div className={styles.user}>
        <div className={styles.avatar}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} />
          ) : (
            <span>{user?.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className={styles.userName}>{user?.name}</span>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Выйти
        </button>
      </div>
    </header>
  )
}
