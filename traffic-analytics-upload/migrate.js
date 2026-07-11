/**
 * Database Migration Script
 * Run this to apply new composite indexes and settings
 * to an existing analytics.db without losing data.
 *
 * Usage:
 *   node migrate.js
 */

require('dotenv').config();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || './data/analytics.db';
const resolvedPath = path.resolve(dbPath);

if (!fs.existsSync(resolvedPath)) {
  console.log('No database found at', resolvedPath);
  console.log('Nothing to migrate — the schema will be applied fresh on first start.');
  process.exit(0);
}

console.log('Opening database:', resolvedPath);
const db = new Database(resolvedPath);

// ── Apply performance PRAGMAs ──────────────────────────────
console.log('\n[1/3] Applying PRAGMA settings...');
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA cache_size = -32000;
  PRAGMA auto_vacuum = INCREMENTAL;
`);
console.log('  ✓ WAL mode, NORMAL sync, 32MB cache, auto_vacuum enabled');

// ── Add composite indexes (idempotent — IF NOT EXISTS) ─────
console.log('\n[2/3] Adding composite indexes...');

const indexes = [
  ['idx_sessions_website_started',    'sessions(website_id, started_at DESC)'],
  ['idx_sessions_website_status',     'sessions(website_id, status)'],
  ['idx_sessions_website_returning',  'sessions(website_id, is_returning, started_at DESC)'],
  ['idx_page_views_website_viewed',   'page_views(website_id, viewed_at DESC)'],
  ['idx_events_website_occurred',     'events(website_id, occurred_at DESC)'],
  ['idx_perf_website_recorded',       'performance_metrics(website_id, recorded_at DESC)'],
  ['idx_custom_events_website_occurred','custom_events(website_id, occurred_at DESC)'],
];

for (const [name, on] of indexes) {
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS ${name} ON ${on};`);
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.warn(`  ⚠ ${name}: ${e.message}`);
  }
}

// ── Run incremental vacuum ─────────────────────────────────
console.log('\n[3/3] Running incremental vacuum...');
try {
  db.exec('PRAGMA incremental_vacuum(100);');
  console.log('  ✓ Vacuum complete');
} catch (e) {
  console.warn('  ⚠ Vacuum skipped:', e.message);
}

db.close();

const sizeKb = Math.round(fs.statSync(resolvedPath).size / 1024);
console.log(`\n✅ Migration complete. Database size: ${sizeKb} KB`);
