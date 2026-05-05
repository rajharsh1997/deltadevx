#!/usr/bin/env node
/**
 * sync-tauri-versions.mjs
 *
 * Reads the resolved `tauri` crate version from Cargo.lock, then updates
 * the @tauri-apps/api npm package to match the same major.minor.
 *
 * Usage:
 *   npm run tauri:sync          ← just syncs npm to match Cargo.lock
 *   npm run tauri:update        ← runs `cargo update` first, then syncs
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const lockPath = resolve(root, 'src-tauri', 'Cargo.lock')

// ── 1. Parse the tauri crate version from Cargo.lock ──────────────────────
const lockContent = readFileSync(lockPath, 'utf8')

// Cargo.lock entries look like:
//   [[package]]
//   name = "tauri"
//   version = "2.11.0"
const match = lockContent.match(/\[\[package\]\]\s+name\s*=\s*"tauri"\s+version\s*=\s*"([^"]+)"/)

if (!match) {
  console.error('❌ Could not find tauri crate version in Cargo.lock')
  process.exit(1)
}

const crateVersion = match[1]  // e.g. "2.11.0"
const [major, minor] = crateVersion.split('.')
const npmTarget = `^${major}.${minor}.0`

// ── 2. Check current npm package version ──────────────────────────────────
const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const currentNpm = pkg.dependencies['@tauri-apps/api'] ?? '(not found)'

console.log(`🦀  Tauri Rust crate : ${crateVersion}`)
console.log(`📦  @tauri-apps/api  : ${currentNpm}`)

// ── 3. Sync if needed ─────────────────────────────────────────────────────
const alreadyInSync = currentNpm === npmTarget

if (alreadyInSync) {
  console.log('✅  Already in sync — nothing to do.')
  process.exit(0)
}

console.log(`🔄  Syncing @tauri-apps/api to ${npmTarget} ...`)

try {
  execSync(`npm install @tauri-apps/api@"${npmTarget}" --save`, {
    cwd: root,
    stdio: 'inherit',
  })
  console.log(`✅  Synced @tauri-apps/api → ${npmTarget}`)
} catch (err) {
  console.error('❌ npm install failed:', err.message)
  process.exit(1)
}
