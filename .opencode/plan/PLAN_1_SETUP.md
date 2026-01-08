# Stage 1: Project Initialization

## Overview
Initialize the diagramming tool project with Vite, React, Bun, and Tailwind v4. Get a hello world app running in the browser.

## Objectives
- Create a Vite + React project using Bun
- Install and configure Tailwind CSS v4
- Verify the development environment works
- Get a basic "Hello World" rendering in the browser

## Tech Stack
- **Runtime**: Bun
- **Build Tool**: Vite
- **Framework**: React (TypeScript)
- **Styling**: Tailwind CSS v4

## Steps

### 1. Create Vite Project
```bash
# Create Vite + React project
bun create vite@latest diagram-tool --template react-ts

cd diagram-tool

# Install dependencies with Bun
bun install
```

### 2. Install Tailwind v4
```bash
bun add -D tailwindcss@next @tailwindcss/vite@next
```

### 3. Configure Vite
Update `vite.config.ts` to include Tailwind plugin:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
});
```

### 4. Configure Tailwind
Update `src/index.css`:
```css
@import "tailwindcss";
```

### 5. Create Basic App
Update `src/App.tsx`:
```tsx
export default function App() {
  return (
    <div className="h-screen w-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800">
        Diagram Tool
      </h1>
    </div>
  );
}
```

### 6. Verify
```bash
bun run dev
```

Visit http://localhost:5173 to verify the app loads correctly.

## Success Criteria
- [ ] Project creates successfully with Bun
- [ ] Tailwind v4 is configured and working
- [ ] "Diagram Tool" text is visible and styled
- [ ] Dev server runs without errors
- [ ] Browser shows the styled component

## Notes
- Bun's package manager will be used throughout the project
- Tailwind v4 uses a new import syntax (`@import "tailwindcss"`)
- No tailwind.config.js needed for basic setup (uses zero-config approach)
