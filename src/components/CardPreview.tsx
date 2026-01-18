import { useMemo, useState } from 'react'
import type { TemplateInfo, CardData, Card } from '../types/template'
import { renderCard } from '../utils/templateParser'
import {
  downloadCardAsHtml,
  downloadCardAsPng,
  downloadCardsAsHtmlZip,
  downloadCardsAsPngZip,
} from '../utils/cardExport'
import InteractiveCard from './InteractiveCard'
import styles from './CardPreview.module.css'

interface CardPreviewProps {
  template: TemplateInfo
  cards: Card[]
  onRemove: (id: string) => void
  onUpdateCard?: (id: string, data: CardData) => void
  onEdit?: (id: string, data: CardData) => void
  previewCard?: CardData | null
}

export function CardPreview({ template, cards, onRemove, onUpdateCard, onEdit, previewCard }: CardPreviewProps) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const renderedPreview = useMemo(() => {
    if (!previewCard) return null
    return renderCard(template, previewCard)
  }, [template, previewCard])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadAllHtml = async () => {
    setIsDownloading(true)
    setShowDownloadMenu(false)
    try {
      if (cards.length === 1) {
        downloadCardAsHtml(template, cards[0])
      } else {
        await downloadCardsAsHtmlZip(template, cards)
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadAllPng = async () => {
    setIsDownloading(true)
    setShowDownloadMenu(false)
    try {
      if (cards.length === 1) {
        await downloadCardAsPng(template, cards[0])
      } else {
        await downloadCardsAsPngZip(template, cards)
      }
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadCardHtml = (card: Card) => {
    downloadCardAsHtml(template, card)
  }

  const handleDownloadCardPng = async (card: Card) => {
    await downloadCardAsPng(template, card)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Cards ({cards.length})</span>
        {cards.length > 0 && (
          <div className={styles.headerActions}>
            <button className={styles.printButton} onClick={handlePrint}>
              Print Cards
            </button>
            <div className={styles.downloadDropdown}>
              <button
                className={styles.downloadButton}
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                disabled={isDownloading}
              >
                {isDownloading ? 'Downloading...' : 'Download'}
              </button>
              {showDownloadMenu && (
                <div className={styles.downloadMenu}>
                  <button
                    className={styles.downloadMenuItem}
                    onClick={handleDownloadAllHtml}
                  >
                    {cards.length === 1 ? 'Download as HTML' : 'Download All as HTML (ZIP)'}
                  </button>
                  <button
                    className={styles.downloadMenuItem}
                    onClick={handleDownloadAllPng}
                  >
                    {cards.length === 1 ? 'Download as PNG' : 'Download All as PNG (ZIP)'}
                  </button>
                </div>
              )}
            </div>
          </div>
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
            {cards.map((card) => (
              <div key={card.id} className={styles.cardWrapper}>
                <div className={styles.cardActions}>
                  <button
                    className={styles.downloadCardButton}
                    onClick={() => handleDownloadCardHtml(card)}
                    title="Download as HTML"
                  >
                    HTML
                  </button>
                  <button
                    className={styles.downloadCardButton}
                    onClick={() => handleDownloadCardPng(card)}
                    title="Download as PNG"
                  >
                    PNG
                  </button>
                  {onEdit && (
                    <button
                      className={styles.editButton}
                      onClick={() => onEdit(card.id, card.data)}
                      title="Edit card"
                    >
                      ✎
                    </button>
                  )}
                  <button
                    className={styles.removeButton}
                    onClick={() => onRemove(card.id)}
                    title="Remove card"
                  >
                    ×
                  </button>
                </div>
                <InteractiveCard
                  template={template}
                  data={card.data}
                  onUpdate={onUpdateCard ? (data) => onUpdateCard(card.id, data) : undefined}
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
