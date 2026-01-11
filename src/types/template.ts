export interface TemplateSlot {
  name: string
  type: 'text' | 'image' | 'html'
  defaultValue: string
}

export interface TemplateInfo {
  name: string
  description: string
  html: string
  css: string
  slots: TemplateSlot[]
}

export type CardData = Record<string, string>

export interface Card {
  id: string
  data: CardData
}
