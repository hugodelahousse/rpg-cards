import { useRef, useEffect, useState, useCallback } from 'react'
import type { TemplateInfo, CardData } from '../types/template'
import { getFontSizeKey } from '../types/template'
import { renderCard } from '../utils/templateParser'
import styles from './InteractiveCard.module.css'

interface SlotPosition {
  name: string
  rect: DOMRect
}

interface InteractiveCardProps {
  template: TemplateInfo
  data: CardData
  onUpdate?: (data: CardData) => void
  showControls?: boolean
}

const FONT_SIZE_STEPS = [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.5, 1.8]

function getNextSize(current: number, direction: 'up' | 'down'): number {
  const idx = FONT_SIZE_STEPS.findIndex((s) => Math.abs(s - current) < 0.01)
  if (direction === 'up') {
    return idx < FONT_SIZE_STEPS.length - 1 ? FONT_SIZE_STEPS[idx + 1] : current
  } else {
    return idx > 0 ? FONT_SIZE_STEPS[idx - 1] : current
  }
}

export default function InteractiveCard({ template, data, onUpdate, showControls = true }: InteractiveCardProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [slotPositions, setSlotPositions] = useState<SlotPosition[]>([])
  const [activeSlot, setActiveSlot] = useState<string | null>(null)

  const html = renderCard(template, data)

  // Find text slots and their positions after render
  useEffect(() => {
    if (!containerRef.current || !showControls || !onUpdate) return

    const updatePositions = () => {
      const container = containerRef.current
      if (!container) return

      const slotElements = container.querySelectorAll('[data-slot]')
      const positions: SlotPosition[] = []

      slotElements.forEach((el) => {
        const name = el.getAttribute('data-slot')
        const type = el.getAttribute('data-slot-type')
        // Only show controls for text/html slots (not images or style slots)
        if (name && type !== 'image' && !el.getAttribute('data-slot-style')) {
          const rect = el.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          // Store position relative to container
          positions.push({
            name,
            rect: new DOMRect(
              rect.left - containerRect.left,
              rect.top - containerRect.top,
              rect.width,
              rect.height
            ),
          })
        }
      })

      setSlotPositions(positions)
    }

    // Update positions after render
    updatePositions()

    // Also update on window resize
    window.addEventListener('resize', updatePositions)
    return () => window.removeEventListener('resize', updatePositions)
  }, [html, showControls, onUpdate])

  const handleFontSizeChange = useCallback(
    (slotName: string, direction: 'up' | 'down') => {
      if (!onUpdate) return

      const fontSizeKey = getFontSizeKey(slotName)
      const currentSize = parseFloat(data[fontSizeKey] || '1')
      const newSize = getNextSize(currentSize, direction)

      if (newSize === 1) {
        // Remove the key if back to default
        const newData = { ...data }
        delete newData[fontSizeKey]
        onUpdate(newData)
      } else {
        onUpdate({ ...data, [fontSizeKey]: String(newSize) })
      }
    },
    [data, onUpdate]
  )

  const getCurrentSize = (slotName: string): string => {
    const fontSizeKey = getFontSizeKey(slotName)
    const size = parseFloat(data[fontSizeKey] || '1')
    return `${Math.round(size * 100)}%`
  }

  return (
    <div
      className={styles.container}
      ref={containerRef}
      onMouseLeave={() => setActiveSlot(null)}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />

      {showControls && onUpdate && slotPositions.map((slot) => (
        <div
          key={slot.name}
          className={`${styles.slotOverlay} ${activeSlot === slot.name ? styles.active : ''}`}
          style={{
            left: slot.rect.left,
            top: slot.rect.top,
            width: slot.rect.width,
            height: slot.rect.height,
          }}
          onMouseEnter={() => setActiveSlot(slot.name)}
          onTouchStart={() => setActiveSlot(activeSlot === slot.name ? null : slot.name)}
        >
          <div className={styles.controls}>
            <button
              className={styles.controlButton}
              onClick={(e) => {
                e.stopPropagation()
                handleFontSizeChange(slot.name, 'down')
              }}
              title="Decrease font size"
            >
              -
            </button>
            <span className={styles.sizeLabel}>{getCurrentSize(slot.name)}</span>
            <button
              className={styles.controlButton}
              onClick={(e) => {
                e.stopPropagation()
                handleFontSizeChange(slot.name, 'up')
              }}
              title="Increase font size"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
