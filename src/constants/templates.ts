import type { BuiltInTemplate } from '../types/localTemplate'

const BASE_URL = import.meta.env.BASE_URL

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  { id: 'daggerheart', name: 'Daggerheart', path: `${BASE_URL}templates/daggerheart.html` },
  { id: 'spell-scroll', name: 'Spell Scroll', path: `${BASE_URL}templates/spell-scroll.html` },
  { id: 'rpg-card', name: 'RPG Card Generator', path: `${BASE_URL}templates/rpg-card.html` },
]

export const RPG_CARD_TEMPLATE_ID = 'rpg-card'
