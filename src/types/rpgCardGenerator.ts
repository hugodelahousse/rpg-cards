/**
 * Type definitions for RPG Card Generator format
 * Compatible with https://rpg-cards.vercel.app/ and similar tools
 */

export interface RpgCard {
  count?: number
  color?: string
  title: string
  icon?: string
  icon_back?: string
  contents: string[]
  tags?: string[]
}

export type RpgCardJson = RpgCard | RpgCard[]

/**
 * Parsed content line from the contents array
 */
export type ParsedContent =
  | { type: 'subtitle'; text: string; right?: string }
  | { type: 'rule' }
  | { type: 'ruler' }
  | { type: 'property'; name: string; value: string }
  | { type: 'description'; name: string; value: string }
  | { type: 'text'; content: string }
  | { type: 'section'; title: string; right?: string }
  | { type: 'boxes'; count: number; size: string; text?: string }
  | { type: 'dndstats'; str: string; dex: string; con: string; int: string; wis: string; cha: string }
  | { type: 'bullet'; content: string }
  | { type: 'fill'; size: string }
  | { type: 'picture'; url: string; height?: string }
  | { type: 'unknown'; raw: string }
