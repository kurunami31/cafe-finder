const KEY = "cf-favorites";

const listeners = new Set<() => void>();
let snapshot: string[] = [];
let initialized = false;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function handleChanged() {
  snapshot = read();
  listeners.forEach((l) => l());
}

export function subscribeFavorites(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("cf-favorites-changed", handleChanged);
  window.addEventListener("storage", handleChanged);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("cf-favorites-changed", handleChanged);
    window.removeEventListener("storage", handleChanged);
  };
}

export function getFavoritesSnapshot(): string[] {
  if (!initialized) {
    snapshot = read();
    initialized = true;
  }
  return snapshot;
}

export function getServerFavoritesSnapshot(): string[] {
  return [];
}

export function isFavorite(id: string): boolean {
  return getFavoritesSnapshot().includes(id);
}

export function toggleFavorite(id: string): void {
  const list = read();
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  else list.push(id);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  handleChanged();
}
