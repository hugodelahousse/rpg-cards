import html2canvas from 'html2canvas'
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
 * Render a card to a canvas element for PNG export.
 */
async function renderCardToCanvas(
  template: TemplateInfo,
  cardHtml: string
): Promise<HTMLCanvasElement> {
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

  // Render to canvas
  const canvas = await html2canvas(cardContainer, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
    allowTaint: true,
  })

  // Cleanup
  document.body.removeChild(container)

  return canvas
}

/**
 * Convert canvas to blob.
 */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('Failed to create blob from canvas'))
      }
    }, 'image/png')
  })
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
  const canvas = await renderCardToCanvas(template, cardHtml)
  const blob = await canvasToBlob(canvas)
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

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i]
    const cardHtml = renderCard(template, card.data)
    const canvas = await renderCardToCanvas(template, cardHtml)
    const blob = await canvasToBlob(canvas)
    zip.file(`${baseName}-card-${i + 1}.png`, blob)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, `${baseName}-cards.zip`)
}
