# DeltaDevX

A cross-platform desktop application for developers — built with **Tauri v2 + React + TypeScript + Tailwind CSS**. Works 100% offline.

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

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Tauri v2 (Rust) |
| UI Framework | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Code Editor | CodeMirror 6 |
| JSON Diffing | jsondiffpatch |
| Build Tool | Vite |

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

- Zero network requests at runtime
- No telemetry, no analytics
- Fonts loaded via Google Fonts on first launch (cached by browser); falls back to system monospace fonts offline
- Tauri configured with minimum permissions (no filesystem, no shell access)

## To be fixed
Target has rpm and deb but not msi as I deveop in fedora. Modify it to equivalent package name if developing in mac/windows.

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
