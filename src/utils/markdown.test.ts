/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest'
import { renderCard, parseTemplate } from './templateParser'

describe('Card markdown rendering', () => {
  // Helper to create a simple template with a text slot
  function createTemplate(slotHtml: string) {
    const html = `
      <meta name="template-name" content="Test Template">
      <div class="card">${slotHtml}</div>
    `
    return parseTemplate(html)
  }

  describe('text slot markdown rendering', () => {
    it('renders plain text in text slots', () => {
      const template = createTemplate('<span data-slot="description">Default</span>')
      const result = renderCard(template, { description: 'Hello World' })
      expect(result).toContain('Hello World')
    })

    it('renders bold text in text slots', () => {
      const template = createTemplate('<span data-slot="description">Default</span>')
      const result = renderCard(template, { description: '**bold text**' })
      expect(result).toContain('<strong>bold text</strong>')
    })

    it('renders italic text in text slots', () => {
      const template = createTemplate('<span data-slot="description">Default</span>')
      const result = renderCard(template, { description: '*italic text*' })
      expect(result).toContain('<em>italic text</em>')
    })

    it('renders inline code in text slots', () => {
      const template = createTemplate('<span data-slot="description">Default</span>')
      const result = renderCard(template, { description: '`code`' })
      expect(result).toContain('<code>code</code>')
    })

    it('renders strikethrough in text slots', () => {
      const template = createTemplate('<span data-slot="description">Default</span>')
      const result = renderCard(template, { description: '~~crossed out~~' })
      expect(result).toContain('<del>crossed out</del>')
    })

    it('renders links in text slots', () => {
      const template = createTemplate('<span data-slot="description">Default</span>')
      const result = renderCard(template, { description: '[link](https://example.com)' })
      expect(result).toContain('<a href="https://example.com">link</a>')
    })

    it('renders mixed formatting in text slots', () => {
      const template = createTemplate('<span data-slot="description">Default</span>')
      const result = renderCard(template, {
        description: 'This is **bold** and *italic* text'
      })
      expect(result).toContain('<strong>bold</strong>')
      expect(result).toContain('<em>italic</em>')
    })
  })

  describe('multiline text slot markdown rendering', () => {
    it('renders bullet lists in multiline text slots', () => {
      const template = createTemplate(
        '<div data-slot="abilities" data-slot-multiline>Default</div>'
      )
      const result = renderCard(template, {
        abilities: '- First ability\n- Second ability'
      })
      expect(result).toContain('<ul>')
      expect(result).toContain('<li>First ability</li>')
      expect(result).toContain('<li>Second ability</li>')
    })

    it('renders numbered lists in multiline text slots', () => {
      const template = createTemplate(
        '<div data-slot="steps" data-slot-multiline>Default</div>'
      )
      const result = renderCard(template, {
        steps: '1. Step one\n2. Step two'
      })
      expect(result).toContain('<ol>')
      expect(result).toContain('<li>Step one</li>')
      expect(result).toContain('<li>Step two</li>')
    })

    it('renders bold items in lists', () => {
      const template = createTemplate(
        '<div data-slot="stats" data-slot-multiline>Default</div>'
      )
      const result = renderCard(template, {
        stats: '- **Attack**: +5\n- **Defense**: 12'
      })
      expect(result).toContain('<strong>Attack</strong>')
      expect(result).toContain('<strong>Defense</strong>')
    })
  })

  describe('html slots do not process markdown', () => {
    it('does not process markdown in html slots', () => {
      const template = createTemplate(
        '<div data-slot="content" data-slot-type="html">Default</div>'
      )
      const result = renderCard(template, { content: '**bold**' })
      expect(result).toContain('**bold**')
      expect(result).not.toContain('<strong>')
    })
  })

  describe('image slots do not process markdown', () => {
    it('does not process markdown in image slots', () => {
      const template = createTemplate(
        '<img data-slot="art" data-slot-type="image" src="" />'
      )
      const result = renderCard(template, { art: 'image.png' })
      expect(result).toContain('src="image.png"')
    })
  })

  describe('multiple slots with markdown', () => {
    it('renders markdown in multiple text slots independently', () => {
      const template = createTemplate(`
        <h1 data-slot="title">Title</h1>
        <p data-slot="description">Description</p>
      `)
      const result = renderCard(template, {
        title: '**Fireball**',
        description: 'Deals *fire* damage'
      })
      expect(result).toContain('<strong>Fireball</strong>')
      expect(result).toContain('<em>fire</em>')
    })
  })

  describe('RPG card use cases', () => {
    it('renders daggerheart abilities slot with markdown', () => {
      // Exact structure from daggerheart.html
      const template = createTemplate(`
        <div class="card-abilities" data-slot="abilities" data-slot-multiline>**Ability Name:** Default text</div>
      `)
      const result = renderCard(template, {
        abilities: '**Test Ability:** This is the ability text'
      })
      expect(result).toContain('<strong>Test Ability:</strong>')
      expect(result).not.toContain('**Test Ability:**')
    })

    it('renders spell card with formatted components', () => {
      const template = createTemplate(`
        <h2 data-slot="name">Spell Name</h2>
        <div data-slot="type">Type</div>
        <div data-slot="description" data-slot-multiline>Description</div>
      `)
      const result = renderCard(template, {
        name: '**Fireball**',
        type: '*Evocation*',
        description: '- Range: `60 feet`\n- Damage: **8d6** fire'
      })
      expect(result).toContain('<strong>Fireball</strong>')
      expect(result).toContain('<em>Evocation</em>')
      expect(result).toContain('<code>60 feet</code>')
      expect(result).toContain('<strong>8d6</strong>')
    })

    it('renders monster card with stat block', () => {
      const template = createTemplate(`
        <h2 data-slot="name">Monster Name</h2>
        <div data-slot="stats" data-slot-multiline>Stats</div>
      `)
      const result = renderCard(template, {
        name: '**Goblin**',
        stats: '- **HP**: 7\n- **AC**: 15\n- **Speed**: 30 ft'
      })
      expect(result).toContain('<strong>Goblin</strong>')
      expect(result).toContain('<strong>HP</strong>')
      expect(result).toContain('<strong>AC</strong>')
      expect(result).toContain('<strong>Speed</strong>')
    })

    it('renders item card with properties', () => {
      const template = createTemplate(`
        <h2 data-slot="name">Item Name</h2>
        <div data-slot="rarity">Rarity</div>
        <div data-slot="effect">Effect</div>
      `)
      const result = renderCard(template, {
        name: '**Sword of Flames**',
        rarity: '*Rare*',
        effect: 'Deals an extra `1d6` fire damage'
      })
      expect(result).toContain('<strong>Sword of Flames</strong>')
      expect(result).toContain('<em>Rare</em>')
      expect(result).toContain('<code>1d6</code>')
    })
  })
})
