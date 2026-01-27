export interface TemplateSlot {
  name: string
  type: 'text' | 'image' | 'html'
  defaultValue: string
  richContent?: boolean
}

export interface TemplateInfo {
  name: string
  description: string
  html: string
  css: string
  slots: TemplateSlot[]
}

/**
 * CardData stores slot values and optional font size overrides.
 * Font sizes are stored as special keys: `__fontSize__${slotName}` with em values (e.g., "0.8", "1.2")
 */
export type CardData = Record<string, string>

export interface Card {
  id: string
  data: CardData
}

/** Prefix for font size keys in CardData */
export const FONT_SIZE_PREFIX = '__fontSize__'

/** Get the font size key for a slot */
export function getFontSizeKey(slotName: string): string {
  return `${FONT_SIZE_PREFIX}${slotName}`
}
