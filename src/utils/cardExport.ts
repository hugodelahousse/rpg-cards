import JSZip from 'jszip'
import type { TemplateInfo, Card } from '../types/template'
import { renderCard } from './templateParser'
import { downloadFile, downloadBlob } from './download'

/**
 * Create a standalone HTML document for a card.
 */
function createCardHtml(template: TemplateInfo, cardHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name} Card</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      background-color: #f5f5dc;
    }
    ${template.css}
  </style>
</head>
<body>
  ${cardHtml}
</body>
</html>`
}

/**
 * Render a card to a blob for PNG export.
 */
async function renderCardToBlob(
  template: TemplateInfo,
  cardHtml: string
): Promise<Blob> {
  // Create a temporary container
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  document.body.appendChild(container)

  // Add template CSS
  const style = document.createElement('style')
  style.textContent = template.css
  container.appendChild(style)

  // Add card HTML
  const cardContainer = document.createElement('div')
  cardContainer.innerHTML = cardHtml
  container.appendChild(cardContainer)

  // Wait for images to load
  const images = cardContainer.querySelectorAll('img')
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
          } else {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          }
        })
    )
  )

  // Render to blob (lazy load html-to-image)
  const { toBlob } = await import('html-to-image')
  const blob = await toBlob(cardContainer, {
    pixelRatio: 2,
  })

  // Cleanup
  document.body.removeChild(container)

  if (!blob) {
    throw new Error('Failed to render card to image')
  }

  return blob
}

/**
 * Download a single card as HTML.
 */
export function downloadCardAsHtml(
  template: TemplateInfo,
  card: Card,
  filename?: string
): void {
  const cardHtml = renderCard(template, card.data)
  const fullHtml = createCardHtml(template, cardHtml)
  const name = filename || `${template.name.toLowerCase().replace(/\s+/g, '-')}-card.html`
  downloadFile(fullHtml, name, 'text/html')
}

/**
 * Download a single card as PNG.
 */
export async function downloadCardAsPng(
  template: TemplateInfo,
  card: Card,
  filename?: string
): Promise<void> {
  const cardHtml = renderCard(template, card.data)
  const blob = await renderCardToBlob(template, cardHtml)
  const name = filename || `${template.name.toLowerCase().replace(/\s+/g, '-')}-card.png`
  downloadBlob(blob, name)
}

/**
 * Download multiple cards as a ZIP of HTML files.
 */
export async function downloadCardsAsHtmlZip(
  template: TemplateInfo,
  cards: Card[]
): Promise<void> {
  const zip = new JSZip()
  const baseName = template.name.toLowerCase().replace(/\s+/g, '-')

  cards.forEach((card, index) => {
    const cardHtml = renderCard(template, card.data)
    const fullHtml = createCardHtml(template, cardHtml)
    zip.file(`${baseName}-card-${index + 1}.html`, fullHtml)
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, `${baseName}-cards.zip`)
}

/**
 * Download multiple cards as a ZIP of PNG files.
 */
export async function downloadCardsAsPngZip(
  template: TemplateInfo,
  cards: Card[]
): Promise<void> {
  const zip = new JSZip()
  const baseName = template.name.toLowerCase().replace(/\s+/g, '-')

  const blobs = await Promise.all(
    cards.map((card) => {
      const cardHtml = renderCard(template, card.data)
      return renderCardToBlob(template, cardHtml)
    })
  )

  blobs.forEach((blob, index) => {
    zip.file(`${baseName}-card-${index + 1}.png`, blob)
  })

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(zipBlob, `${baseName}-cards.zip`)
}
