import styles from './Loader.module.css'

interface LoaderProps {
  fullPage?: boolean
}

export function Loader({ fullPage }: LoaderProps) {
  return (
    <div className={`${styles.wrapper} ${fullPage ? styles.fullPage : ''}`}>
      <div className={styles.spinner} />
    </div>
  )
}
