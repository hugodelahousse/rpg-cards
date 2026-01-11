import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { TemplateInfo, CardData } from '../types/template'
import { parseTemplate } from '../utils/templateParser'
import CardForm from '../components/CardForm'
import CardPreview from '../components/CardPreview'
import styles from './HomePage.module.css'

const TEMPLATES = [
  { id: 'daggerheart', name: 'Daggerheart', path: '/rpg-cards/templates/daggerheart.html' },
  { id: 'spell-scroll', name: 'Spell Scroll', path: '/rpg-cards/templates/spell-scroll.html' },
]

export default function HomePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id)
  const [template, setTemplate] = useState<TemplateInfo | null>(null)
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCard, setCurrentCard] = useState<CardData | null>(null)

  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true)
      const templateConfig = TEMPLATES.find((t) => t.id === selectedTemplate)
      if (!templateConfig) return

      try {
        const response = await fetch(templateConfig.path)
        const html = await response.text()
        const parsed = parseTemplate(html)
        setTemplate(parsed)
        setCards([])
      } catch (error) {
        console.error('Failed to load template:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTemplate()
  }, [selectedTemplate])

  const handleAddCard = (data: CardData) => {
    setCards((prev) => [...prev, data])
  }

  const handleImportJSON = (importedCards: CardData[]) => {
    setCards((prev) => [...prev, ...importedCards])
  }

  const handleRemoveCard = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFormChange = (data: CardData) => {
    setCurrentCard(data)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>RPG Cards</h1>
            <p className={styles.subtitle}>Create printable cards using customizable templates</p>
          </div>
          <Link to="/editor" className={styles.editorLink}>
            TEMPLATE EDITOR
          </Link>
        </div>
      </header>

      <div className={styles.templateSelect}>
        <label className={styles.templateLabel}>Template</label>
        <select
          className={styles.select}
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading template...</p>
      ) : template ? (
        <div className={styles.main}>
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Card Details</h2>
            <CardForm
              slots={template.slots}
              onSubmit={handleAddCard}
              onImportJSON={handleImportJSON}
              onChange={handleFormChange}
            />
          </aside>

          <section className={styles.preview}>
            <CardPreview template={template} cards={cards} onRemove={handleRemoveCard} previewCard={currentCard} />
          </section>
        </div>
      ) : (
        <p className={styles.loading}>Failed to load template</p>
      )}
    </div>
  )
}
