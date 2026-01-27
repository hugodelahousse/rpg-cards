import { useState, useEffect, useCallback } from 'react'
import type { LocalTemplate } from '../types/localTemplate'
import {
  getAllTemplates,
  getTemplate,
  saveTemplate,
  deleteTemplate,
  createBlankTemplate,
  cloneTemplate,
} from '../utils/templateStorage'

export function useLocalTemplates() {
  const [templates, setTemplates] = useState<LocalTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const loaded = await getAllTemplates()
      setTemplates(loaded)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(async () => {
    const template = await createBlankTemplate()
    await refresh()
    return template
  }, [refresh])

  const clone = useCallback(
    async (sourceHtml: string, name: string, description: string) => {
      const template = await cloneTemplate(sourceHtml, name, description)
      await refresh()
      return template
    },
    [refresh]
  )

  const save = useCallback(
    async (template: LocalTemplate) => {
      await saveTemplate(template)
      await refresh()
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: string) => {
      await deleteTemplate(id)
      await refresh()
    },
    [refresh]
  )

  return {
    templates,
    loading,
    error,
    refresh,
    create,
    clone,
    save,
    remove,
    getTemplate,
  }
}
