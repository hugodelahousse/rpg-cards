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

## Design System: Neobrutalist Style

This project follows a **neobrutalist design aesthetic**. All UI changes must adhere to these principles.

### Core Principles
- **Bold borders**: Use thick black borders (`var(--border)`)
- **Offset shadows**: Hard-offset box shadows (`var(--shadow-md)`, `var(--shadow-lg)`)
- **No rounded corners**: Use sharp edges (`border-radius: 0`) or minimal rounding
- **High contrast**: Bold, saturated colors against light backgrounds
- **Raw aesthetic**: Embrace the unpolished, structured look

### CSS Variables (defined in `src/index.css`)

All colors and design tokens are defined as CSS variables in `:root`. Use these variables instead of hardcoded values:

**Colors:**
- `--color-background` - Page background (cream/beige)
- `--color-surface` - Card/container backgrounds (white)
- `--color-primary` - Primary action color (blue)
- `--color-success` - Success/positive actions (green)
- `--color-danger` - Danger/destructive actions (red)
- `--color-accent` - Accent highlights (yellow)
- `--color-accent-light` - Light accent for backgrounds
- `--color-text` - Main text color (black)
- `--color-border` - Border color (black)
- `--color-neutral` - Neutral/secondary backgrounds
- `--color-focus` - Focus state backgrounds

**Shadows:**
- `--shadow-sm` - Small shadow (3px offset)
- `--shadow-md` - Medium shadow (4px offset)
- `--shadow-lg` - Large shadow (6px offset)
- `--shadow-hover` - Hover state shadow (2px offset)
- `--shadow-active` - Active/pressed state (0px)

**Borders:**
- `--border` - Standard solid border
- `--border-dashed` - Dashed border variant

### Typography
- Bold, heavy font weights (600-800)
- System fonts with preference for geometric sans-serif
- Uppercase for headers and buttons where appropriate

### Interactive Elements
- Buttons: Solid backgrounds, thick black borders, offset shadows
- Hover states: Shadow reduction + position shift for "pressed" effect
- Inputs: Thick black borders, no rounded corners, high contrast focus states

### Example Patterns
```css
/* Neobrutalist button */
.button {
  background: var(--color-primary);
  border: var(--border);
  box-shadow: var(--shadow-md);
  font-weight: 700;
  text-transform: uppercase;
}

.button:hover {
  box-shadow: var(--shadow-hover);
  transform: translate(2px, 2px);
}

/* Neobrutalist card/container */
.card {
  background: var(--color-surface);
  border: var(--border);
  box-shadow: var(--shadow-lg);
}
