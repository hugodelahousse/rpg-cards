# Templates Directory

This directory contains HTML card templates.

## Adding a New Template

1. Create the template HTML file in this directory (e.g., `my-template.html`)
2. **Important:** Add the template to the `TEMPLATES` array in `src/pages/HomePage.tsx`:
   ```typescript
   const TEMPLATES = [
     { id: 'daggerheart', name: 'Daggerheart', path: '/rpg-cards/templates/daggerheart.html' },
     { id: 'my-template', name: 'My Template', path: '/rpg-cards/templates/my-template.html' },
   ]
   ```

## Template Structure

Templates use `data-slot` attributes to define fillable fields:

- **Text slots:** `<span data-slot="name">Default Text</span>`
- **Image slots:** `<img data-slot="image" data-slot-type="image" src="..." />`
- **Rich content slots:** `<div data-slot="description" data-slot-multiline>HTML content</div>`

Include metadata in the `<head>`:
```html
<meta name="template-name" content="Template Name">
<meta name="template-description" content="Description of the template">
```

## Template Design Guidelines

When creating or modifying card templates, follow these principles:

- **Prefer large bounding boxes with rich content over multiple slots**: Instead of creating separate slots for related content (e.g., `description` and `abilities`), combine them into a single rich content slot using `data-slot-multiline`. This gives users more flexibility with formatting using the rich text editor.
- **Use absolute positioning**: Position elements using CSS `position: absolute` with fixed measurements (mm) for precise card layouts that print consistently.
- **Standard card sizes**: Use 63mm × 88mm (poker/standard) or 70mm × 100mm for card dimensions.
- **Consolidate related content**: Group flavor text, abilities, and effects into one rich content area rather than fragmenting into multiple text slots.
