import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

// Tomorrow Night Eighties color palette
// A warm, soft dark theme that's easy on the eyes
const colors = {
  background: '#2d2d2d',
  foreground: '#cccccc',
  selection: '#515151',
  cursor: '#cccccc',
  activeLine: '#393939',
  gutter: '#2d2d2d',
  gutterForeground: '#6c6c6c',
  lineNumber: '#6c6c6c',

  // Syntax colors
  comment: '#999999',
  red: '#f2777a',
  orange: '#f99157',
  yellow: '#ffcc66',
  green: '#99cc99',
  aqua: '#66cccc',
  blue: '#6699cc',
  purple: '#cc99cc',
}

// Editor theme (UI elements)
const tomorrowNightEightiesTheme = EditorView.theme({
  '&': {
    backgroundColor: colors.background,
    color: colors.foreground,
  },
  '.cm-content': {
    caretColor: colors.cursor,
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: colors.cursor,
  },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: colors.selection,
  },
  '.cm-panels': {
    backgroundColor: colors.background,
    color: colors.foreground,
  },
  '.cm-panels.cm-panels-top': {
    borderBottom: `2px solid ${colors.selection}`,
  },
  '.cm-panels.cm-panels-bottom': {
    borderTop: `2px solid ${colors.selection}`,
  },
  '.cm-searchMatch': {
    backgroundColor: '#4a4a00',
    outline: `1px solid ${colors.yellow}`,
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: colors.selection,
  },
  '.cm-activeLine': {
    backgroundColor: colors.activeLine,
  },
  '.cm-selectionMatch': {
    backgroundColor: '#3a3a3a',
  },
  '&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket': {
    backgroundColor: colors.selection,
    outline: `1px solid ${colors.aqua}`,
  },
  '.cm-gutters': {
    backgroundColor: colors.gutter,
    color: colors.gutterForeground,
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: colors.activeLine,
    color: colors.foreground,
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.comment,
  },
  '.cm-tooltip': {
    border: 'none',
    backgroundColor: colors.selection,
  },
  '.cm-tooltip .cm-tooltip-arrow:before': {
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  '.cm-tooltip .cm-tooltip-arrow:after': {
    borderTopColor: colors.selection,
    borderBottomColor: colors.selection,
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li[aria-selected]': {
      backgroundColor: colors.activeLine,
      color: colors.foreground,
    },
  },
}, { dark: true })

// Syntax highlighting
const tomorrowNightEightiesHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: colors.purple },
  { tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName], color: colors.red },
  { tag: [tags.function(tags.variableName), tags.labelName], color: colors.blue },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: colors.orange },
  { tag: [tags.definition(tags.name), tags.separator], color: colors.foreground },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: colors.yellow },
  { tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link, tags.special(tags.string)], color: colors.aqua },
  { tag: [tags.meta, tags.comment], color: colors.comment },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.link, color: colors.aqua, textDecoration: 'underline' },
  { tag: tags.heading, fontWeight: 'bold', color: colors.red },
  { tag: [tags.atom, tags.bool, tags.special(tags.variableName)], color: colors.orange },
  { tag: [tags.processingInstruction, tags.string, tags.inserted], color: colors.green },
  { tag: tags.invalid, color: colors.foreground, backgroundColor: colors.red },
  // HTML specific
  { tag: tags.tagName, color: colors.red },
  { tag: tags.attributeName, color: colors.orange },
  { tag: tags.attributeValue, color: colors.green },
])

// Combined extension to use both theme and highlighting
export const tomorrowNightEighties = [
  tomorrowNightEightiesTheme,
  syntaxHighlighting(tomorrowNightEightiesHighlightStyle),
]

// Export the background color for CSS usage
export const editorBackground = colors.background
