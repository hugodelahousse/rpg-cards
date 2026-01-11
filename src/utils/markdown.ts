import { marked, Renderer } from 'marked'

// Create a custom renderer that removes <p> tags but keeps inner HTML
const renderer = new Renderer()
renderer.paragraph = function ({ tokens }) {
  return this.parser.parseInline(tokens) + '\n'
}

/**
 * Renders markdown text to HTML.
 * Uses inline rendering to avoid wrapping simple text in <p> tags.
 */
export function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked.parse(text, { async: false, renderer }) as string
}
