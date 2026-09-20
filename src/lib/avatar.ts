import { AVATAR_PALETTE } from './palette';
import { fnv1a } from './hash';

export interface AvatarSpec {
  /** Single character to draw. Always uppercase where the script has case. */
  letter: string;
  /** Hex background colour, stable for a given identity. */
  color: string;
}

const FALLBACK_LETTER = '?';

/**
 * First character that carries meaning: a letter or a digit. Emoji, arrows and
 * decorative punctuation are skipped, since a disc showing "👇" is exactly the
 * kind of attention-grabbing marker we are trying to remove.
 */
function firstMeaningfulChar(text: string): string | null {
  for (const char of text.trim()) {
    if (/\p{L}|\p{N}/u.test(char)) return char.toLocaleUpperCase();
  }
  return null;
}

/**
 * @param displayName Rendered author name, e.g. "Alex Rivera".
 * @param identity    Stable channel identity used for colour selection —
 *                    the handle ("@alexrivera-w4j"), never the display
 *                    name, which these accounts change freely.
 */
export function avatarSpecFor(displayName: string, identity: string): AvatarSpec {
  const letter =
    firstMeaningfulChar(displayName) ??
    firstMeaningfulChar(identity.replace(/^@/, '')) ??
    FALLBACK_LETTER;

  const key = identity || displayName;
  const color = AVATAR_PALETTE[fnv1a(key) % AVATAR_PALETTE.length]!;

  return { letter, color };
}
