import { AVATAR_HOST, AVATAR_IMAGE, CLASS, COMMENT_HOSTS } from './dom';

/** Scopes each suffix under every comment host, skipping the disabled state. */
function scoped(suffixes: readonly string[]): string {
  return COMMENT_HOSTS.flatMap((host) =>
    suffixes.map((suffix) => `html:not(.${CLASS.off}) ${host} ${suffix}`),
  ).join(',\n');
}

/**
 * Generates the content stylesheet. Injected declaratively at `document_start`
 * so the real photo is suppressed before it can ever paint — doing this from
 * script would leave a visible frame of the image the extension exists to hide.
 */
export function buildContentCss(): string {
  return `/* Generated from src/content/dom.ts — do not edit by hand. */

${scoped([AVATAR_HOST])} {
  position: relative;
}

${scoped(AVATAR_IMAGE.map((el) => `${AVATAR_HOST} ${el}`))} {
  opacity: 0 !important;
}

.${CLASS.avatar} {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  pointer-events: none;
  user-select: none;
  overflow: hidden;
}

html.${CLASS.off} .${CLASS.avatar} {
  display: none;
}
`;
}
