import NodeCache from 'node-cache';

const cache = new NodeCache({ useClones: false });

export function get<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function set<T>(key: string, value: T, ttlSeconds: number): void {
  cache.set(key, value, ttlSeconds);
}

export function del(key: string): void {
  cache.del(key);
}

export function flush(): void {
  cache.flushAll();
}

export function stats() {
  return cache.getStats();
}
