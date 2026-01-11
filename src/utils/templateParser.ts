import type { TemplateInfo, TemplateSlot } from '../types/template'

export function parseTemplate(html: string): TemplateInfo {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Extract metadata
  const nameMeta = doc.querySelector('meta[name="template-name"]')
  const descMeta = doc.querySelector('meta[name="template-description"]')
  const name = nameMeta?.getAttribute('content') || 'Unnamed Template'
  const description = descMeta?.getAttribute('content') || ''

  // Extract CSS
  const styleElement = doc.querySelector('style')
  const css = styleElement?.textContent || ''

  // Extract slots
  const slots: TemplateSlot[] = []
  const slotElements = doc.querySelectorAll('[data-slot]')

  slotElements.forEach((el) => {
    const slotName = el.getAttribute('data-slot')
    if (!slotName) return

    const slotTypeAttr = el.getAttribute('data-slot-type')
    const slotStyle = el.getAttribute('data-slot-style')
    let slotType: 'text' | 'image' | 'html' = 'text'
    if (slotTypeAttr === 'image') {
      slotType = 'image'
    } else if (slotTypeAttr === 'html') {
      slotType = 'html'
    }

    let defaultValue = ''
    if (slotStyle) {
      // Extract default value from inline style
      const style = (el as HTMLElement).style
      defaultValue = style.getPropertyValue(slotStyle) || ''
    } else if (slotType === 'image') {
      defaultValue = (el as HTMLImageElement).src || ''
    } else if (slotType === 'html') {
      defaultValue = el.innerHTML?.trim() || ''
    } else {
      defaultValue = el.textContent?.trim() || ''
    }

    // Avoid duplicates
    if (!slots.find((s) => s.name === slotName)) {
      slots.push({ name: slotName, type: slotType, defaultValue })
    }
  })

  // Extract body content (the card HTML)
  const bodyContent = doc.body.innerHTML

  return { name, description, html: bodyContent, css, slots }
}

export function renderCard(template: TemplateInfo, data: Record<string, string>): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(template.html, 'text/html')

  const slotElements = doc.querySelectorAll('[data-slot]')
  slotElements.forEach((el) => {
    const slotName = el.getAttribute('data-slot')
    if (!slotName || !(slotName in data)) return

    const slotType = el.getAttribute('data-slot-type')
    const slotStyle = el.getAttribute('data-slot-style')

    // Handle style-based slots (e.g., data-slot-style="background-color")
    if (slotStyle) {
      ;(el as HTMLElement).style.setProperty(slotStyle, data[slotName])
      return
    }

    if (slotType === 'image') {
      (el as HTMLImageElement).src = data[slotName]
    } else if (slotType === 'html') {
      el.innerHTML = data[slotName]
    } else {
      el.textContent = data[slotName]
    }
  })

  return doc.body.innerHTML
}
