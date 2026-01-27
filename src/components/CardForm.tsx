import { useState, useEffect, Suspense, lazy, useSyncExternalStore } from 'react'
import type { TemplateSlot, CardData } from '../types/template'
import { isRpgCardFormat, convertRpgCards } from '../utils/rpgCardConverter'
import { AlertModal } from './Modal'
import { formatSlotLabel } from '../utils/formatting'
import { createDefaultCardData } from '../utils/cardData'
import styles from './CardForm.module.css'

// Lazy load TiptapEditor for better bundle splitting
const TiptapEditor = lazy(() => import('./TiptapEditor'))

// SSR-safe check for client-side rendering
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

interface EditingCard {
  id: string
  data: CardData
}

interface CardFormProps {
  slots: TemplateSlot[]
  onSubmit: (data: CardData) => void
  onImportJSON: (cards: CardData[]) => void
  onImportRpgCards?: (cards: CardData[]) => void
  onChange?: (data: CardData) => void
  editingCard?: EditingCard | null
  onCancelEdit?: () => void
}

export function CardForm({ slots, onSubmit, onImportJSON, onImportRpgCards, onChange, editingCard, onCancelEdit }: CardFormProps) {
  const [formData, setFormData] = useState<CardData>(() => createDefaultCardData(slots))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const isClient = useIsClient()

  useEffect(() => {
    if (editingCard) {
      setFormData(editingCard.data)
      onChange?.(editingCard.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCard])

  const handleChange = (name: string, value: string) => {
    const newData = { ...formData, [name]: value }
    setFormData(newData)
    onChange?.(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    if (!editingCard) {
      // Reset form to defaults after adding a new card
      const defaultData = createDefaultCardData(slots)
      setFormData(defaultData)
      onChange?.(defaultData)
    }
  }

  const handleCancelEdit = () => {
    const defaultData = createDefaultCardData(slots)
    setFormData(defaultData)
    onChange?.(defaultData)
    onCancelEdit?.()
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

  const handleImageFileChange = (slotName: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      handleChange(slotName, dataUrl)
    }
    reader.readAsDataURL(file)
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
            <div className={styles.imageInputGroup}>
              <input
                type="url"
                className={styles.input}
                value={formData[slot.name]?.startsWith('data:') ? '' : formData[slot.name] || ''}
                onChange={(e) => handleChange(slot.name, e.target.value)}
                placeholder="Image URL"
              />
              <span className={styles.imageInputOr}>or</span>
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handleImageFileChange(slot.name)}
              />
              {formData[slot.name] && (
                <img
                  src={formData[slot.name]}
                  alt="Preview"
                  className={styles.imagePreview}
                />
              )}
            </div>
          ) : slot.type === 'html' ? (
            <textarea
              className={styles.textarea}
              value={formData[slot.name] || ''}
              onChange={(e) => handleChange(slot.name, e.target.value)}
              rows={8}
            />
          ) : slot.richContent ? (
            isClient ? (
              <Suspense fallback={<div className={styles.loading}>Loading editor...</div>}>
                <TiptapEditor
                  value={formData[slot.name] || ''}
                  onChange={(value) => handleChange(slot.name, value)}
                />
              </Suspense>
            ) : (
              <div className={styles.loading}>Loading editor...</div>
            )
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
          {editingCard ? 'Update Card' : 'Add Card'}
        </button>
        {editingCard && (
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={handleCancelEdit}
          >
            Cancel
          </button>
        )}
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
