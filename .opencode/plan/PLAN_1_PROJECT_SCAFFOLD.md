# Phase 1: Project Scaffold

## Goal
Get a minimal Vite + React + Bun + Tailwind v4 project running with "Hello World" in the browser.

## Steps

### 1.1 Initialize Project
```bash
# Create Vite React TypeScript project
bun create vite@latest diagram-tool -- --template react-ts

# Enter project directory
cd diagram-tool

# Install dependencies
bun install

# Install Tailwind v4 + PostCSS + Autoprefixer
bun add -D tailwindcss@next postcss autoprefixer

# Install Zustand for state management
bun add zustand

# Install Lucide React for icons
bun add lucide-react

# Install clsx and tailwind-merge for class handling
bun add clsx tailwind-merge
```

### 1.2 Configure Tailwind v4
Create `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Create `src/index.css`:
```css
@import "tailwindcss";
```

### 1.3 Configure Vite (Optional)
Ensure `vite.config.ts` has:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### 1.4 Clean Up & Hello World
- Remove unnecessary default files from `src/`
- Update `App.tsx` to show "Diagram Tool" heading
- Verify project runs: `bun dev`

## Deliverable
Running dev server at `http://localhost:5173` showing basic React app with Tailwind styling.

## Time Estimate
~15-20 minutes

## Dependencies Between Phases
None - this is the foundation.
