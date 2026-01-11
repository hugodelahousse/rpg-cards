# RPG Cards - Development Guide

A client-side React app for generating printable cards from HTML templates.

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 18 + TypeScript
- **Routing**: React Router with static pre-rendering (GitHub Pages)
- **Styling**: CSS Modules

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route page components
├── templates/      # Card template handling (parsing, rendering)
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
└── utils/          # Helper functions
```

## Commands

```bash
bun install        # Install dependencies
bun run dev        # Dev server at localhost:5173
bun run build      # Production build with pre-rendering
bun run preview    # Preview production build
bun run lint       # Run ESLint
bun run typecheck  # Run TypeScript compiler check
```

## Key Concepts

### Template Slots

Templates use `data-slot` attributes to define fillable fields:
- Text: `<span data-slot="name">Default</span>`
- Image: `<img data-slot="art" data-slot-type="image" />`

The app parses templates to extract slots, generates forms dynamically, and renders cards by filling slot values.

### Card Data Flow

1. User selects/uploads template HTML
2. App parses `data-slot` attributes → generates form fields
3. User fills form OR uploads JSON with card data
4. App renders cards by cloning template and filling slots
5. Print view lays out cards respecting template CSS sizing

## Testing

Run verification before committing:
```bash
bun run typecheck && bun run lint && bun run build
```
