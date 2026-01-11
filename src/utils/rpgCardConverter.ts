/**
 * RPG Card Generator format converter
 * Converts cards from https://rpg-cards.vercel.app/ format to this app's CardData format
 */

import type { RpgCard, RpgCardJson, ParsedContent } from '../types/rpgCardGenerator'
import type { CardData } from '../types/template'

/**
 * Check if a JSON object is in RPG Card Generator format
 */
export function isRpgCardFormat(json: unknown): json is RpgCardJson {
  if (Array.isArray(json)) {
    return json.length > 0 && isRpgCard(json[0])
  }
  return isRpgCard(json)
}

function isRpgCard(obj: unknown): obj is RpgCard {
  if (typeof obj !== 'object' || obj === null) return false
  const card = obj as Record<string, unknown>
  return (
    typeof card.title === 'string' &&
    Array.isArray(card.contents) &&
    card.contents.every((c) => typeof c === 'string')
  )
}

/**
 * Parse a single content line from the contents array
 */
export function parseContentLine(line: string): ParsedContent {
  const trimmed = line.trim()

  // Handle simple types without parameters
  if (trimmed === 'rule') {
    return { type: 'rule' }
  }
  if (trimmed === 'ruler') {
    return { type: 'ruler' }
  }

  // Parse "type | param1 | param2 | ..." format
  const parts = trimmed.split('|').map((p) => p.trim())
  const contentType = parts[0].toLowerCase()

  switch (contentType) {
    case 'subtitle':
      return { type: 'subtitle', text: parts[1] || '', right: parts[2] }

    case 'property':
      return { type: 'property', name: parts[1] || '', value: parts[2] || '' }

    case 'description':
      return { type: 'description', name: parts[1] || '', value: parts[2] || '' }

    case 'text':
      return { type: 'text', content: parts[1] || '' }

    case 'section':
      return { type: 'section', title: parts[1] || '', right: parts[2] }

    case 'boxes':
      return {
        type: 'boxes',
        count: parseInt(parts[1], 10) || 4,
        size: parts[2] || '1.2',
        text: parts[3],
      }

    case 'dndstats':
      return {
        type: 'dndstats',
        str: parts[1] || '10',
        dex: parts[2] || '10',
        con: parts[3] || '10',
        int: parts[4] || '10',
        wis: parts[5] || '10',
        cha: parts[6] || '10',
      }

    case 'bullet':
      return { type: 'bullet', content: parts[1] || '' }

    case 'fill':
      return { type: 'fill', size: parts[1] || '1' }

    case 'picture':
      return { type: 'picture', url: parts[1] || '', height: parts[2] }

    default:
      return { type: 'unknown', raw: trimmed }
  }
}

/**
 * Calculate ability score modifier
 */
function getModifier(score: string): string {
  const num = parseInt(score, 10)
  if (isNaN(num)) return '+0'
  const mod = Math.floor((num - 10) / 2)
  return mod >= 0 ? `+${mod}` : `${mod}`
}

/**
 * Render a parsed content line to HTML
 */
