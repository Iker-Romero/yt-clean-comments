/**
 * Minimal cross-browser WebExtension access.
 *
 * Firefox exposes the promise-based `browser` namespace; Chrome and Edge expose
 * `chrome`, whose MV3 storage API is promise-based too. The only APIs this
 * extension touches are promise-compatible in both, so a namespace alias is
 * enough and webextension-polyfill would be dead weight.
 */
const api = (globalThis as { browser?: typeof chrome }).browser ?? chrome;

export const ext = api;
