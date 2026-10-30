import { useEffect, useRef, useState } from 'react'
import { SCENES } from '../game/scenes.js'

export default function LoadScreen({ saved, onStart, onResume, onSelectScene, onClearSaved }) {
  const [picking, setPicking] = useState(false)
  const [crew, setCrew] = useState('')
  const startRef = useRef(null)

  useEffect(() => { startRef.current?.focus() }, [])

  return (
    <main className="bezel">
      <section className="screen load">
        <div className="load-inner">
          <h1 className="wordmark" aria-label="Tempora">TEMPORA</h1>
          <p className="load-sub">Onboard terminal. Crew access only.</p>

          <label className="crew">
            <span className="crew-label">Crew names (optional)</span>
            <input
              className="crew-input"
              value={crew}
              onChange={(e) => setCrew(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onStart(crew)}
              maxLength={80}
              placeholder="Asha, Ben, Chloe"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </label>

          <div className="load-actions">
            <button ref={startRef} className="btn-primary" onClick={() => onStart(crew)}>
              <span className="btn-caret" aria-hidden="true">&gt;</span> Start mission
            </button>
            {saved != null && (
              <button className="btn-quiet" onClick={() => onResume(crew)}>
                Resume from step {saved + 1}
              </button>
            )}
          </div>
        </div>

        <button
          className="sys-link"
          onClick={() => setPicking(true)}
          aria-label="Facilitator: choose a starting scene"
          title="Facilitator"
        >
          sys admin
        </button>

        {picking && (
          <ScenePicker
            saved={saved}
            crew={crew}
            onPick={(i) => { setPicking(false); onSelectScene(i, crew) }}
            onClose={() => setPicking(false)}
            onClearSaved={onClearSaved}
          />
        )}
      </section>
    </main>
  )
}

function ScenePicker({ saved, crew, onPick, onClose, onClearSaved }) {
  // Nothing starts until "Start" is pressed, so a stray click can't launch a scene.
  const [choice, setChoice] = useState(saved ?? null)
  const listRef = useRef(null)

  useEffect(() => {
    // Focus the saved scene if there is one (and scroll to it), otherwise the first.
    const list = listRef.current
    const el = list?.querySelector('input:checked') ?? list?.querySelector('input')
    el?.focus({ preventScroll: true })
    el?.closest('label')?.scrollIntoView({ block: 'nearest' })
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit(e) {
    e.preventDefault()
    if (choice !== null) onPick(choice)
  }

  return (
    <div className="picker-backdrop" onClick={onClose}>
      <form
        className="picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <header className="picker-head">
          <div>
            <h2 id="picker-title">Sys admin</h2>
            <p>Start a group part-way through the mission, for example after a refresh or to skip ahead.</p>
          </div>
          <a
            className="picker-guide"
            href={`${import.meta.env.BASE_URL}resources/`}
            target="_blank"
            rel="noopener"
          >
            Teacher guide
          </a>
        </header>

        <div className="picker-set" role="radiogroup" aria-labelledby="picker-legend">
          <div className="picker-legend" id="picker-legend">Choose where to start</div>
          <ol className="picker-list" ref={listRef}>
            {SCENES.map((s, i) => (
              <li key={s.id}>
                <label className={choice === i ? 'is-picked' : undefined}>
                  <input
                    type="radio"
                    name="scene"
                    checked={choice === i}
                    onChange={() => setChoice(i)}
                    onDoubleClick={() => onPick(i)}
                  />
                  <span className="picker-num">{i + 1}</span>
                  <span className="picker-text">
                    <span className="picker-title">{s.title}</span>
                    <span className="picker-blurb">{s.blurb}</span>
                  </span>
                </label>
              </li>
            ))}
          </ol>
        </div>

        <ul className="picker-facts">
          <li>
            The game starts as soon as you press Start. Starting later begins with a colder cabin, and the
            mission report will say it wasn't a full run.
          </li>
          {crew.trim() && <li>Crew names on the start screen will be used: {crew.trim()}.</li>}
          <li>
            {saved != null ? (
              <>
                Saved on this device: <strong>scene {saved + 1}</strong> ({SCENES[saved].title}).{' '}
                <button type="button" className="btn-quiet" onClick={onClearSaved}>Clear saved progress</button>
              </>
            ) : (
              'No saved progress on this device.'
            )}
          </li>
        </ul>

        <footer className="picker-foot">
          <button type="button" className="btn-quiet" onClick={onClose}>Close</button>
          <button type="submit" className="btn-primary picker-start" disabled={choice === null}>
            {choice === null ? 'Choose a scene' : `Start from scene ${choice + 1}`}
          </button>
        </footer>
      </form>
    </div>
  )
}
