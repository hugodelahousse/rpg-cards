import { useRef, useCallback } from 'react'
import Editor, { loader, type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { tomorrowNightEightiesTheme, TOMORROW_NIGHT_EIGHTIES_THEME } from './editorTheme'
import styles from './CodeEditor.module.css'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: 'html' | 'css'
  darkMode?: boolean
}

// Configure Monaco to lazy load from CDN for optimal bundle size
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs',
  },
})

export function CodeEditor({
  value,
  onChange,
  language = 'html',
  darkMode = true,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor

    // Register custom theme
    monaco.editor.defineTheme(TOMORROW_NIGHT_EIGHTIES_THEME, tomorrowNightEightiesTheme)
    monaco.editor.setTheme(TOMORROW_NIGHT_EIGHTIES_THEME)
  }, [])

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== undefined) {
        onChange(newValue)
      }
    },
    [onChange]
  )

  return (
    <div className={styles.editor}>
      <Editor
        value={value}
        onChange={handleChange}
        language={language}
        theme={darkMode ? TOMORROW_NIGHT_EIGHTIES_THEME : 'light'}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
          lineNumbers: 'on',
          wordWrap: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          bracketPairColorization: { enabled: true },
          renderLineHighlight: 'line',
          padding: { top: 8, bottom: 8 },
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        loading={<div className={styles.loading}>Loading editor...</div>}
      />
    </div>
  )
}

// Default export for lazy loading
export default CodeEditor
