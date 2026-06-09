# DeltaDevX

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A cross-platform desktop application for developers for json utilities — built with **Tauri v2 + React + TypeScript + Tailwind CSS**. Works offline.

## Screenshots

### JSON Diff

![JSON Diff Tool](/public/screenshots/json-diff.png)

### JWT Decoder

![JWT Decoder Tool](/public/screenshots/jwt-decoder.png)

## Features

### 🔀 JSON Diff

- Two side-by-side CodeMirror 6 editors with JSON syntax highlighting
- Deep structural comparison using `jsondiffpatch`
- LCS-based line diff with red/green highlighted output panels
- Format JSON (auto-pretty-print) and Clear buttons
- Inline error messages for invalid JSON

### 🔐 JWT Decoder

- Paste any JWT and decode header + payload instantly
- Special handling for `exp`, `iat`, `nbf` fields: shows Unix timestamp + human-readable date
- Highlights expired tokens with a red warning
- Shows raw signature with a note that verification is not performed
- All decoding done in the browser — no network requests, no libraries

## Tech Stack

| Layer         | Technology            |
| ------------- | --------------------- |
| Desktop Shell | Tauri v2 (Rust)       |
| UI Framework  | React 18 + TypeScript |
| Styling       | Tailwind CSS v3       |
| JSON Diffing  | jsondiffpatch         |
| Build Tool    | Vite                  |

## Prerequisites

1. **Node.js** ≥ 18: https://nodejs.org
2. **Rust** (stable): https://www.rust-lang.org/learn/get-started#installing-rust
3. **System dependencies** (Linux):
   ```bash
   # Ubuntu/Debian
   sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
   # Fedora/RHEL
   sudo dnf install webkit2gtk4.1-devel libappindicator-gtk3 librsvg2-devel
   # Arch
   sudo pacman -S webkit2gtk libappindicator-gtk3 librsvg
   ```
4. **Tauri CLI** (installed automatically via npm scripts)

## Setup & Development

```bash
# 1. Clone / navigate to the project
cd deltadevx

# 2. Install npm dependencies
npm install

# 3. Start development (launches Tauri window with hot reload)
npm run tauri dev
```

## Building for Production

```bash
# Build the production bundle and create installable packages
npm run tauri build
```

Output artifacts will be in `src-tauri/target/release/bundle/`.

## Frontend-only Preview

If you just want to preview the UI without Rust/Tauri:

```bash
npm run dev
# Open http://localhost:1420 in your browser
```

## Window Configuration

- **Default size**: 1200 × 750
- **Minimum size**: 900 × 600
- **Centered on launch**: yes
- **Resizable**: yes

## Privacy & Network

- Zero network requests at runtime — fully offline
- No telemetry, no analytics
- All fonts are system fonts (no external requests)
- Tauri configured with minimum permissions (no filesystem, no shell access)

## macOS Installation Note

The app is **ad-hoc signed** (free, no Apple Developer account). On first launch after
downloading the DMG, macOS Gatekeeper will block it. You have two options:

**Option A — Right-click method (easiest):**
1. In Finder, right-click `DeltaDevX.app` → **Open**
2. Click **Open** in the warning dialog
3. From now on it will open normally

**Option B — Terminal (one-time command):**
```bash
sudo xattr -r -d com.apple.quarantine /Applications/DeltaDevX.app
```

This is standard for any open-source app not distributed through the Mac App Store.
All processing is local — nothing leaves your machine.

## Project Structure

```
deltadevx/
├── src-tauri/
│   └── src/
│       ├── main.rs          ← Entry point
│       └── lib.rs           ← Minimal Tauri boilerplate
├── src/
│   ├── App.tsx              ← Root layout with sidebar + view router
│   ├── index.css            ← Global styles + Tailwind
│   ├── main.tsx             ← React entry point
│   ├── components/
│   │   ├── Sidebar.tsx      ← Nav sidebar with theme toggle
│   │   └── TopBar.tsx       ← Page title bar
│   ├── views/
│   │   ├── JsonDiff.tsx     ← JSON diff feature
│   │   └── JwtDecoder.tsx   ← JWT decoder feature
│   └── utils/
│       ├── jsonDiff.ts      ← jsondiffpatch wrapper + LCS diff renderer
│       └── jwtDecode.ts     ← Pure JS JWT decode (atob + TextDecoder)
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Roadmap

### 🧠 NL→SQL: Planned Ollama + SQLCoder Integration

The current parser (`src/utils/nlToSQL.ts`) is regex-based and works offline with no dependencies, but struggles with ambiguous phrasing and complex queries. The plan is to add an **optional** local-LLM mode using [Ollama](https://ollama.com) + `sqlcoder` for production-quality results — fully offline and private.

**How it will work:** On enabling "Ollama mode", the app probes `http://localhost:11434` and, if Ollama is running, sends the NL query + optional schema DDL to `sqlcoder`. If Ollama is unreachable, it silently falls back to the regex parser.

**To try it yourself today:**
```bash
ollama pull sqlcoder
```

**Planned tasks:** UI toggle → Ollama health check → model picker → streaming response → graceful fallback.

> The regex parser will always remain the zero-dependency default.

---

## License

MIT © 2026 DeltaDevX — see [LICENSE](LICENSE) for details.
