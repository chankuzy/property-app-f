/** Deterministic placeholder headshots so every run of the app looks the same. */
export function avatarUrl(seed: string, size = 64): string {
  return `https://i.pravatar.cc/${size}?u=${encodeURIComponent(seed)}`
}
