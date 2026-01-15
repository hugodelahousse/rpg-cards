import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Toast } from '../components/Toast'
import styles from './CharacterPage.module.css'

interface DiceRoll {
  id: number
  diceType: number
  result: number
  timestamp: Date
}

const DICE_TYPES = [4, 6, 8, 10, 12, 20] as const

function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

function DiceIcon({ sides }: { sides: number }) {
  // Simple polygon representations for each dice type
  const getPath = () => {
    switch (sides) {
      case 4: // Triangle (tetrahedron)
        return 'M20 4L36 36H4L20 4Z'
      case 6: // Square (cube)
        return 'M6 6H34V34H6V6Z'
      case 8: // Diamond (octahedron)
        return 'M20 2L38 20L20 38L2 20L20 2Z'
      case 10: // Pentagon-ish (pentagonal trapezohedron)
        return 'M20 2L36 14L32 36H8L4 14L20 2Z'
      case 12: // Pentagon (dodecahedron)
        return 'M20 2L37 14L31 36H9L3 14L20 2Z'
      case 20: // Hexagon-ish (icosahedron)
        return 'M20 2L36 10L36 30L20 38L4 30L4 10L20 2Z'
      default:
        return 'M6 6H34V34H6V6Z'
    }
  }

  return (
    <svg viewBox="0 0 40 40" className={styles.diceIcon}>
      <path d={getPath()} fill="currentColor" stroke="var(--color-border)" strokeWidth="2" />
      <text x="20" y="24" textAnchor="middle" className={styles.diceText}>
        {sides}
      </text>
    </svg>
  )
}

export function CharacterPage() {
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([])
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })
  const [showHistory, setShowHistory] = useState(false)

  const handleRoll = useCallback((sides: number) => {
    const result = rollDice(sides)
    const newRoll: DiceRoll = {
      id: Date.now(),
      diceType: sides,
      result,
      timestamp: new Date(),
    }
    setRollHistory((prev) => [newRoll, ...prev])
    setToast({ message: `D${sides}: ${result}`, visible: true })
  }, [])

  const handleCloseToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }))
  }, [])

  const clearHistory = useCallback(() => {
    setRollHistory([])
  }, [])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>Character</h1>
            <p className={styles.subtitle}>Roll dice and track your results</p>
          </div>
          <Link to="/" className={styles.homeLink}>
            BACK TO CARDS
          </Link>
        </div>
        <div className={styles.diceRow}>
          {DICE_TYPES.map((sides) => (
            <button
              key={sides}
              className={styles.diceButton}
              onClick={() => handleRoll(sides)}
              aria-label={`Roll d${sides}`}
            >
              <DiceIcon sides={sides} />
              <span className={styles.diceLabel}>D{sides}</span>
            </button>
          ))}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.sectionTitle}>Roll History</h2>
            <div className={styles.historyActions}>
              <button
                className={styles.toggleButton}
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'HIDE' : 'SHOW'} ({rollHistory.length})
              </button>
              {rollHistory.length > 0 && (
                <button className={styles.clearButton} onClick={clearHistory}>
                  CLEAR
                </button>
              )}
            </div>
          </div>
          {showHistory && (
            <div className={styles.historyList}>
              {rollHistory.length === 0 ? (
                <p className={styles.emptyHistory}>No rolls yet. Click a dice to roll!</p>
              ) : (
                rollHistory.map((roll) => (
                  <div key={roll.id} className={styles.historyItem}>
                    <span className={styles.historyDice}>D{roll.diceType}</span>
                    <span className={styles.historyResult}>{roll.result}</span>
                    <span className={styles.historyTime}>
                      {roll.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <Toast message={toast.message} isVisible={toast.visible} onClose={handleCloseToast} />
    </div>
  )
}
