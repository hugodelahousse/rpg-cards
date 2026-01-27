import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import type { TemplateInfo, CardData, Card } from '../../src/types/template'
import { parseTemplate } from '../../src/utils/templateParser'
import { useLocalTemplates } from '../../src/hooks/useLocalTemplates'
import { BUILT_IN_TEMPLATES, RPG_CARD_TEMPLATE_ID } from '../../src/constants/templates'
import { generateCardId } from '../../src/utils/cardData'
import { CardForm } from '../../src/components/CardForm'
import { CardPreview } from '../../src/components/CardPreview'
import styles from '../../src/pages/HomePage.module.css'

export default function HomePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(BUILT_IN_TEMPLATES[0].id)
  const [template, setTemplate] = useState<TemplateInfo | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCard, setCurrentCard] = useState<CardData | null>(null)
  const [pendingRpgCards, setPendingRpgCards] = useState<Card[] | null>(null)
  const [editingCard, setEditingCard] = useState<{ id: string; data: CardData } | null>(null)

  const { templates: localTemplates, loading: localLoading, getTemplate } = useLocalTemplates()

  const allTemplates = useMemo(() => {
    const builtIn = BUILT_IN_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      isBuiltIn: true as const,
      path: t.path,
    }))
    const local = localTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      isBuiltIn: false as const,
    }))
    return [...builtIn, ...local]
  }, [localTemplates])

  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true)
      const templateConfig = allTemplates.find((t) => t.id === selectedTemplate)
      if (!templateConfig) return

      try {
        let html: string
        if (templateConfig.isBuiltIn) {
          const response = await fetch(templateConfig.path)
          html = await response.text()
        } else {
          const localTemplate = await getTemplate(selectedTemplate)
          if (!localTemplate) {
            console.error('Template not found:', selectedTemplate)
            return
          }
          html = localTemplate.html
        }
        const parsed = parseTemplate(html)
        setTemplate(parsed)
        // If there are pending RPG cards, add them after template loads
        if (pendingRpgCards && selectedTemplate === RPG_CARD_TEMPLATE_ID) {
          setCards(pendingRpgCards)
          setPendingRpgCards(null)
        } else {
          setCards([])
        }
      } catch (error) {
        console.error('Failed to load template:', error)
      } finally {
        setLoading(false)
      }
    }

    if (!localLoading) {
      loadTemplate()
    }
  }, [selectedTemplate, allTemplates, localLoading, getTemplate, pendingRpgCards])

  const handleAddCard = (data: CardData) => {
    if (editingCard) {
      // Update existing card
      setCards((prev) => prev.map((card) => (card.id === editingCard.id ? { ...card, data } : card)))
      setEditingCard(null)
    } else {
      // Add new card
      setCards((prev) => [...prev, { id: generateCardId(), data }])
    }
  }

  const handleEditCard = (id: string, data: CardData) => {
    setEditingCard({ id, data })
  }

  const handleCancelEdit = () => {
    setEditingCard(null)
  }

  const handleImportJSON = (importedCards: CardData[]) => {
    const newCards = importedCards.map((data) => ({ id: generateCardId(), data }))
    setCards((prev) => [...prev, ...newCards])
  }

  const handleImportRpgCards = (importedCards: CardData[]) => {
    const newCards = importedCards.map((data) => ({ id: generateCardId(), data }))
    // Switch to RPG Card template if not already selected
    if (selectedTemplate !== RPG_CARD_TEMPLATE_ID) {
      setSelectedTemplate(RPG_CARD_TEMPLATE_ID)
      // Cards will be set after template loads
      setPendingRpgCards(newCards)
    } else {
      setCards((prev) => [...prev, ...newCards])
    }
  }

  const handleRemoveCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id))
  }

  const handleUpdateCard = (id: string, data: CardData) => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, data } : card)))
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
          disabled={localLoading}
        >
          <optgroup label="Built-in">
            {BUILT_IN_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </optgroup>
          {localTemplates.length > 0 && (
            <optgroup label="Your Templates">
              {localTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {loading || localLoading ? (
        <p className={styles.loading}>Loading template...</p>
      ) : template ? (
        <div className={styles.main}>
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Card Details</h2>
            <CardForm
              slots={template.slots}
              onSubmit={handleAddCard}
              onImportJSON={handleImportJSON}
              onImportRpgCards={handleImportRpgCards}
              onChange={handleFormChange}
              editingCard={editingCard}
              onCancelEdit={handleCancelEdit}
            />
          </aside>

          <section className={styles.preview}>
            <CardPreview template={template} cards={cards} onRemove={handleRemoveCard} onUpdateCard={handleUpdateCard} onEdit={handleEditCard} previewCard={currentCard} />
          </section>
        </div>
      ) : (
        <p className={styles.loading}>Failed to load template</p>
      )}
    </div>
  )
}
