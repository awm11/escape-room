# Escape room: TEMPORA

A terminal-style escape room, ported from `escape.py` to React + Vite.
Served at **alexmoorephysics.com/escape-room/**.

## Run it

```bash
npm install
npm run dev        # local preview
npm run build      # production build into dist/
```

Pushing to `main` deploys via `.github/workflows/deploy.yml`
(Settings → Pages → Source: **GitHub Actions**). If you prefer your usual
`gh-pages` setup, delete the workflow and deploy `dist/` as normal.
The `base: '/escape-room/'` in `vite.config.js` must match the repo name.

## Teacher guide

`resources/index.html` is a teacher page served at
**alexmoorephysics.com/escape-room/resources/**: kit lists, set-up, the
storyline with answers, troubleshooting, and download links. The downloadable
files live in `public/downloads/`. The page isn't linked from the game and is
set to `noindex`, but it's public and contains the answers.

It's registered as a second page in `vite.config.js`, so `npm run dev` serves it
at `localhost:5173/escape-room/resources/`.

## Running a session

- **Start mission** plays the whole escape room from the beginning.
- **sys admin** (bottom-right of the start screen) is the facilitator menu:
  jump to any of the nine scenes, or clear saved progress.
- Progress is saved per device. If a page is refreshed, the start screen offers
  **Resume from step N**, which restarts that scene from its beginning.
- Pressing Enter while text is typing finishes that message instantly.
  Pauses between messages are unchanged.

## Mission report

Groups can type their crew names on the start screen (optional). After the final
call a report appears: crew, time taken, wrong answers (manual phrase, pendulum
period, engine code) and the coldest the cabin got. The coldest point is shown
rather than the final temperature, because the heating is back on by then.
"Copy report" puts it on the clipboard as plain text, and "Back to start"
reloads the game. Nothing is sent anywhere; the report only exists on that
screen, so groups should screenshot or copy it.

If a group starts from the admin menu or resumes, the timer starts at that
scene and the report says so.

## Cabin temperature

The top-right readout runs on its own clock, not the scenes. It starts at 5°C
(as the Heating menu says) and falls 0.4°C a minute, reaching about -11°C at
the 40 minutes Alpha mentions. It turns amber below 3°C and red at 0°C or
below. Once "Engine startup complete!" appears, the heating comes back on and
it climbs. Starting from a later scene (facilitator menu or Resume) begins
colder. All the numbers are at the top of `src/game/climate.js`.

Frost also gathers at the edges of the screen as the temperature falls (first
specks at 3°C, heavy by -10°C) and melts again once the heating is back.
See `frostLevel()` in `climate.js` and the `.frost` rules in `styles.css`.
The ice crystals are drawn by `scripts/make-frost.mjs` (re-run it with
`node scripts/make-frost.mjs` after changing it) into `src/assets/frost.svg`.

## Where things live

| File | What it is |
| --- | --- |
| `src/game/scenes.js` | The script: the nine scenes, line for line from `escape.py` |
| `src/game/answers.js` | Hashed answers and the matching rules |
| `src/engine/runner.js` | Typing, pauses, input, progress bars |
| `src/components/` | Start screen, facilitator picker, terminal, mission report |
| `src/game/climate.js` | Cabin temperature: start value, cooling rate, per-scene start points |
| `resources/index.html` | Teacher guide page |
| `public/downloads/` | Printed resources, manual, Do Now, letter, how-to |
| `src/styles.css` | Colours and CRT styling (tokens at the top) |

## Answers

Answers are stored as SHA-256 hashes so they don't appear in View Source.
Matching is exact (capitals, punctuation and spelling all count), except that
spaces around the answer are ignored and iPad/phone "smart" quotes count as
normal quotes.

To change an answer:

```bash
npm run hash -- "new answer"
```

and paste the output into `src/game/answers.js`.

## Changes from escape.py

The flow, text, pauses and typing speeds are identical. Deliberate differences:

- Ship menus are picked with ↑/↓ and Enter (or by tapping an option on a
  tablet) instead of typing the item's name. The chosen item is passed to the
  scene exactly as if it had been typed, so "Invalid menu selection" can no
  longer appear.

- Gravity question: a reply counts as "yes" if it **starts** with y/Y
  (the original counted any reply containing a "y", e.g. "not really").
- The `|||||` bars end their own line instead of running into
  "Activating time dilation sensors".
- "Code incorrect, try again." is shown in red.
- After picking an item from a ship menu there is a 2 second pause before the
  menu reprints.
- Two typos in the TEMPORA banner (the "P" and the "O") are fixed.
