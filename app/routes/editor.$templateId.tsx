import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import { useNavigate, Link, redirect } from 'react-router'
import type { Route } from './+types/editor.$templateId'
import { ConfirmModal } from '../../src/components/Modal'

const CodeEditor = lazy(() => import('../../src/components/CodeEditor'))
import { useSaveTemplate, useDeleteTemplate } from '../../src/hooks/useTemplateQueries'
import { getTemplate } from '../../src/utils/templateStorage'
import { parseTemplate, renderCard } from '../../src/utils/templateParser'
import { createDefaultCardData } from '../../src/utils/cardData'
import { downloadHtml } from '../../src/utils/download'
import type { TemplateInfo } from '../../src/types/template'
import styles from '../../src/pages/EditorPage.module.css'

type TabType = 'editor' | 'preview'

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const template = await getTemplate(params.templateId)
  if (!template) {
    throw redirect('/editor')
  }
  return { template }
}

export default function EditorTemplatePage({ loaderData }: Route.ComponentProps) {
  const { template: initialTemplate } = loaderData
  const navigate = useNavigate()
  const saveTemplate = useSaveTemplate()
  const deleteTemplate = useDeleteTemplate()

  const [html, setHtml] = useState(initialTemplate.html)
  const [activeTab, setActiveTab] = useState<TabType>('editor')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [templateName, setTemplateName] = useState(initialTemplate.name)
  const [showSettings, setShowSettings] = useState(false)
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Parse template for preview
  const parsedTemplate: TemplateInfo | null = useMemo(() => {
    try {
      return parseTemplate(html)
    } catch {
      return null
    }
  }, [html])

  // Generate preview card with default values
  const previewCardHtml = useMemo(() => {
    if (!parsedTemplate) return ''
    const defaultData = createDefaultCardData(parsedTemplate.slots)
    return renderCard(parsedTemplate, defaultData)
  }, [parsedTemplate])

  const handleHtmlChange = useCallback((newHtml: string) => {
    setHtml(newHtml)
    setHasUnsavedChanges(true)
  }, [])

  const handleSave = async () => {
    try {
      const parsed = parseTemplate(html)
      await saveTemplate.mutateAsync({
        ...initialTemplate,
        name: templateName || parsed.name,
        description: parsed.description,
        html,
      })
      setHasUnsavedChanges(false)
    } catch (e) {
      console.error('Failed to save:', e)
    }
  }

  const handleDelete = async () => {
    await deleteTemplate.mutateAsync(initialTemplate.id)
    navigate('/editor')
  }

  const handleExport = () => {
    downloadHtml(html, `${templateName || 'template'}.html`)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/editor" className={styles.backButton}>
            TEMPLATES
          </Link>
          <input
            type="text"
            value={templateName}
            onChange={(e) => {
              setTemplateName(e.target.value)
              setHasUnsavedChanges(true)
            }}
            className={styles.titleInput}
            placeholder="Template Name"
          />
          {hasUnsavedChanges && <span className={styles.unsavedBadge}>UNSAVED</span>}
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={styles.settingsButton}
            title="Settings"
          >
            SETTINGS
          </button>
          <button
            onClick={handleSave}
            disabled={saveTemplate.isPending}
            className={styles.saveButton}
          >
            {saveTemplate.isPending ? 'SAVING...' : 'SAVE'}
          </button>
        </div>
      </header>

      {showSettings && (
        <div className={styles.settingsPanel}>
          <button onClick={handleExport} className={styles.actionButton}>
            EXPORT HTML
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} className={styles.deleteButton}>
            DELETE TEMPLATE
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="DELETE"
        variant="danger"
      />

      {/* Mobile tab bar */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'editor' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          EDITOR
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'preview' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          PREVIEW
        </button>
      </div>

      <div className={styles.mainContent}>
        {/* Editor pane */}
        <div
          className={`${styles.editorPane} ${activeTab === 'editor' ? styles.paneActive : ''}`}
        >
          <Suspense fallback={<div className={styles.loading}>Loading editor...</div>}>
            <CodeEditor value={html} onChange={handleHtmlChange} language="html" />
          </Suspense>
        </div>

        {/* Preview pane */}
        <div
          className={`${styles.previewPane} ${activeTab === 'preview' ? styles.paneActive : ''}`}
        >
          <div className={styles.previewContent}>
            <label className={styles.boundingBoxToggle}>
              <input
                type="checkbox"
                checked={showBoundingBoxes}
                onChange={(e) => setShowBoundingBoxes(e.target.checked)}
              />
              <span>SHOW SLOT BOUNDING BOXES</span>
            </label>
            {parsedTemplate ? (
              <>
                <style>{parsedTemplate.css}</style>
                {showBoundingBoxes && (
                  <style>{`
                    [data-slot] {
                      outline: 2px dashed #e63946 !important;
                      outline-offset: 2px;
                      position: relative;
                    }
                    [data-slot]::after {
                      content: attr(data-slot);
                      position: absolute;
                      top: -18px;
                      left: 0;
                      background: #e63946;
                      color: white;
                      font-size: 10px;
                      font-weight: 700;
                      padding: 1px 4px;
                      font-family: 'Fira Code', monospace;
                      white-space: nowrap;
                      z-index: 1000;
                    }
                  `}</style>
                )}
                <div
                  className={styles.cardWrapper}
                  dangerouslySetInnerHTML={{ __html: previewCardHtml }}
                />
                <div className={styles.slotInfo}>
                  <h3>DETECTED SLOTS ({parsedTemplate.slots.length})</h3>
                  <ul>
                    {parsedTemplate.slots.map((slot) => (
                      <li key={slot.name}>
                        <span className={styles.slotName}>{slot.name}</span>
                        <span className={styles.slotType}>{slot.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className={styles.parseError}>
                <h3>PARSE ERROR</h3>
                <p>Could not parse template. Check your HTML syntax.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
