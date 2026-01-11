import { marked } from 'marked'

// Configure marked for inline rendering (no wrapping <p> tags for simple text)
marked.use({
  renderer: {
    paragraph(token) {
      return token.text
    },
  },
})

/**
 * Renders markdown text to HTML.
 * Uses inline rendering to avoid wrapping simple text in <p> tags.
 */
export function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false }) as string
}
