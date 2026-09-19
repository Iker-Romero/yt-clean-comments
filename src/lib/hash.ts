/**
 * FNV-1a, 32-bit. Any stable non-cryptographic hash would do; what matters is
 * that the same channel always maps to the same colour, on every page and
 * across sessions, so avatars never flicker or reshuffle on re-render.
 */
export function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
