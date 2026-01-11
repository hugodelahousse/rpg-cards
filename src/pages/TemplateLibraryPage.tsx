import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocalTemplates } from '../hooks/useLocalTemplates'
import { BUILT_IN_TEMPLATES } from '../constants/templates'
import { formatDate } from '../utils/formatting'
import type { BuiltInTemplate } from '../types/localTemplate'
import styles from './TemplateLibraryPage.module.css'

export function TemplateLibraryPage() {
  const navigate = useNavigate()
  const { templates, loading, create, clone } = useLocalTemplates()
  const [cloning, setCloning] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const handleCreateNew = async () => {
    const template = await create()
    navigate(`/editor/${template.id}`)
  }

  const handleCloneBuiltIn = async (builtIn: BuiltInTemplate) => {
    setCloning(builtIn.id)
    try {
      const response = await fetch(builtIn.path)
      const html = await response.text()
      const cloned = await clone(html, `${builtIn.name} (Copy)`, '')
      navigate(`/editor/${cloned.id}`)
    } catch (e) {
      console.error('Failed to clone template:', e)
    } finally {
      setCloning(null)
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const html = await file.text()
      const name = file.name.replace(/\.html?$/i, '')
      const imported = await clone(html, name, '')
      navigate(`/editor/${imported.id}`)
    } catch (err) {
      console.error('Failed to import template:', err)
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.backLink}>
            HOME
          </Link>
          <h1 className={styles.title}>TEMPLATE EDITOR</h1>
        </div>
        <div className={styles.headerActions}>
          <label className={styles.importButton}>
            IMPORT HTML
            <input
              type="file"
              accept=".html,.htm"
              onChange={handleImportFile}
              disabled={importing}
              hidden
            />
          </label>
          <button onClick={handleCreateNew} className={styles.createButton}>
            NEW TEMPLATE
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Built-in templates section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>BUILT-IN TEMPLATES</h2>
          <p className={styles.sectionDescription}>
            Clone a built-in template to customize it
          </p>
          <div className={styles.templateGrid}>
            {BUILT_IN_TEMPLATES.map((t) => (
              <div key={t.id} className={styles.templateCard}>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{t.name}</h3>
                  <span className={styles.builtInBadge}>BUILT-IN</span>
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleCloneBuiltIn(t)}
                    disabled={cloning === t.id}
                    className={styles.cloneButton}
                  >
                    {cloning === t.id ? 'CLONING...' : 'CLONE'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Local templates section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>YOUR TEMPLATES</h2>
          {loading ? (
            <p className={styles.loadingText}>Loading...</p>
          ) : templates.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No custom templates yet</p>
              <p className={styles.emptyHint}>
                Create a new template or clone a built-in one to get started
              </p>
            </div>
          ) : (
            <div className={styles.templateGrid}>
              {templates.map((t) => (
                <Link
                  key={t.id}
                  to={`/editor/${t.id}`}
                  className={styles.templateCard}
                >
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{t.name}</h3>
                    <span className={styles.cardDate}>
                      Updated {formatDate(t.updatedAt)}
                    </span>
                  </div>
                  <div className={styles.cardActions}>
                    <span className={styles.editHint}>EDIT</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
