import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { TemplateInfo, CardData } from '../types/template'
import type { BuiltInTemplate } from '../types/localTemplate'
import { parseTemplate } from '../utils/templateParser'
import { useLocalTemplates } from '../hooks/useLocalTemplates'
import CardForm from '../components/CardForm'
import CardPreview from '../components/CardPreview'
import styles from './HomePage.module.css'

const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  { id: 'rpg-card', name: 'RPG Card Generator', path: '/rpg-cards/templates/rpg-card.html' },
  { id: 'daggerheart', name: 'Daggerheart', path: '/rpg-cards/templates/daggerheart.html' },
  { id: 'spell-scroll', name: 'Spell Scroll', path: '/rpg-cards/templates/spell-scroll.html' },
]

const RPG_CARD_TEMPLATE_ID = 'rpg-card'

export default function HomePage() {
  const [selectedTemplate, setSelectedTemplate] = useState(BUILT_IN_TEMPLATES[0].id)
  const [template, setTemplate] = useState<TemplateInfo | null>(null)
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentCard, setCurrentCard] = useState<CardData | null>(null)
  const [pendingRpgCards, setPendingRpgCards] = useState<CardData[] | null>(null)

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
        if (pendingRpgCards && parsed.autoSwitchFormat === 'rpg-card-generator') {
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
    setCards((prev) => [...prev, data])
  }

  const handleImportJSON = (importedCards: CardData[]) => {
    setCards((prev) => [...prev, ...importedCards])
  }

  const handleImportRpgCards = (importedCards: CardData[]) => {
    // Only switch templates if current template doesn't support RPG Card Generator format
    if (template?.autoSwitchFormat === 'rpg-card-generator') {
      // Current template supports this format, just import the cards
      setCards((prev) => [...prev, ...importedCards])
    } else {
      // Switch to RPG Card template
      setSelectedTemplate(RPG_CARD_TEMPLATE_ID)
      // Cards will be set after template loads
      setPendingRpgCards(importedCards)
    }
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
