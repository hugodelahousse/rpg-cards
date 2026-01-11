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

Include metadata in the `<head>`:
```html
<meta name="template-name" content="Template Name">
<meta name="template-description" content="Description of the template">
```
