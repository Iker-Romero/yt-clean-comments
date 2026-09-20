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
 *
 * The only YouTube element this is allowed to restyle is the avatar image
 * itself, and only its opacity, so its box is left in the layout untouched.
 * Anything structural goes on `.ycc-host`, a class we add ourselves to the
 * image's immediate wrapper: YouTube's comment DOM positions descendants
 * against ancestors several levels up, so introducing a containing block
 * anywhere else silently breaks unrelated parts of the thread.
 */
export function buildContentCss(): string {
  return `/* Generated from src/content/dom.ts — do not edit by hand. */

${scoped([`${AVATAR_HOST} ${AVATAR_IMAGE}`])} {
  opacity: 0 !important;
}

html:not(.${CLASS.off}) .${CLASS.host} {
  position: relative;
}

html:not(.${CLASS.off}) .${CLASS.avatar} {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  user-select: none;
}

html.${CLASS.off} .${CLASS.avatar} {
  display: none;
}
`;
}
