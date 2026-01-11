import { useState } from 'react'
import type { TemplateSlot, CardData } from '../types/template'
import { isRpgCardFormat, convertRpgCards } from '../utils/rpgCardConverter'
import { AlertModal } from './Modal'
import { formatSlotLabel } from '../utils/formatting'
import { createDefaultCardData } from '../utils/cardData'
import styles from './CardForm.module.css'

interface CardFormProps {
  slots: TemplateSlot[]
  onSubmit: (data: CardData) => void
  onImportJSON: (cards: CardData[]) => void
  onImportRpgCards?: (cards: CardData[]) => void
  onChange?: (data: CardData) => void
}

export function CardForm({ slots, onSubmit, onImportJSON, onImportRpgCards, onChange }: CardFormProps) {
  const [formData, setFormData] = useState<CardData>(() => createDefaultCardData(slots))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleChange = (name: string, value: string) => {
    const newData = { ...formData, [name]: value }
    setFormData(newData)
    onChange?.(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const json = JSON.parse(text)

      // Detect RPG Card Generator format
      if (isRpgCardFormat(json)) {
        const cards = convertRpgCards(json)
        if (onImportRpgCards) {
          onImportRpgCards(cards)
        } else {
          onImportJSON(cards)
        }
      } else {
        const cards: CardData[] = Array.isArray(json) ? json : [json]
        onImportJSON(cards)
      }
    } catch {
      setErrorMessage('Invalid JSON file. Please check the file format and try again.')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <AlertModal
        isOpen={errorMessage !== null}
        onClose={() => setErrorMessage(null)}
        title="Import Error"
        message={errorMessage || ''}
      />

      {slots.map((slot) => (
        <div key={slot.name} className={styles.field}>
          <label className={styles.label}>{formatSlotLabel(slot.name)}</label>
          {slot.type === 'image' ? (
            <input
              type="url"
              className={styles.input}
              value={formData[slot.name] || ''}
              onChange={(e) => handleChange(slot.name, e.target.value)}
              placeholder="Image URL"
            />
          ) : slot.type === 'html' || slot.multiline ? (
            <textarea
              className={styles.textarea}
              value={formData[slot.name] || ''}
              onChange={(e) => handleChange(slot.name, e.target.value)}
              rows={slot.type === 'html' ? 8 : 3}
            />
          ) : (
            <input
              type="text"
              className={styles.input}
              value={formData[slot.name] || ''}
              onChange={(e) => handleChange(slot.name, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className={styles.actions}>
        <button type="submit" className={`${styles.button} ${styles.buttonPrimary}`}>
          Add Card
        </button>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Import from JSON</label>
        <input
          type="file"
          accept=".json"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
      </div>
    </form>
  )
}
