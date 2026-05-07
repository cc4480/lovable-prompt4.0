# No-Code Prompt Generator

Generate production-ready prompts for 70+ no-code platforms — Bubble, Webflow, Lovable, Zapier, FlutterFlow, Airtable, Shopify, and more. Pick a platform, fill in your project details, and get a tailored prompt ready to paste.

## Features

- **70+ platforms** across 11 categories (AI App Generators, Full-Stack Builders, Website Builders, Mobile, Database, Automation, E-Commerce, and more)
- **Platform-specific templates** — each category has a tailored prompt template that highlights that platform's strengths
- **Favorites** — star platforms and filter to just your bookmarks (persisted in localStorage)
- **Prompt history** — your last 50 generated prompts are saved across sessions
- **Copy & Share** — one-click copy, plus Web Share API on supported devices
- **Search & filter** — search by name, description, tags, or category; filter by any of 11 categories
- **Keyboard shortcuts** — `⌘K` / `Ctrl+K` or `/` to focus search, `Esc` to clear
- **Accessible** — skip-to-content link, focus trap in modal, ARIA labels, aria-live for output
- **PWA-ready** — web app manifest, theme-color, JSON-LD structured data

## Tech Stack

- **React 19** + TypeScript
- **Vite 8** with `@vitejs/plugin-react`
- **Tailwind CSS v4** (`@tailwindcss/vite`, no config file)
- **Lucide React** for icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── components/
│   ├── Badge.tsx           # Tag badge
│   ├── CategoryFilter.tsx  # Category + Favorites filter chips
│   ├── CopyButton.tsx      # Clipboard copy with visual feedback
│   ├── EmptyState.tsx      # No-results message
│   ├── Header.tsx          # Page header
│   ├── PlatformCard.tsx    # Platform card with favorite toggle
│   ├── PromptGenerator.tsx # Generate-prompt modal
│   ├── SearchBar.tsx       # Search input
│   └── Toast.tsx           # Toast notification system
├── data/
│   ├── categories.ts       # Shared CATEGORY_ICONS map
│   ├── platforms.ts        # 70 platform definitions
│   ├── promptTemplates.ts  # 11 prompt templates (one per category)
│   └── types.ts            # TypeScript types
├── hooks/
│   └── useLocalStorage.ts  # Generic localStorage state hook
├── App.tsx
├── index.css
└── main.tsx
```

## Build

```bash
npm run build   # production build → dist/
npm run preview # preview production build
```
