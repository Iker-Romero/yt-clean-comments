/**
 * Every YouTube-specific selector lives here. YouTube renames its custom
 * elements and ids without warning, so when the extension stops working this is
 * the only file that should need editing.
 *
 * The stylesheet is generated from these same constants at build time
 * (see `style.ts`), so selectors are never written down twice.
 *
 * Desktop (`ytd-`/`#kebab-id`) and mobile (`ytm-`/`.PascalClass`) are different
 * DOMs, not variations on one. Every selector below is a list carrying both.
 */

/**
 * Comment hosts. `ytd-comment-view-model` and `ytd-comment-renderer` are the
 * current and legacy desktop elements; `ytm-comment-renderer` is the mobile
 * site's, verified against `m.youtube.com`. Replies use the same elements.
 */
export const COMMENT_HOSTS = [
  'ytd-comment-view-model',
  'ytd-comment-renderer',
  'ytm-comment-renderer',
] as const;

/**
 * Wrapper around the author's avatar inside a comment.
 *
 * Note what lives inside the desktop one: `.threadline`, the connector running
 * from the avatar down to the replies. It is absolutely positioned against an
 * ancestor further up, so giving this element a `position` would reparent its
 * containing block and collapse the line. Nothing may alter its layout — the
 * generated avatar anchors to the image wrapper instead. See `style.ts`.
 *
 * The mobile wrapper is itself the author link, which is why `AUTHOR_LINKS`
 * below looks for both `a<host>` and `<host> a`.
 */
export const AVATAR_HOSTS = ['#author-thumbnail', '.YtmCommentRendererIconContainer'] as const;

/**
 * The element that paints the real photo. Its immediate parent — `yt-img-shadow`
 * on desktop, `ytm-profile-icon` on mobile — is the anchor for the generated
 * avatar: both are sized to the avatar exactly and contain nothing else, so
 * positioning them is inert. Verified on both sites; if a future rename moves
 * the photo under a wrapper holding anything besides the image, the generated
 * avatar has to move with it rather than the wrapper being positioned.
 */
export const AVATAR_IMAGE = 'img';

/** Avatar images, one selector per host. The single source for both consumers. */
export const AVATAR_IMAGES = AVATAR_HOSTS.map((host) => `${host} ${AVATAR_IMAGE}`);

/**
 * Candidates for the author link, most specific first. The catch-all
 * `a[href^="/@"]` is deliberately absent: comment bodies contain @mention links
 * that would match it and yield the wrong identity.
 */
export const AUTHOR_LINKS = [
  'a#author-text',
  '#author-text a',
  ...AVATAR_HOSTS.map((host) => `a${host}`),
  ...AVATAR_HOSTS.map((host) => `${host} a`),
];

/** Elements holding the rendered display name, desktop then mobile. */
export const AUTHOR_NAMES = ['#author-text', '.YtmCommentRendererTitle'] as const;

/**
 * The comments teaser: the top comment, rendered on the watch page before the
 * comment section is ever opened. On mobile it sits in the metadata carousel,
 * so the avatar this extension exists to remove is on screen immediately.
 *
 * It is handled separately from `COMMENT_HOSTS` because it carries no identity
 * at all — no author link, no display name, an empty `aria-label`. There is
 * nothing to derive a letter or a colour from, so the teaser avatar is blanked
 * rather than replaced. See the teaser rule in `style.ts`.
 */
export const TEASER_HOST = 'comments-entry-point-teaser-view-model';

/** The teaser's avatar box, sized to the avatar and painted as the blank disc. */
export const TEASER_AVATAR = '.ytSpecAvatarShapeHost';

export const CLASS = {
  /** Set on <html> when the user has switched the extension off. */
  off: 'ycc-off',
  /** Set on the image wrapper we anchor the generated avatar to. */
  host: 'ycc-host',
  /** Our generated avatar element. */
  avatar: 'ycc-avatar',
} as const;

/** Records which identity an avatar was rendered for, so repeats are skipped. */
export const IDENTITY_ATTR = 'data-ycc-identity';

export const commentSelector = (): string => COMMENT_HOSTS.join(', ');

export const avatarImageSelector = (): string => AVATAR_IMAGES.join(', ');

export const authorNameSelector = (): string => AUTHOR_NAMES.join(', ');
