// Cabin temperature shown in the terminal header.
// It runs on its own clock, not the scenes: it starts at the 5°C the Heating
// menu reports and keeps falling for as long as the game is open.

export const START_C = 5 // matches "Temperature in living quarters: 5°C"
export const COOL_PER_MIN = 0.4 // about -11°C after the "40 minutes" Alpha mentions
export const MIN_C = -12

// Once the engines restart, the heating comes back on.
export const WARM_PER_MIN = 20 // about 1°C every 3 seconds
export const MAX_C = 19

// Roughly how far into a typical session each scene starts (minutes).
// Starting from a scene with the facilitator menu, or resuming, begins this much colder.
const SCENE_START_MIN = [0, 2, 5, 12, 15, 26, 28, 30, 36]

export function startingTemperature(sceneIndex = 0) {
  const minutes = SCENE_START_MIN[sceneIndex] ?? 0
  return Math.max(MIN_C, START_C - COOL_PER_MIN * minutes)
}

/** Temperature `minutes` after a reading of `fromC`, cooling or (once heating is on) warming. */
export function temperatureAfter(fromC, minutes, heating) {
  return heating
    ? Math.min(MAX_C, fromC + WARM_PER_MIN * minutes)
    : Math.max(MIN_C, fromC - COOL_PER_MIN * minutes)
}

export function formatC(c) {
  const s = c.toFixed(1)
  return (s === '-0.0' ? '0.0' : s) + '°C'
}

// Frost on the screen: first specks at FROST_FROM_C, full coverage at FROST_FULL_C.
export const FROST_FROM_C = 3
export const FROST_FULL_C = -10

/** 0 (clear) to 1 (heavily frosted). Melts again as the cabin warms. */
export function frostLevel(c) {
  return Math.min(1, Math.max(0, (FROST_FROM_C - c) / (FROST_FROM_C - FROST_FULL_C)))
}
