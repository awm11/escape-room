import { Aborted } from '../engine/runner.js'
import { SCENES } from './scenes.js'

const KEY = 'tempora.progress'

// Saved progress: the scene a group was on, so a refresh can resume there
// (restarting that scene from its beginning, like the old start-point menu).
export function loadProgress() {
  try {
    const n = Number(localStorage.getItem(KEY))
    return Number.isInteger(n) && n > 0 && n < SCENES.length ? n : null
  } catch {
    return null
  }
}
function saveProgress(i) {
  try { localStorage.setItem(KEY, String(i)) } catch { /* storage unavailable */ }
}
export function clearProgress() {
  try { localStorage.removeItem(KEY) } catch { /* storage unavailable */ }
}

/** run_from_start_point(), 0-indexed. */
export async function play(runner, startIndex = 0) {
  // Jumping in after the engine restart: the heating is already back on.
  if (startIndex > SCENES.findIndex((s) => s.id === 'start_spaceship_engine')) runner.heatingOn()
  try {
    for (let i = startIndex; i < SCENES.length; i++) {
      saveProgress(i)
      await SCENES[i].run(runner)
    }
    clearProgress()
    runner.finish()
  } catch (err) {
    if (!(err instanceof Aborted)) throw err
  }
}
