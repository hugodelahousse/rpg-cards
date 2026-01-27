import type { editor } from 'monaco-editor'

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

export const TOMORROW_NIGHT_EIGHTIES_THEME = 'tomorrow-night-eighties'

export const tomorrowNightEightiesTheme: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    // General
    { token: '', foreground: colors.foreground.slice(1), background: colors.background.slice(1) },
    { token: 'comment', foreground: colors.comment.slice(1), fontStyle: 'italic' },
    { token: 'keyword', foreground: colors.purple.slice(1) },
    { token: 'keyword.control', foreground: colors.purple.slice(1) },
    { token: 'storage', foreground: colors.purple.slice(1) },
    { token: 'storage.type', foreground: colors.purple.slice(1) },

    // Strings
    { token: 'string', foreground: colors.green.slice(1) },
    { token: 'string.html', foreground: colors.green.slice(1) },
    { token: 'attribute.value', foreground: colors.green.slice(1) },
    { token: 'attribute.value.html', foreground: colors.green.slice(1) },

    // Numbers
    { token: 'number', foreground: colors.orange.slice(1) },
    { token: 'constant', foreground: colors.orange.slice(1) },
    { token: 'constant.numeric', foreground: colors.orange.slice(1) },

    // HTML
    { token: 'tag', foreground: colors.red.slice(1) },
    { token: 'tag.html', foreground: colors.red.slice(1) },
    { token: 'metatag', foreground: colors.red.slice(1) },
    { token: 'metatag.html', foreground: colors.red.slice(1) },
    { token: 'metatag.content.html', foreground: colors.red.slice(1) },
    { token: 'delimiter.html', foreground: colors.foreground.slice(1) },
    { token: 'attribute.name', foreground: colors.orange.slice(1) },
    { token: 'attribute.name.html', foreground: colors.orange.slice(1) },

    // CSS
    { token: 'attribute.name.css', foreground: colors.aqua.slice(1) },
    { token: 'attribute.value.css', foreground: colors.green.slice(1) },
    { token: 'attribute.value.number.css', foreground: colors.orange.slice(1) },
    { token: 'attribute.value.unit.css', foreground: colors.orange.slice(1) },
    { token: 'attribute.value.hex.css', foreground: colors.orange.slice(1) },
    { token: 'tag.css', foreground: colors.red.slice(1) },
    { token: 'tag.id.css', foreground: colors.yellow.slice(1) },
    { token: 'tag.class.css', foreground: colors.yellow.slice(1) },

    // Functions and variables
    { token: 'entity.name.function', foreground: colors.blue.slice(1) },
    { token: 'variable', foreground: colors.red.slice(1) },
    { token: 'variable.predefined', foreground: colors.orange.slice(1) },

    // Operators
    { token: 'operator', foreground: colors.aqua.slice(1) },
    { token: 'delimiter', foreground: colors.foreground.slice(1) },

    // Types
    { token: 'type', foreground: colors.yellow.slice(1) },
    { token: 'class', foreground: colors.yellow.slice(1) },

    // Invalid
    { token: 'invalid', foreground: colors.foreground.slice(1), background: colors.red.slice(1) },
  ],
  colors: {
    'editor.background': colors.background,
    'editor.foreground': colors.foreground,
    'editor.selectionBackground': colors.selection,
    'editor.lineHighlightBackground': colors.activeLine,
    'editorCursor.foreground': colors.cursor,
    'editorLineNumber.foreground': colors.lineNumber,
    'editorLineNumber.activeForeground': colors.foreground,
    'editorGutter.background': colors.gutter,
    'editorWidget.background': colors.background,
    'editorWidget.border': colors.selection,
    'editor.selectionHighlightBackground': '#3a3a3a',
    'editor.findMatchBackground': '#4a4a00',
    'editor.findMatchHighlightBackground': '#4a4a0066',
    'editorBracketMatch.background': colors.selection,
    'editorBracketMatch.border': colors.aqua,
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': colors.selection + '80',
    'scrollbarSlider.hoverBackground': colors.selection,
    'scrollbarSlider.activeBackground': colors.selection,
  },
}
