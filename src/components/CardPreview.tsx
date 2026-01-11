import { useMemo } from 'react'
import type { TemplateInfo, CardData } from '../types/template'
import { renderCard } from '../utils/templateParser'
import styles from './CardPreview.module.css'

interface CardPreviewProps {
  template: TemplateInfo
  cards: CardData[]
  onRemove: (index: number) => void
}

export default function CardPreview({ template, cards, onRemove }: CardPreviewProps) {
  const renderedCards = useMemo(() => {
    return cards.map((card) => renderCard(template, card))
  }, [template, cards])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Cards ({cards.length})</span>
        {cards.length > 0 && (
          <button className={styles.printButton} onClick={handlePrint}>
            Print Cards
          </button>
        )}
      </div>

      {/* Inject template CSS */}
      <style>{template.css}</style>

      <div className={styles.grid}>
        {renderedCards.length === 0 ? (
          <p className={styles.empty}>No cards yet. Fill out the form to add cards.</p>
        ) : (
          renderedCards.map((html, index) => (
            <div key={index} className={styles.cardWrapper}>
              <button
                className={styles.removeButton}
                onClick={() => onRemove(index)}
                title="Remove card"
              >
                ×
              </button>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
