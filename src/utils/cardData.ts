import type { TemplateSlot, CardData } from '../types/template'

/**
 * Generate a unique ID for a card.
 */
export function generateCardId(): string {
  return crypto.randomUUID()
}

/**
 * Create default card data from template slots.
 */
export function createDefaultCardData(slots: TemplateSlot[]): CardData {
  const data: CardData = {}
  for (const slot of slots) {
    data[slot.name] = slot.defaultValue
  }
  return data
}
