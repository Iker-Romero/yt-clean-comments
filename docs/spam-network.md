# The comment spam network

Field notes, observed 2026-09-19. This is an observational record, not a plan —
it is the raw input to the detection lexicon described in the README's *Roadmap*,
and re-deriving it means clicking through the graph again.

## What this file does and does not reproduce

**Shelf titles and other matched text are reproduced verbatim, including their
obfuscation, because the obfuscation is the signal** and this is the file the
normaliser and lexicon are written against. It is the one place in the repo
those strings belong; the README deliberately carries none of them.

**Account handles, channel names and the source video are withheld.** They add
nothing to the detection rules — the rules match on shape, not on identity —
and writing them down turns a description of the material into directions to
it. Someone reading these notes to work on the filter should not be one search
away from the thing the filter exists to remove. Where an account has to be
referred to, it is lettered.

## The pattern

1. An account posts a comment on a high-traffic video or Short. The comment is
   innocuous, on-topic, contains no link, and ranks first.
2. Its profile picture is a conventionally attractive young woman — sometimes a
   real photograph, sometimes generated. This is the only recruiting mechanism
   present on the video page.
3. That profile has no external link and no videos. The payload is the
   **featured channels** section: shelves whose *titles* advertise pornography,
   each shelf holding one channel.
4. Those featured channels carry the explicit imagery as their avatars, and
   repeat the structure with more shelves and more channels.
5. Each featured channel has an **external link in its bio** — to a porn site,
   or to a redirector that resolves somewhere different on every click and lands
   on scams. This is the terminus and the reason the rest exists.

Featured channels do not have to be your own, so the top-level account never
hosts anything that violates policy. It is a pointer, and pointers are cheap to
replace.

### The exposure happens on the first click, not the second

A featured-channels shelf renders each channel's **avatar** alongside its name,
and the featured channels use explicit images as their avatars. So opening the
commenter's profile — one click from the video — already presents a grid of
pornographic thumbnails. Nothing needs to be clicked through to.

This is the correction that matters most for anything built against these notes.
The obvious reading is that the commenter's channel is a harmless signpost and
the material is a further hop away; it is not. The commenter's channel page is
itself a contact-sheet of the material, assembled out of other accounts' avatars
so that the page hosts nothing of its own.

## Worked example

On a Short from a major US political-commentary channel (~660k views, three days
old at time of observation), the first-ranked comment — 1.6K likes, 37 replies —
was a generic on-topic remark about AI systems being misused. Nothing in it is
actionable: no link, no solicitation, nothing that reads as spam in isolation.

The commenter, **account A** (432 subscribers), has no links and no content, and
four featured-channel shelves:

| Shelf title | Channel | Subscribers |
| --- | --- | --- |
| `👇🏻Join Legit S3XClub👇🏻` | B | 494 |
| `👇🏻New Collection T E E N P 0 R N👇🏻` | C | 1.53K |
| `👇🏾AFRO SEXCLUB👇🏾` | D | 492 |

One channel per category. Following the first, **channel B** (494 subscribers),
the structure repeats at greater width — twelve channels across shelves titled
`👇🏻Join Legit S3XClub👇🏻`, `👇🏾AFRO SEXCLUB👇🏾`,
`👇🏻Please Lesbian Only🚨👇🏻`, `👇🏻Please GAY Only🚨👇🏻`, `🔥yoursexymommy🔥`,
`👇🏻Adorable Schoolgirl👇🏻`, `👇🏻New Collection T E E N P 0 R N👇🏻`.

## What generalises

- **The shelf title is the payload and cannot be hidden.** It has to be
  human-readable to work, which means it is machine-readable too. It is the one
  hard signal in the whole chain.
- **One channel per category at the first hop, many at the second.** The graph is
  dense and highly interlinked, so a blocklist seeded with a handful of channels
  should propagate quickly through featured-channel edges.
- **Subscriber counts cluster in the low hundreds to low thousands** — 316 to
  1.53K across every channel observed. Consistent with churn: accounts are
  burned and replaced, and the counts rebuild fast.
- **Display names are a pair of given names, each common in a different
  language** — a Slavic first name beside a Greek second, a Scandinavian one
  beside a Romance one. No surnames. Every name observed fits this shape, which
  is what a naive draw from several national name lists produces. The observed
  set is not reproduced here; the shape is the signal, not the instances.
- **Handles carry YouTube's auto-generated disambiguation suffix** — a hyphen
  and three random characters, appended when a requested handle is already
  taken. Its presence indicates the handle was accepted as offered at signup
  rather than chosen.
- **No videos and no playlists at either level**, and no external link on the
  top-level account. The website link appears on the featured channels, one hop
  down — the top-level account carries nothing actionable at all.
- **The avatar is the medium at every level.** Bait photo on the comment,
  explicit photos on the featured channels, and those same explicit photos
  rendered on the commenter's own page by the featured-channels shelves.
- **The outbound link rotates, so the destination is not a usable signal.** Bio
  links resolving to a different scam on each click cannot be blocklisted by URL
  and cannot be checked without following them. Detection has to work on what
  YouTube itself renders — shelf titles, channel metadata, the graph — not on
  where the chain terminates.
- **The structure is layered so no single account is actionable.** The commenter
  hosts nothing, the shelves are other people's channels, and the link sits one
  hop further down on an account that never touched the original video.

## Obfuscation inventory

Every form below appears in the strings above. These are evasions of YouTube's
own classifier, so text that matches the lexicon *only after* normalisation is
more suspicious than text that matched before it — the obfuscation is evidence,
not merely an obstacle.

| Technique | Seen as |
| --- | --- |
| Digit for letter | `S3XClub`, `P 0 R N` |
| Inserted spacing | `T E E N P 0 R N` |
| Emoji framing | `👇🏻…👇🏻`, `👇🏾…👇🏾`, `🔥…🔥`, `🚨` |
| Case mixing | `SEXCLUB`, `S3XClub`, `yoursexymommy` |
| Concatenation | `yoursexymommy`, `AFROSEXCLUB` |

A normaliser that folds all of these — strip diacritics, map homoglyphs and
digit substitutions, delete spacing, punctuation and emoji, lowercase — reduces
every title above to a short list of stems: `sexclub`, `teenporn`, `lesbian`,
`gay`, `schoolgirl`, `mommy`.

## What YouTube appears not to do

The second-level channels host explicit imagery openly and were not removed. The
top-level account hosts nothing and so has nothing to action. Where channels are
removed, the subscriber counts suggest replacements re-accumulate quickly. None
of this is a claim about enforcement intent — only that the pattern was live and
first-ranked on a major channel's Short on the date above.
