# The comment spam network

Field notes, observed 2026-09-19. This is an observational record, not a plan —
it is the raw input to the detection lexicon described in the README's *Roadmap*,
and re-deriving it means clicking through the graph again. Verbatim strings are
reproduced exactly, including their obfuscation, because the obfuscation is the
signal.

## The pattern

1. An account posts a comment on a high-traffic video or Short. The comment is
   innocuous, on-topic, contains no link, and ranks first.
2. Its profile picture is a conventionally attractive young woman — sometimes a
   real photograph, sometimes generated. This is the only recruiting mechanism
   present on the video page.
3. The profile has no external link and no videos. The payload is the
   **featured channels** section: shelves whose *titles* advertise pornography,
   each shelf holding one channel.
4. Those channels carry the actual explicit imagery, and repeat the structure
   with more shelves and more channels.

Featured channels do not have to be your own, so the top-level account never
hosts anything that violates policy. It is a pointer, and pointers are cheap to
replace.

## Worked example

On a Tucker Carlson Short (`OpenAI Almost Brought Down the Internet…`, ~660k
views, three days old at time of observation), the first-ranked comment:

> **@minalhia** — 1.6K likes, 37 replies
> "It appears that AI 'breaking free' is a really good cover for humans using AI
> inappropriately and hacking databases"

Nothing in the comment is actionable. The channel `@minalhia` (432 subscribers)
has no links and no content, and four featured-channel shelves:

| Shelf title | Channel | Subscribers |
| --- | --- | --- |
| `👇🏻Join Legit S3XClub👇🏻` | Katsiaryna Isa | 494 |
| `👇🏻New Collection T E E N P 0 R N👇🏻` | Lotti Celestine | 1.53K |
| `👇🏾AFRO SEXCLUB👇🏾` | Natasha Raelyn | 492 |

One channel per category. Following the first, `Katsiaryna Isa`
(`@KatsiarynaIsa-w4j`, 494 subscribers), the structure repeats at greater width
— twelve channels across shelves titled `👇🏻Join Legit S3XClub👇🏻`,
`👇🏾AFRO SEXCLUB👇🏾`, `👇🏻Please Lesbian Only🚨👇🏻`,
`👇🏻Please GAY Only🚨👇🏻`, `🔥yoursexymommy🔥`, `👇🏻Adorable Schoolgirl👇🏻`,
`👇🏻New Collection T E E N P 0 R N👇🏻` — carrying names such as Linda
Concepción, Moon Clara, Hanga Ermioni, Isa Kája, Irinushka Chela, Ulrikke
Viviana, Rike India, Cindy Milly, Bailey Fieke, Amanda Celia, Alberta Tara,
Zdislava Truus.

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
- **Display names are two given names, often from different languages**
  (Katsiaryna Isa, Hanga Ermioni, Zdislava Truus, Ulrikke Viviana). Plausibly
  generated from name lists.
- **Handles carry YouTube's auto-generated disambiguation suffix**
  (`@KatsiarynaIsa-w4j`), indicating the handle was accepted as offered at
  signup rather than chosen.
- **No videos, no playlists, no external links** at either level. The account
  exists only to point.

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
