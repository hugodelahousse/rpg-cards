import { useMemo } from 'react'
import type { TemplateInfo, CardData } from '../types/template'
import { renderCard } from '../utils/templateParser'
import InteractiveCard from './InteractiveCard'
import styles from './CardPreview.module.css'

interface CardPreviewProps {
  template: TemplateInfo
  cards: CardData[]
  onRemove: (index: number) => void
  onUpdateCard?: (index: number, data: CardData) => void
  previewCard?: CardData | null
}

export default function CardPreview({ template, cards, onRemove, onUpdateCard, previewCard }: CardPreviewProps) {
  const renderedPreview = useMemo(() => {
    if (!previewCard) return null
    return renderCard(template, previewCard)
  }, [template, previewCard])

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

      {renderedPreview && (
        <div className={styles.previewSection}>
          <span className={styles.previewLabel}>Live Preview</span>
          <div className={styles.grid}>
            <div className={styles.cardWrapper}>
              <div dangerouslySetInnerHTML={{ __html: renderedPreview }} />
            </div>
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div className={styles.cardsSection}>
          <span className={styles.sectionLabel}>Added Cards</span>
          <div className={styles.grid}>
            {cards.map((card, index) => (
              <div key={index} className={styles.cardWrapper}>
                <button
                  className={styles.removeButton}
                  onClick={() => onRemove(index)}
                  title="Remove card"
                >
                  ×
                </button>
                <InteractiveCard
                  template={template}
                  data={card}
                  onUpdate={onUpdateCard ? (data) => onUpdateCard(index, data) : undefined}
                  showControls={!!onUpdateCard}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!renderedPreview && cards.length === 0 && (
        <p className={styles.empty}>No cards yet. Fill out the form to add cards.</p>
      )}
    </div>
  )
}
