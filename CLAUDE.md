# Clean Comments for YouTube

A browser extension that replaces every YouTube comment profile picture with a
neutral letter avatar. Read `README.md` for what it does and why, and
`docs/spam-network.md` for the abuse pattern it exists to defeat.

## Three rules specific to this project

Each of these has been violated once already, or is the obvious thing to do and
wrong. Each looks like an improvement from inside the file you are editing.

### Never give a YouTube element a `position`

`#author-thumbnail` also contains `.threadline`, the connector running from the
avatar down to the replies, which is absolutely positioned against an ancestor
several levels up. Adding `position: relative` to the thumbnail reparented its
containing block and collapsed the line — a change with no visible connection to
the rule that caused it.

The generated avatar anchors to `.ycc-host`, a class we add to the image's own
wrapper, which is sized to the avatar and has no positioned descendants. The
only YouTube element the stylesheet may touch is the avatar image, and only its
opacity, so its box stays in the layout. Anything structural goes on a class we
own. See the note on `AVATAR_HOST` in `src/content/dom.ts`.

### Never mark the accounts this targets

Badging, blurring or collapsing a flagged comment is the obvious design and is
worse than no filter at all here. The user is avoiding this material; a marked
profile tells them precisely which one to click, and adds the pull of a
covered-up thing. It turns a filter into an index.

Detection, when it lands, removes silently or does nothing. Any audit trail for
false positives belongs in the extension's own UI, never in the feed. The
reasoning is in `README.md` under *Why every avatar, and not just the bad ones*.

### Selectors live in `src/content/dom.ts`, and nowhere else

`content.css` is generated from those constants at build time by
`src/content/style.ts`. Editing the built stylesheet appears to work and is
silently discarded by the next build. When YouTube renames an element, `dom.ts`
is the only file that should need changing.

## Working notes

- `npm run build` writes `dist/chrome/` and `dist/firefox/` from one source tree;
  the manifest is generated per target by `src/manifest.ts`.
- Tailwind and shadcn are scoped to the popup. They must never reach the content
  script — Tailwind's preflight would reset YouTube's own styles.
- npm must be run from PowerShell on this machine; postinstall scripts fail to
  find `node` when spawned from the Bash tool.
