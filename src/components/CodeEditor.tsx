import { useRef, useCallback, useSyncExternalStore } from 'react'
import Editor, { loader, type OnMount } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { tomorrowNightEightiesTheme, TOMORROW_NIGHT_EIGHTIES_THEME } from './editorTheme'
import styles from './CodeEditor.module.css'

// SSR-safe check for client-side rendering
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: 'html' | 'css'
  darkMode?: boolean
}

// Configure Monaco to lazy load from CDN for optimal bundle size
// Only configure on client side
if (typeof window !== 'undefined') {
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs',
    },
  })
}

function CodeEditorInner({
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

export function CodeEditor(props: CodeEditorProps) {
  const isClient = useIsClient()

  // Don't render Monaco during SSR - it doesn't support server rendering
  if (!isClient) {
    return <div className={styles.loading}>Loading editor...</div>
  }

  return <CodeEditorInner {...props} />
}

// Default export for lazy loading
export default CodeEditor
