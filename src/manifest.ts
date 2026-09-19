import pkg from '../package.json';

/**
 * Browsers this extension is packaged for. Chrome's manifest also covers Edge,
 * Brave, Opera and Vivaldi; Firefox's covers Firefox for Android, which is the
 * only mobile browser with extension support and therefore not optional.
 */
export const TARGETS = ['chrome', 'firefox'] as const;
export type Target = (typeof TARGETS)[number];

const NAME = 'Clean Comments for YouTube';
const DESCRIPTION =
  'Replaces every YouTube comment profile picture with a neutral letter avatar.';

/** Add-on id required by addons.mozilla.org; Chrome derives its own. */
const GECKO_ID = 'clean-comments@ikerromero.dev';

export function buildManifest(target: Target): Record<string, unknown> {
  const manifest: Record<string, unknown> = {
    manifest_version: 3,
    name: NAME,
    version: pkg.version,
    description: DESCRIPTION,
    // `storage` is the only permission. No host permissions are needed: a
    // content script declared with `matches` is granted its own access, and
    // nothing here talks to the network.
    permissions: ['storage'],
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
    action: {
      default_popup: 'popup/index.html',
      default_title: NAME,
    },
    content_scripts: [
      {
        matches: ['*://*.youtube.com/*'],
        js: ['content.js'],
        css: ['content.css'],
        // The stylesheet must land before the first paint, otherwise the photo
        // this extension exists to hide is briefly visible.
        run_at: 'document_start',
        all_frames: false,
      },
    ],
  };

  if (target === 'firefox') {
    manifest['browser_specific_settings'] = {
      gecko: { id: GECKO_ID, strict_min_version: '128.0' },
      gecko_android: { strict_min_version: '128.0' },
    };
  }

  return manifest;
}
