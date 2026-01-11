import styles from './HomePage.module.css'

export default function HomePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>RPG Cards</h1>
      <p className={styles.subtitle}>
        Create printable cards using customizable templates
      </p>
    </div>
  )
}
