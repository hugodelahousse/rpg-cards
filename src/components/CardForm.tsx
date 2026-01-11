import { useState } from 'react'
import type { TemplateSlot, CardData } from '../types/template'
import { isRpgCardFormat, convertRpgCards } from '../utils/rpgCardConverter'
import styles from './CardForm.module.css'

interface CardFormProps {
  slots: TemplateSlot[]
  onSubmit: (data: CardData) => void
  onImportJSON: (cards: CardData[]) => void
  onImportRpgCards?: (cards: CardData[]) => void
  onChange?: (data: CardData) => void
}

export default function CardForm({ slots, onSubmit, onImportJSON, onImportRpgCards, onChange }: CardFormProps) {
  const [formData, setFormData] = useState<CardData>(() => {
    const initial: CardData = {}
    slots.forEach((slot) => {
      initial[slot.name] = slot.defaultValue
    })
    return initial
  })

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
      alert('Invalid JSON file')
    }
  }

  const formatLabel = (name: string) => {
    return name.replace(/_/g, ' ').replace(/([a-z])([0-9])/g, '$1 $2')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {slots.map((slot) => (
        <div key={slot.name} className={styles.field}>
          <label className={styles.label}>{formatLabel(slot.name)}</label>
          {slot.type === 'image' ? (
            <input
              type="url"
              className={styles.input}
              value={formData[slot.name] || ''}
              onChange={(e) => handleChange(slot.name, e.target.value)}
              placeholder="Image URL"
            />
          ) : slot.type === 'html' ||
            slot.name.includes('description') ||
            slot.name.includes('text') ||
            slot.name.includes('contents') ? (
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
