export interface LocalTemplate {
  id: string
  name: string
  description: string
  html: string
  createdAt: number
  updatedAt: number
}

export interface BuiltInTemplate {
  id: string
  name: string
  path: string
}
