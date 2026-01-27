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
- Rich content: `<div data-slot="description" data-slot-multiline>HTML content</div>`

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

## Design System: Neobrutalist Style

This project follows a **neobrutalist design aesthetic**. All UI changes must adhere to these principles:

- **Bold borders**: Thick black borders, no rounded corners
- **Offset shadows**: Hard-offset box shadows for depth
- **High contrast**: Bold, saturated colors against light backgrounds
- **Raw aesthetic**: Embrace the unpolished, structured look
- **Typography**: Heavy font weights (600-800), uppercase for headers/buttons

CSS variables for colors, shadows, and borders are defined in `src/index.css`. Use these variables instead of hardcoded values.

## Responsive Design

The UI must be **mobile-friendly**. Follow these responsive design principles:

- **Mobile-first approach**: Default styles target mobile, use `min-width` media queries for larger screens
- **Breakpoints**: 480px (small), 600px (medium), 900px (large)
- **Flexible layouts**: Use `grid-template-columns: 1fr` on mobile, expand to multi-column on desktop
- **Stacked elements**: Buttons and form actions stack vertically on mobile
- **Centered content**: Cards center on small screens, align left on larger screens
- **Prevent overflow at the source**: Use `width: 100%`, `max-width`, and flexible units to ensure components never exceed viewport width. Never use `overflow-x: hidden` to hide layout problems.
