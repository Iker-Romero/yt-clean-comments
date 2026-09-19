import { avatarSpecFor } from '../lib/avatar';
import { loadSettings, onSettingsChanged, type Settings } from '../lib/settings';
import { createAvatarElement, paintAvatarElement } from './avatar-element';
import {
  AUTHOR_LINKS,
  AUTHOR_NAME,
  AVATAR_HOST,
  CLASS,
  IDENTITY_ATTR,
  commentSelector,
} from './dom';

const RESCAN_DELAY_MS = 100;

let rescanTimer: number | null = null;

/** Channel handle or id, the one thing these accounts cannot change freely. */
function identityOf(comment: Element): string {
  for (const selector of AUTHOR_LINKS) {
    const anchor = comment.querySelector<HTMLAnchorElement>(selector);
    const path = anchor?.getAttribute('href');
    if (path) return path.split('?')[0] ?? path;
  }
  return '';
}

function displayNameOf(comment: Element): string {
  return comment.querySelector(AUTHOR_NAME)?.textContent?.trim() ?? '';
}

function replaceAvatar(comment: Element): void {
  const host = comment.querySelector(AVATAR_HOST);
  if (!host) return;

  const identity = identityOf(comment);
  const displayName = displayNameOf(comment);
  // Polymer mounts the shell before the author data arrives. Rendering now
  // would produce a "?" that never gets corrected, so wait for the next pass.
  if (!identity && !displayName) return;

  const key = identity || displayName;
  const existing = host.querySelector<SVGSVGElement>(`.${CLASS.avatar}`);
  if (existing?.getAttribute(IDENTITY_ATTR) === key) return;

  const svg = existing ?? createAvatarElement();
  paintAvatarElement(svg, avatarSpecFor(displayName, identity), key);
  if (!existing) host.append(svg);
}

function scan(root: ParentNode = document): void {
  for (const comment of root.querySelectorAll(commentSelector())) {
    replaceAvatar(comment);
  }
}

function scheduleScan(): void {
  if (rescanTimer !== null) return;
  rescanTimer = window.setTimeout(() => {
    rescanTimer = null;
    scan();
  }, RESCAN_DELAY_MS);
}

/**
 * YouTube mutates the DOM continuously during playback. Scanning on every
 * record would burn CPU for the whole video, so records are filtered down to
 * the ones that can plausibly affect a comment avatar.
 */
function touchesComments(records: MutationRecord[]): boolean {
  const selector = commentSelector();
  for (const record of records) {
    if (record.type === 'attributes') {
      const target = record.target as Element;
      if (target.closest?.(selector)) return true;
      continue;
    }
    for (const node of record.addedNodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches(selector) || node.querySelector(selector)) return true;
      if (node.closest(selector)) return true;
    }
  }
  return false;
}

function observe(): void {
  const observer = new MutationObserver((records) => {
    if (touchesComments(records)) scheduleScan();
  });

  const options: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'src'],
  };

  // Comment containers arrive late and are swapped out on SPA navigation;
  // observing the document root covers both without ever re-attaching.
  observer.observe(document.documentElement, options);
}

function applySettings(settings: Settings): void {
  document.documentElement.classList.toggle(CLASS.off, !settings.enabled);
  if (settings.enabled) scheduleScan();
}

async function start(): Promise<void> {
  applySettings(await loadSettings());
  onSettingsChanged(applySettings);

  observe();
  scan();

  // SPA navigation replaces the whole comment section without a page load.
  document.addEventListener('yt-navigate-finish', scheduleScan);
}

void start();
