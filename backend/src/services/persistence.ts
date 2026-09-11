import fs from 'fs';
import path from 'path';

/**
 * Minimal JSON-file persistence for single-user state (paper broker, bot).
 * Writes are debounced per file so bursts of mutations don't hammer disk.
 */

const PERSIST_DIR = process.env.PERSIST_DIR || './data';
const DEBOUNCE_MS = 2000;

const pendingWrites = new Map<string, NodeJS.Timeout>();

function ensureDir() {
  if (!fs.existsSync(PERSIST_DIR)) fs.mkdirSync(PERSIST_DIR, { recursive: true });
}

export function loadJSON<T>(name: string, fallback: T): T {
  try {
    const file = path.join(PERSIST_DIR, name);
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
  } catch (err) {
    console.error(`[Persistence] Failed to load ${name}:`, (err as Error).message);
    return fallback;
  }
}

export function saveJSON<T>(name: string, data: T) {
  const existing = pendingWrites.get(name);
  if (existing) clearTimeout(existing);

  const timer = setTimeout(() => {
    pendingWrites.delete(name);
    try {
      ensureDir();
      fs.writeFileSync(path.join(PERSIST_DIR, name), JSON.stringify(data));
    } catch (err) {
      console.error(`[Persistence] Failed to save ${name}:`, (err as Error).message);
    }
  }, DEBOUNCE_MS);

  pendingWrites.set(name, timer);
}
