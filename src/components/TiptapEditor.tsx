import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import { useEffect, useCallback, useSyncExternalStore } from 'react'
import styles from './TiptapEditor.module.css'

// SSR-safe check for client-side rendering
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

function useIsClient() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

interface TiptapEditorProps {
  value: string
  onChange: (value: string) => void
}

const COLORS = [
  '#000000', // Black
  '#ffffff', // White
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
]

function TiptapEditorInner({ value, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['paragraph'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const setColor = useCallback((color: string) => {
    editor?.chain().focus().setColor(color).run()
  }, [editor])

  if (!editor) {
    return <div className={styles.loading}>Loading editor...</div>
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={`${styles.toolbarButton} ${editor.isActive('underline') ? styles.active : ''}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>

        <span className={styles.separator} />

        <button
          type="button"
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'left' }) ? styles.active : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align Left"
        >
          ≡
        </button>
        <button
          type="button"
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'center' }) ? styles.active : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Center"
        >
          ≡
        </button>
        <button
          type="button"
          className={`${styles.toolbarButton} ${editor.isActive({ textAlign: 'right' }) ? styles.active : ''}`}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align Right"
        >
          ≡
        </button>

        <span className={styles.separator} />

        <div className={styles.colorPicker}>
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={styles.colorButton}
              style={{ backgroundColor: color }}
              onClick={() => setColor(color)}
              title={`Color: ${color}`}
            />
          ))}
        </div>
      </div>
      <EditorContent editor={editor} className={styles.content} />
    </div>
  )
}

export function TiptapEditor(props: TiptapEditorProps) {
  const isClient = useIsClient()

  // Don't render Tiptap during SSR - it doesn't support server rendering
  if (!isClient) {
    return <div className={styles.loading}>Loading editor...</div>
  }

  return <TiptapEditorInner {...props} />
}

// Default export for lazy loading
export default TiptapEditor
