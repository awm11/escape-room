import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import CabinTemp from './CabinTemp.jsx'
import MissionReport from './MissionReport.jsx'
import { frostLevel } from '../game/climate.js'

export default function Terminal({ runner, startScene = 0 }) {
  useSyncExternalStore(runner.subscribe, runner.getVersion)
  const awaiting = runner.awaitingInput

  const [value, setValue] = useState('')
  const [caret, setCaret] = useState(0)
  const [frost, setFrost] = useState(0)
  const onTemp = useCallback((c) => { setFrost(frostLevel(c)); runner.noteTemp(c) }, [runner])
  const inputRef = useRef(null)
  const screenRef = useRef(null)

  // Keep the newest line in view.
  useLayoutEffect(() => {
    const el = screenRef.current
    if (el) el.scrollTop = el.scrollHeight
  })

  const choosing = !!runner.activeMenu

  // Put the keyboard focus back whenever the game asks a question.
  useEffect(() => {
    if (awaiting || choosing) inputRef.current?.focus({ preventScroll: true })
  }, [awaiting, choosing])

  function syncCaret(e) {
    setCaret(e.target.selectionStart ?? e.target.value.length)
  }

  function onKeyDown(e) {
    if (runner.activeMenu) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        runner.moveChoice(e.key === 'ArrowUp' ? -1 : 1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        runner.pickChoice()
      }
      return
    }
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (runner.awaitingInput) {
      runner.submit(value)
      setValue('')
      setCaret(0)
    } else {
      runner.fastForward()
    }
  }

  const before = value.slice(0, caret)
  const at = value.slice(caret, caret + 1)
  const after = value.slice(caret + 1)

  return (
    <main className="bezel">
      <section
        className="screen terminal power-on"
        style={{ '--frost': frost.toFixed(2) }}
        onMouseUp={() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true })
        }}
      >
        <div className="frost" aria-hidden="true" />
        <header className="term-bar">
          <span className="term-left">
            <span className="term-ship">TEMPORA</span>
            <span className="term-status">
              <span className={runner.finished ? 'dot dot-ok' : 'dot'} aria-hidden="true" />
              {runner.finished ? 'Engines online' : 'Onboard terminal'}
            </span>
          </span>
          <CabinTemp
            startScene={startScene}
            heating={runner.heating}
            onTemp={onTemp}
          />
        </header>

        <div className="term-scroll" ref={screenRef}>
          <pre className="term-out">
            {runner.segments.map((seg, i) => (
              <Segment key={i} seg={seg} onPick={(n) => runner.pickChoice(n)} />
            ))}
            {choosing ? (
              <span className="menu-hint">  ↑ ↓ to move, Enter to select</span>
            ) : awaiting ? (
              <span className="echo">
                {before}
                <span className="cursor">{at || ' '}</span>
                {after}
              </span>
            ) : (
              !runner.finished && <span className="cursor cursor-idle"> </span>
            )}
          </pre>
          {runner.finished && <MissionReport runner={runner} />}
        </div>

        <input
          ref={inputRef}
          className="term-input"
          value={value}
          onChange={(e) => {
            if (!runner.awaitingInput) return
            setValue(e.target.value)
            syncCaret(e)
          }}
          onKeyDown={onKeyDown}
          onKeyUp={syncCaret}
          onSelect={syncCaret}
          onClick={syncCaret}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="send"
          aria-label="Type your reply and press Enter"
        />
      </section>
    </main>
  )
}

function Segment({ seg, onPick }) {
  if (seg.type === 'menu') {
    const full = seg.options.join('\n')
    // Still typing out: show it exactly as print_slow would.
    if (seg.revealed < Array.from(full).length) {
      return <span>{Array.from(full).slice(0, seg.revealed).join('')}</span>
    }
    return seg.options.map((opt, i) => {
      const state = seg.active
        ? i === seg.index ? 'menu-opt is-current' : 'menu-opt'
        : i === seg.chosen ? 'menu-opt is-chosen' : 'menu-opt is-past'
      return (
        <span key={opt}>
          <span
            className={state}
            onClick={seg.active ? (e) => { e.stopPropagation(); onPick(i) } : undefined}
          >
            {opt}
          </span>
          {i < seg.options.length - 1 ? '\n' : ''}
        </span>
      )
    })
  }
  if (seg.type === 'progress') {
    const filled = Math.floor((seg.value / 100) * 50)
    return (
      <span className="progress">
        [<span className="progress-fill">{'#'.repeat(filled)}</span>
        <span className="progress-empty">{'-'.repeat(50 - filled)}</span>] {seg.value}%
      </span>
    )
  }
  if (seg.type === 'banner') {
    return (
      <span className={`banner ${seg.cls}`} role="img" aria-label="TEMPORA">
        {seg.lines.join('\n') + '\n'}
      </span>
    )
  }
  return <span className={seg.cls || undefined}>{seg.text}</span>
}
