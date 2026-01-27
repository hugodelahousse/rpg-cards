import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { LocalTemplate } from '../types/localTemplate'
import type { TemplateInfo } from '../types/template'
import {
  getAllTemplates,
  getTemplate,
  saveTemplate,
  deleteTemplate,
  createBlankTemplate,
  cloneTemplate,
} from '../utils/templateStorage'
import { parseTemplate } from '../utils/templateParser'
import { BUILT_IN_TEMPLATES } from '../constants/templates'

export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
  parsed: (id: string) => [...templateKeys.all, 'parsed', id] as const,
}

export function useLocalTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: getAllTemplates,
  })
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: templateKeys.detail(id ?? ''),
    queryFn: () => (id ? getTemplate(id) : Promise.resolve(undefined)),
    enabled: !!id,
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBlankTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

export function useCloneTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      sourceHtml,
      name,
      description,
    }: {
      sourceHtml: string
      name: string
      description: string
    }) => cloneTemplate(sourceHtml, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
    },
  })
}

export function useSaveTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveTemplate,
    onSuccess: (_, template) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(template.id) })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTemplate,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() })
      queryClient.removeQueries({ queryKey: templateKeys.detail(id) })
    },
  })
}

async function fetchAndParseTemplate(
  templateId: string,
  localTemplates: LocalTemplate[]
): Promise<TemplateInfo> {
  const builtIn = BUILT_IN_TEMPLATES.find((t) => t.id === templateId)
  let html: string

  if (builtIn) {
    const response = await fetch(builtIn.path)
    html = await response.text()
  } else {
    const local = localTemplates.find((t) => t.id === templateId)
    if (!local) {
      throw new Error(`Template not found: ${templateId}`)
    }
    html = local.html
  }

  return parseTemplate(html)
}

export function useParsedTemplate(
  templateId: string,
  localTemplates: LocalTemplate[]
) {
  return useQuery({
    queryKey: templateKeys.parsed(templateId),
    queryFn: () => fetchAndParseTemplate(templateId, localTemplates),
    enabled: !!templateId && localTemplates !== undefined,
  })
}
