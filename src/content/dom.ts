/**
 * Every YouTube-specific selector lives here. YouTube renames its custom
 * elements and ids without warning, so when the extension stops working this is
 * the only file that should need editing.
 *
 * The stylesheet is generated from these same constants at build time
 * (see `style.ts`), so selectors are never written down twice.
 */

/**
 * Comment hosts. The first two are the current and legacy desktop elements and
 * are the tested path; replies use the same elements. `ytm-comment-renderer` is
 * the mobile site's equivalent and is UNVERIFIED — see the mobile caveat in the
 * README. It is listed because it costs nothing when absent.
 */
export const COMMENT_HOSTS = [
  'ytd-comment-view-model',
  'ytd-comment-renderer',
  'ytm-comment-renderer',
] as const;

/** Wrapper around the author's avatar image inside a comment. */
export const AVATAR_HOST = '#author-thumbnail';

/** Elements that paint the real photo and must be suppressed. */
export const AVATAR_IMAGE = ['img', 'yt-img-shadow', 'yt-avatar-shape'] as const;

/**
 * Candidates for the author link, most specific first. The catch-all
 * `a[href^="/@"]` is deliberately absent: comment bodies contain @mention links
 * that would match it and yield the wrong identity.
 */
export const AUTHOR_LINKS = ['a#author-text', '#author-text a', `${AVATAR_HOST} a`] as const;

/** Element holding the rendered display name. */
export const AUTHOR_NAME = '#author-text';

export const CLASS = {
  /** Set on <html> when the user has switched the extension off. */
  off: 'ycc-off',
  /** Our generated avatar element. */
  avatar: 'ycc-avatar',
} as const;

/** Records which identity an avatar was rendered for, so repeats are skipped. */
export const IDENTITY_ATTR = 'data-ycc-identity';

export const commentSelector = (): string => COMMENT_HOSTS.join(', ');
