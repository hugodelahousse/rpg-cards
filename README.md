# RPG Cards

A web application for generating printable cards using customizable HTML templates.

> **Disclaimer**: This project is 100% vibe coded using [Claude Code](https://claude.ai/code) on the web. Not bringing my laptop on vacation wasn't going to stop me from working on this project.

## Overview

RPG Cards lets you create printable cards (game cards, flashcards, etc.) using a template-based system. Templates are HTML files that define the card layout and styling, with "slots" that get filled with your content.

### Features

- **Template System**: Define card layouts with HTML/CSS, using `data-slot` attributes to mark fillable areas
- **Dynamic Forms**: The app automatically generates input forms based on template slots
- **Bulk Import**: Upload a JSON file to create multiple cards at once
- **Live Preview**: See your cards rendered in real-time as you edit
- **Print Ready**: One-click print layout that respects your template's card sizing

## Template Format

Templates are HTML files with slots defined using `data-slot` attributes:

```html
<div class="card">
  <h1 data-slot="title">Card Title</h1>
  <img data-slot="image" data-slot-type="image" src="placeholder.png" />
  <p data-slot="description">Card description goes here</p>
  <span data-slot="cost">0</span>
</div>

<style>
  .card {
    width: 63mm;  /* Poker card width */
    height: 88mm; /* Poker card height */
    /* ... your styles ... */
  }
</style>
```

### Slot Types

- **Text slots** (default): `<span data-slot="name">Default</span>`
- **Image slots**: `<img data-slot="artwork" data-slot-type="image" />`

## JSON Import Format

Create multiple cards by uploading a JSON file:

```json
{
  "cards": [
    {
      "title": "Fireball",
      "image": "https://example.com/fireball.png",
      "description": "Deals 3 damage to target",
      "cost": "3"
    },
    {
      "title": "Heal",
      "image": "https://example.com/heal.png",
      "description": "Restore 5 health",
      "cost": "2"
    }
  ]
}
```

## Development

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0

### Setup

```bash
bun install
```

### Commands

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run preview  # Preview production build
```

## Deployment

This app is configured for static deployment on GitHub Pages. The build process pre-renders all routes for static hosting.

## License

MIT

---
*Deployed via GitHub Actions*
