import { openDB, type IDBPDatabase } from 'idb'
import type { LocalTemplate } from '../types/localTemplate'

const DB_NAME = 'rpg-cards-db'
const DB_VERSION = 1
const STORE_NAME = 'templates'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('updatedAt', 'updatedAt')
        }
      },
    })
  }
  return dbPromise
}

export async function getAllTemplates(): Promise<LocalTemplate[]> {
  const db = await getDB()
  const templates = await db.getAll(STORE_NAME)
  return templates.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getTemplate(id: string): Promise<LocalTemplate | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

export async function saveTemplate(template: LocalTemplate): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, {
    ...template,
    updatedAt: Date.now(),
  })
}

export async function createTemplate(
  name: string,
  description: string,
  html: string
): Promise<LocalTemplate> {
  const id = crypto.randomUUID()
  const now = Date.now()
  const template: LocalTemplate = {
    id,
    name,
    description,
    html,
    createdAt: now,
    updatedAt: now,
  }
  await saveTemplate(template)
  return template
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function cloneTemplate(
  sourceHtml: string,
  newName: string,
  description: string
): Promise<LocalTemplate> {
  return createTemplate(newName, description, sourceHtml)
}

const DEFAULT_TEMPLATE_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="template-name" content="New Template">
  <meta name="template-description" content="A custom card template">
  <style>
    .card {
      width: 63mm;
      height: 88mm;
      padding: 8px;
      border: 2px solid #000;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .card-name {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
    }
    .card-image {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border: 2px solid #000;
      border-radius: 4px;
    }
    .card-description {
      font-size: 11px;
      flex: 1;
      overflow: hidden;
    }
    .card-type {
      font-size: 10px;
      text-align: center;
      text-transform: uppercase;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-name" data-slot="name">Card Name</div>
    <img class="card-image" data-slot="image" data-slot-type="image" src="https://placehold.co/200x80/333/fff?text=Art">
    <div class="card-description" data-slot="description">Card description goes here. You can add more details about the card's abilities or effects.</div>
    <div class="card-type" data-slot="type">Card Type</div>
  </div>
</body>
</html>`

export async function createBlankTemplate(): Promise<LocalTemplate> {
  return createTemplate('New Template', 'A custom card template', DEFAULT_TEMPLATE_HTML)
}

export function getDefaultTemplateHtml(): string {
  return DEFAULT_TEMPLATE_HTML
}
