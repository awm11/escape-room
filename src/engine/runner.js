// The terminal "engine".
//
// Scenes are written as async scripts that read almost exactly like the
// original Python: `await t.write(...)`, `await t.sleep(2)`,
// `const answer = await t.input(' You: ')`. The runner turns those calls
// into an output buffer that React renders, and resolves `input()` when the
// player presses Enter. Keeping it outside React means timings are never
// affected by re-renders (or by StrictMode running effects twice).

export class Aborted extends Error {}

export const DEFAULT_SPEED = 0.05 // seconds per character, as in print_slow()

export class Runner {
  constructor() {
    this.segments = [] // { type: 'text', text, cls } | { type: 'progress', value } | { type: 'banner', lines }
    this.version = 0
    this.awaitingInput = false
    this.finished = false
    this.heating = false
    // Mission report data
    this.crew = ''
    this.startScene = 0
    this.startedAt = Date.now()
    this.endedAt = null
    this.wrong = { phrase: 0, period: 0, code: 0 }
    this.minTemp = null
    this.aborted = false
    this._typing = false
    this._fast = false
    this._resolveInput = null
    this._resolveChoice = null
    this._rejectInput = null
    this.activeMenu = null // the menu currently waiting for ↑/↓/Enter
    this._timers = new Set()
    this._listeners = new Set()
    this._frame = 0
  }

  // ---- React subscription (useSyncExternalStore) ----
  subscribe = (fn) => {
    this._listeners.add(fn)
    return () => this._listeners.delete(fn)
  }
  getVersion = () => this.version

  _emit(now = false) {
    const flush = () => {
      this._frame = 0
      this.version++
      this._listeners.forEach((fn) => fn())
    }
    if (now || typeof requestAnimationFrame === 'undefined') return flush()
    if (!this._frame) this._frame = requestAnimationFrame(flush)
  }

  _append(text, cls = '') {
    if (!text) return
    const last = this.segments[this.segments.length - 1]
    if (last && last.type === 'text' && last.cls === cls) last.text += text
    else this.segments.push({ type: 'text', text, cls })
  }

  _check() {
    if (this.aborted) throw new Aborted()
  }

