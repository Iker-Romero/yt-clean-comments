# Clean Comments for YouTube

Replaces **every** YouTube comment profile picture with a neutral letter avatar —
a coloured disc with the first letter of the commenter's name, like a Google
account with no photo set.

## The problem

Accounts posting the top-ranked comment on a video use a sexualised profile
picture as the hook. The comment text itself is innocuous and contains no links;
the account's channel page is where the payload lives, as a wall of "featured
channels" whose shelf titles advertise pornography, each leading to another
channel doing the same. The photo is the only thing doing the recruiting on the
video page, so removing the photo removes the mechanism.

## Why every avatar, and not just the bad ones

Detecting the offending accounts is possible (see *Roadmap*), but a filter that
blurs or badges them is worse than no filter for the person this is built for.
A blurred circle labelled "hidden" tells someone actively avoiding that material
exactly which profile to click, and adds the pull of a covered-up thing. It
turns a filter into an index.

Replacing all avatars unconditionally avoids that entirely, and as a side effect
needs no detection at all: no network requests, no channel lookups, no scoring,
no false positives, and no permissions beyond `storage`.

Two principles follow from this and apply to anything added later:

1. **Never mark the bad ones.** Future detection removes silently or does
   nothing. Any audit trail for false positives lives in the extension's own UI,
   never in the feed.
2. **Suppress before first paint.** The stylesheet is injected declaratively at
   `document_start`, because hiding an image from script leaves a visible frame
   of the image the extension exists to hide.

## Install

```bash
npm install
npm run build
```

This produces `dist/chrome/` and `dist/firefox/`.

- **Chrome / Edge / Brave / Opera / Vivaldi** — `chrome://extensions` → enable
  Developer mode → *Load unpacked* → select `dist/chrome`.
- **Firefox** — `about:debugging#/runtime/this-firefox` → *Load Temporary
  Add-on* → select `dist/firefox/manifest.json`.
- **Firefox for Android** — requires a signed build from addons.mozilla.org;
  temporary add-ons cannot be loaded on Android.

`npm run dev` rebuilds on change; reload the extension to pick up content-script
changes.

## Known gaps

- **The mobile site is untested.** Firefox for Android serves `m.youtube.com`,
  whose comment DOM differs from the desktop one. `ytm-comment-renderer` is
  listed in `src/content/dom.ts` as a best-effort guess and has not been
  verified on a device. If avatars still appear on Android, that file is where
  the fix goes.
- **The image is still downloaded.** Hiding an element does not cancel its
  request, so the photo reaches the browser cache even though it never paints.
  Blocking it outright needs a `declarativeNetRequest` rule against the avatar
  CDN, which cannot distinguish comment avatars from every other avatar on the
  page.
- **Scope is comments only** — watch pages and Shorts. Channel pages, search
  results and the sidebar are untouched.

## Roadmap

Detection of the accounts themselves, used to remove their comments silently
rather than to mark them:

- Fetch the author's channel via the InnerTube `browse` endpoint — not an HTML
  fetch, which hits the EU consent wall when unauthenticated and returns a
  cookie page instead of data.
- Score normalised featured-channel shelf titles, description and channel name
  against a porn lexicon. Normalisation folds the obfuscation these accounts use
  to evade YouTube's own classifier — homoglyphs, digit substitution, inserted
  spaces (`S3XClub`, `T E E N P 0 R N`). Text that matches *only* after
  normalisation is more suspicious than text that matched before it.
- Soft signals: no videos or playlists but featured-channel shelves present; a
  few hundred to a few thousand subscribers with no content; auto-generated
  handle suffixes (`-w4j`); featured channels already on the blocklist, which
  makes the graph collapse quickly once seeded.
- Cache verdicts by channel id permanently. The same channels recur across
  videos, so the hit rate climbs fast and the network cost stays near zero.

## Layout

```
src/lib/        identity-independent logic: palette, hash, avatar spec, settings
src/content/    selectors (dom.ts), generated stylesheet (style.ts), the script
src/popup/      React + Tailwind + shadcn settings popup
src/manifest.ts manifest generated per browser target
scripts/        build orchestration and the icon generator
```

Every YouTube selector lives in `src/content/dom.ts`, and the stylesheet is
generated from those same constants at build time, so no selector is written
twice. When YouTube renames an element, that is the only file to edit.
