import { useEffect, useRef, useCallback } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
} from '@codemirror/language'
import { oneDark } from '@codemirror/theme-one-dark'
import styles from './CodeEditor.module.css'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: 'html' | 'css'
  darkMode?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language = 'html',
  darkMode = true,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const initialValueRef = useRef(value)

  // Keep refs updated
  onChangeRef.current = onChange
  // Update initial value ref only when editor is recreated
  if (!viewRef.current) {
    initialValueRef.current = value
  }

  const updateListener = useCallback(() => {
    return EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newValue = update.state.doc.toString()
        onChangeRef.current(newValue)
      }
    })
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      language === 'html' ? html() : css(),
      updateListener(),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14px',
        },
        '.cm-scroller': {
          overflow: 'auto',
          fontFamily: "'Fira Code', 'Monaco', 'Consolas', monospace",
        },
        '.cm-content': {
          padding: '8px 0',
        },
        '.cm-gutters': {
          borderRight: '3px solid #000',
        },
      }),
    ]

    if (darkMode) {
      extensions.push(oneDark)
    }

    const state = EditorState.create({
      doc: initialValueRef.current,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [language, darkMode, updateListener])

  // Update content when value changes externally
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentContent = view.state.doc.toString()
    if (currentContent !== value) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: value,
        },
      })
    }
  }, [value])

  return <div ref={editorRef} className={styles.editor} />
}