export function renderContentToHtml(content: ParsedContent): string {
  switch (content.type) {
    case 'subtitle':
      return `<p class="rpg-subtitle">${escapeHtml(content.text)}${content.right ? `<span class="rpg-right">${escapeHtml(content.right)}</span>` : ''}</p>`

    case 'rule':
      return '<hr class="rpg-rule" />'

    case 'ruler':
      return '<hr class="rpg-ruler" />'

    case 'property':
      return `<p class="rpg-property"><strong class="rpg-property-name">${escapeHtml(content.name)}</strong> <span class="rpg-property-value">${escapeHtml(content.value)}</span></p>`

    case 'description':
      return `<p class="rpg-description"><strong class="rpg-description-name">${escapeHtml(content.name)}</strong> ${escapeHtml(content.value)}</p>`

    case 'text':
      return `<p class="rpg-text">${escapeHtml(content.content)}</p>`

    case 'section':
      return `<h3 class="rpg-section">${escapeHtml(content.title)}${content.right ? `<span class="rpg-right">${escapeHtml(content.right)}</span>` : ''}</h3>`

    case 'boxes': {
      const boxes = Array(content.count)
        .fill(null)
        .map(() => `<span class="rpg-box" style="width: ${content.size}em; height: ${content.size}em;"></span>`)
        .join('')
      return `<p class="rpg-boxes">${boxes}${content.text ? ` <span class="rpg-boxes-text">${escapeHtml(content.text)}</span>` : ''}</p>`
    }

    case 'dndstats':
      return `<table class="rpg-stats">
        <thead>
          <tr>
            <th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${escapeHtml(content.str)} <span class="rpg-mod">(${getModifier(content.str)})</span></td>
            <td>${escapeHtml(content.dex)} <span class="rpg-mod">(${getModifier(content.dex)})</span></td>
            <td>${escapeHtml(content.con)} <span class="rpg-mod">(${getModifier(content.con)})</span></td>
            <td>${escapeHtml(content.int)} <span class="rpg-mod">(${getModifier(content.int)})</span></td>
            <td>${escapeHtml(content.wis)} <span class="rpg-mod">(${getModifier(content.wis)})</span></td>
            <td>${escapeHtml(content.cha)} <span class="rpg-mod">(${getModifier(content.cha)})</span></td>
          </tr>
        </tbody>
      </table>`

    case 'bullet':
      return `<p class="rpg-bullet">${escapeHtml(content.content)}</p>`

    case 'fill':
      return `<div class="rpg-fill" style="flex: ${content.size};"></div>`

    case 'picture':
      return `<img class="rpg-picture" src="${escapeHtml(content.url)}" ${content.height ? `style="height: ${content.height}px;"` : ''} alt="" />`

    case 'unknown':
      return `<p class="rpg-text">${escapeHtml(content.raw)}</p>`
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  // First, preserve intentional HTML tags like <i>, <b>, <br>
  // by temporarily replacing them
  const preserved: { placeholder: string; original: string }[] = []
  let processed = text

  // Preserve allowed HTML tags
  const allowedTags = ['i', 'b', 'em', 'strong', 'br', 'u']
  allowedTags.forEach((tag) => {
    const openRegex = new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi')
    const closeRegex = new RegExp(`</${tag}>`, 'gi')

    processed = processed.replace(openRegex, (match) => {
      const placeholder = `__PRESERVE_${preserved.length}__`
      preserved.push({ placeholder, original: match })
      return placeholder
    })

    processed = processed.replace(closeRegex, (match) => {
      const placeholder = `__PRESERVE_${preserved.length}__`
      preserved.push({ placeholder, original: match })
      return placeholder
    })
  })

  // Escape remaining HTML
  processed = processed
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

  // Restore preserved tags
  preserved.forEach(({ placeholder, original }) => {
    processed = processed.replace(placeholder, original)
  })

  return processed
}

/**
 * Convert a full RPG card to rendered HTML content
 */
export function renderRpgCardContents(card: RpgCard): string {
  return card.contents.map((line) => renderContentToHtml(parseContentLine(line))).join('\n')
}

/**
 * Convert an RPG Card Generator card to this app's CardData format
 */
export function convertRpgCard(card: RpgCard): CardData {
  return {
    title: card.title,
    color: card.color || '#4a6898',
    icon: card.icon || '',
    contents: renderRpgCardContents(card),
    tags: card.tags?.join(', ') || '',
  }
}

/**
 * Convert RPG Card Generator JSON to CardData array
 * Respects the "count" field to duplicate cards
 */
export function convertRpgCards(json: RpgCardJson): CardData[] {
  const cards = Array.isArray(json) ? json : [json]
  const result: CardData[] = []

  for (const card of cards) {
    const converted = convertRpgCard(card)
    const count = card.count || 1
    for (let i = 0; i < count; i++) {
      result.push({ ...converted })
    }
  }

  return result
}
