# Clean Comments for YouTube

Replaces **every** YouTube comment profile picture with a neutral letter avatar —
a coloured disc with the first letter of the commenter's name, like a Google
account with no photo set.

## The problem

Accounts posting the top-ranked comment on a video use a sexualised profile
picture as the hook. The comment text itself is innocuous and contains no links;
the account's channel page is where the payload lives, as a wall of "featured
channels" whose shelf titles advertise pornography and whose avatars are the
pornography — a shelf renders each channel's picture, so the commenter's profile
is already a contact-sheet of the material one click from the video, assembled
out of other accounts so the page hosts nothing of its own. Each of those
featured channels then carries an external link in its bio, either to a porn
site or to a rotating redirector that lands somewhere different on every click,
which is where the scams live. That link is the point of the whole structure;
everything above it exists to deliver someone to it.

The photo is the only thing doing the recruiting on the video page, so removing
the photo removes the mechanism there. See
[`docs/spam-network.md`](docs/spam-network.md) for the observed structure.

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

Not yet published to the extension stores — see *Roadmap*. For now it is a local
build:

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

- **The mobile teaser has no name to show.** `m.youtube.com` renders the top
  comment as a teaser in the metadata carousel, on screen before the comment
  section is ever opened — so the avatar this extension exists to remove is the
  first thing you see. That teaser carries no author link, no display name and
  an empty `aria-label`, so there is nothing to derive a letter or a colour
  from. Its avatar is blanked to a neutral disc rather than replaced. Inside the
  comment section proper the mobile DOM does carry both, and those avatars get
  the same letter treatment as desktop.
- **The mobile selectors are read from the real DOM but have not been run.**
  `src/content/dom.ts` now carries the mobile comment host, avatar wrapper,
  author link and name, taken off `m.youtube.com` rather than guessed. What is
  still unconfirmed is whether `ytm-profile-icon` — the element the generated
  avatar anchors to — is a sized block or an inline wrapper. If the letters come
  out misplaced on mobile that is the reason, and `.ycc-host` in
  `src/content/style.ts` is where it gets fixed.
- **The image is still downloaded.** Hiding an element does not cancel its
  request, so the photo reaches the browser cache even though it never paints.
  Blocking it outright needs a `declarativeNetRequest` rule against the avatar
  CDN, which cannot distinguish comment avatars from every other avatar on the
  page.
- **Scope is comments only** — watch pages and Shorts. Channel pages are where
  the explicit images actually render, as the avatars of the featured channels,
  and extending the replacement to them was **considered and deliberately
  rejected**. Those channels are reachable only by clicking a comment whose hook
  has already been removed, so the path is not one anyone walks by accident;
  covering it would mean blanking every legitimate creator's avatar and every
  legitimate featured-channel shelf, permanently, against a risk that v1 has
  already closed upstream. If this is ever revisited, the version worth building
  is avatar replacement on a channel page *conditional on the channel being
  flagged*, which needs the detection layer below and is not worth doing without
  it.

## Roadmap

### Before the extension stores

The extension itself works. What is missing is everything the stores require
around it; only the last two items are code.

- **Listing assets.** Screenshots and tile images for both stores. The obvious
  before/after screenshot would put a bait avatar in the listing itself, which
  is against Chrome Web Store policy on sexually suggestive listing images — the
  "before" shot has to be an ordinary comment thread with ordinary photos. The
  point still reads: photographs become letters.
- **Listing copy.** Written plainly, in terms of what the extension does to the
  page: one permission, no network access, nothing collected. The abuse pattern
  is this repository's story to tell, not the store listing's.
- **Chrome Web Store account.** One-time $5 registration. New accounts start
  with a two-extension publication limit, which is not a constraint here.
- **Privacy disclosure.** Chrome requires the data-use certification even when
  the answer is "none", and here it is none: `storage` holds one boolean and
  nothing leaves the browser.
- **AMO submission.** Free, and signing is automated for an add-on this small.
  Worth doing first — it returns a working install link in minutes, which leaves
  the Chrome review as the only thing blocking a release.
- **Packaging.** `scripts/build.mjs` writes `dist/<target>/` but does not zip
  it, and both stores upload a zip.
- **Run the mobile build before claiming Android.** `gecko_android` in
  `src/manifest.ts` promises Firefox for Android. The mobile selectors are no
  longer a guess, but they have not been exercised. They can be checked without
  a device — desktop Chrome, device emulation, `m.youtube.com` — since YouTube
  picks the mobile DOM on user agent rather than on engine. Confirm both the
  teaser disc and the letters inside the comment section. That leaves only
  GeckoView's `document_start` timing untested, which does need a device.

### Detection

Detection of the accounts themselves, used to remove their comments silently
rather than to mark them. [`docs/spam-network.md`](docs/spam-network.md) records
the observed structure these rules are derived from, including the verbatim
shelf titles that seed the lexicon.

- Fetch the author's channel via the InnerTube `browse` endpoint — not an HTML
  fetch, which hits the EU consent wall when unauthenticated and returns a
  cookie page instead of data.
- Score normalised featured-channel shelf titles, description and channel name
  against a porn lexicon. Normalisation folds the obfuscation these accounts use
  to evade YouTube's own classifier — homoglyphs, digit substitution, inserted
  spacing, emoji framing. Text that matches *only* after normalisation is more
  suspicious than text that matched before it. The observed strings live in
  `docs/spam-network.md` and nowhere else: this file is the first thing anyone
  opening the repository reads, and it is not the place to reproduce them.
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

## License

MIT — see [LICENSE](LICENSE).