  _wait(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(() => {
        this._timers.delete(id)
        resolve()
      }, ms)
      this._timers.add(id)
    })
  }

  // ---- The calls scenes use ----

  /** time.sleep(seconds) */
  async sleep(seconds) {
    this._check()
    await this._wait(seconds * 1000)
    this._check()
  }

  /** Reveal `total` characters at `speed` s/char, calling onReveal(from, to) as they appear. */
  async _type(total, speed, onReveal) {
    const msPerChar = speed * 1000
    const start = performance.now()
    let shown = 0
    this._typing = true
    try {
      while (shown < total) {
        // Time-based, so a throttled background tab catches up rather than crawling.
        const due = this._fast
          ? total
          : Math.min(total, Math.floor((performance.now() - start) / msPerChar) + 1)
        if (due > shown) {
          onReveal(shown, due)
          shown = due
          this._emit()
        }
        if (shown < total) await this._wait(Math.max(4, msPerChar))
        this._check()
      }
    } finally {
      this._typing = false
      this._fast = false
    }
  }

  /** print_slow(text, speed) — character by character. */
  async write(text, speed = DEFAULT_SPEED, cls = '') {
    this._check()
    const chars = Array.from(text)
    await this._type(chars.length, speed, (from, to) => this._append(chars.slice(from, to).join(''), cls))
  }

  /**
   * A menu the player picks from with ↑/↓ and Enter (or by tapping an option).
   * Types the options out like print_slow, shows the prompt, and resolves with
   * the chosen option's text — so the scene receives exactly what input() would have.
   */
  async choose(options, prompt = '', promptCls = '', speed = DEFAULT_SPEED) {
    this._check()
    await this.write('\n', speed)
    const menu = { type: 'menu', options, revealed: 0, index: 0, active: false, chosen: -1 }
    this.segments.push(menu)
    await this._type(Array.from(options.join('\n')).length, speed, (_, to) => { menu.revealed = to })
    await this.write('\n\n', speed)
    this._append(prompt, promptCls)
    menu.active = true
    this.activeMenu = menu
    this._emit(true)
    return new Promise((resolve, reject) => {
      this._resolveChoice = resolve
      this._rejectInput = reject
    })
  }

  /** print(text) — instant, with a trailing newline. */
  print(text = '', cls = '') {
    this._check()
    this._append(text + '\n', cls)
    this._emit()
  }

  /** input(prompt) — shows the prompt, waits for Enter, returns exactly what was typed. */
  input(prompt = '', cls = '') {
    this._check()
    this._append(prompt, cls)
    this.awaitingInput = true
    this._emit(true)
    return new Promise((resolve, reject) => {
      this._resolveInput = resolve
      this._rejectInput = reject
    })
  }

  /** progress_bar(duration) — redraws in place, like the \r version. */
  async progressBar(duration) {
    this._check()
    const seg = { type: 'progress', value: 0 }
    this.segments.push(seg)
    this._emit()
    const start = performance.now()
    while (seg.value < 100) {
      await this._wait(Math.max(4, (duration * 1000) / 100))
      this._check()
      seg.value = Math.min(100, Math.floor(((performance.now() - start) / (duration * 1000)) * 100))
      this._emit()
    }
    this._append('\n')
    this._emit()
  }

  /** Several print() lines at once, rendered as a scalable banner. */
  banner(lines, cls = '') {
    this._check()
    this.segments.push({ type: 'banner', lines, cls })
    this._emit()
  }

  // ---- Called by the UI ----

  /** Player pressed Enter. Returns true if it was consumed as an answer. */
  submit(raw) {
    if (!this.awaitingInput) return false
    const resolve = this._resolveInput
    this.awaitingInput = false
    this._resolveInput = this._rejectInput = null
    this._append(raw, 'echo')
    this._append('\n')
    this._emit(true)
    resolve(raw)
    return true
  }

  /** ↑ / ↓ in a menu (wraps around, like most terminal pickers). */
  moveChoice(step) {
    const menu = this.activeMenu
    if (!menu) return
    const n = menu.options.length
    menu.index = (menu.index + step + n) % n
    this._emit(true)
  }

  /** Enter (or a tap) in a menu. */
  pickChoice(index = this.activeMenu?.index) {
    const menu = this.activeMenu
    if (!menu || index == null) return
    const resolve = this._resolveChoice
    menu.index = index
    menu.chosen = index
    menu.active = false
    this.activeMenu = null
    this._resolveChoice = this._rejectInput = null
    this._append(menu.options[index], 'echo')
    this._append('\n')
    this._emit(true)
    resolve(menu.options[index])
  }

  /** Enter pressed while text is still typing: finish the current line instantly. */
  fastForward() {
    if (this._typing) this._fast = true
  }

  /** The engines are back: the cabin heating comes on (read by the temperature readout). */
  heatingOn() {
    this.heating = true
    this._emit(true)
  }

  /** Count a wrong answer for the mission report. kind: 'phrase' | 'period' | 'code' */
  miss(kind) {
    this.wrong[kind] = (this.wrong[kind] ?? 0) + 1
  }

  /** The temperature readout reports in here; the report shows the coldest point. */
  noteTemp(c) {
    if (this.endedAt === null && (this.minTemp === null || c < this.minTemp)) this.minTemp = c
  }

  finish() {
    this.finished = true
    this.endedAt = Date.now()
    this._emit(true)
  }

  abort() {
    this.aborted = true
    this._timers.forEach(clearTimeout)
    this._timers.clear()
    if (this._rejectInput) this._rejectInput(new Aborted())
    this._resolveInput = this._resolveChoice = this._rejectInput = null
    this.awaitingInput = false
    this.activeMenu = null
  }
}
