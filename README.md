<div align="center">

# Kianer Reader

<img src="public/favicon.png" width="80" alt="Kianer Logo" />

**A cross-platform ebook reader built with Vue 3 + Ionic + Capacitor**

Supports EPUB / PDF / TXT — with a sleek glassmorphism UI

</div>

---

<p align="center">
  <a href="README_ZH.md">🇨🇳 中文</a>
</p>

---

## ✨ Features

### 📚 Library Management
- Import EPUB, PDF, TXT files (smart format detection: extension → Magic Number → MIME)
- **Batch import**: select multiple files at once
- Bookshelf grid layout with real-time reading progress
- Search by title/author, four sort modes (recently read / title / progress / import time)
- Duplicate file detection

### 📖 Reader
- **Three rendering engines**: epubjs, pdfjs-dist, paginated plain-text engine
- **Three reading themes**: Light, Eye-care (Parchment), Dark
- **Reading controls**: font size, line height, font family, screen brightness, PDF-independent zoom
- **Two page modes**: simulated book flip (left/right) and continuous scroll
- **Full-text search**: EPUB chapter-by-chapter search, PDF page-by-page search, TXT full-text search
- **Table of contents**: EPUB built-in TOC, PDF outline, TXT chapter detection via regex
- **Bookmarks**: save precise reading position (EPUB CFI / PDF page / TXT page number)
- **Notes & highlights**: select text to annotate, 6 highlight colors, EPUB inline highlights
- **Reading progress**: slider jump + auto-save + progress restoration
- **Immersive mode**: auto-hide status bar

### 📊 Reading Insights
- Total books, finished books, average progress dashboard
- In-progress / unread statistics
- Recent reading log

### 👤 Profile
- Books / notes / bookmarks statistics
- Global dark mode toggle
- **Data backup**: export full data (including book files) as a single file / restore from backup
- One-click data wipe

### 📦 Data Storage
- **IndexedDB** (localforage) for book metadata and binary file data
- Automatic migration from legacy localStorage

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Vue 3 + TypeScript 6 |
| **Mobile** | Ionic 8 + Capacitor 8 |
| **UI** | Element Plus + Iconify + Glassmorphism |
| **State** | Pinia |
| **Build** | Vite 8 + Bun |
| **EPUB** | epubjs |
| **PDF** | pdfjs-dist |
| **Storage** | localforage (IndexedDB) |
| **Testing** | Vitest + Cypress |
| **Linting** | ESLint 10 + @vue/eslint-config-typescript |
| **Styling** | Less |
| **Targets** | Web / Android |

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- [Node.js](https://nodejs.org) ≥ 20 (optional — Bun covers most needs)

### Install Dependencies

```bash
bun install
```

### Start Dev Server

```bash
bun run dev
```

Open `http://localhost:5173` in your browser.

### Lint

```bash
bun run lint
```

---

## 📱 Build & Release

### Web Build

```bash
bun run build
```

Output lands in `dist/`.

### Android Build

```bash
# 1. Build web assets and sync to Android
bun run static:sync

# 2. Open in Android Studio
bun run android:open

# 3. Or build APK directly
bun run android:build
```

Generated APK at `android/app/build/outputs/apk/debug/`.

---

## 📁 Project Structure

```
kianer/
├── public/                    # Static assets
│   ├── favicon.png
│   └── pdf.worker.mjs        # PDF.js worker
├── src/
│   ├── components/
│   │   └── reader/            # Reader sub-components
│   │       ├── ReaderBookmarks.vue
│   │       ├── ReaderControls.vue
│   │       ├── ReaderNotes.vue
│   │       ├── ReaderSearch.vue
│   │       ├── ReaderSettings.vue
│   │       ├── ReaderTOC.vue
│   │       └── SelectionMenu.vue
│   ├── composables/           # Rendering engines
│   │       ├── useEpubEngine.ts
│   │       ├── usePdfEngine.ts
│   │       └── useTxtEngine.ts
│   ├── stores/                # Pinia stores
│   │       ├── library.ts          # Book metadata
│   │       └── reader.ts           # Reader settings
│   ├── utils/
│   │       └── parser.ts           # Metadata extraction (cover, author, etc.)
│   ├── theme/
│   │       ├── glass.less          # Glassmorphism global styles
│   │       └── variables.css       # CSS variables
│   ├── views/
│   │       ├── InsightsPage.vue      # Reading insights
│   │       ├── LibraryPage.vue       # Bookshelf
│   │       ├── ProfilePage.vue       # Profile / settings
│   │       ├── ReaderPage.vue        # Reader
│   │       └── TabsPage.vue          # Bottom tab container
│   ├── router/
│   │       └── index.ts
│   ├── main.ts
│   └── App.vue
├── tests/
│   ├── unit/                  # Vitest unit tests
│   └── e2e/                   # Cypress E2E tests
├── android/                   # Capacitor Android project
├── package.json
├── tsconfig.json
└── eslint.config.js
```

---

## 📄 License

MIT
