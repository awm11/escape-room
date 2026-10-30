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
            onPick={(i) => { setPicking(false); onSelectScene(i, crew) }}
            onClose={() => setPicking(false)}
            onClearSaved={onClearSaved}
          />
        )}
      </section>
    </main>
  )
}

function ScenePicker({ saved, onPick, onClose, onClearSaved }) {
  const firstRef = useRef(null)
  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="picker-backdrop" onClick={onClose}>
      <div
        className="picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="picker-title">Start from scene</h2>
        <p className="picker-guide">
          <a href={`${import.meta.env.BASE_URL}resources/`} target="_blank" rel="noopener">
            Open the teacher guide
          </a>{' '}
          (set-up, answers and printable resources, in a new tab)
        </p>
        <ol className="picker-list">
          {SCENES.map((s, i) => (
            <li key={s.id}>
              <button ref={i === 0 ? firstRef : undefined} onClick={() => onPick(i)}>
                <span className="picker-num">{i + 1}</span>
                <span className="picker-title">{s.title}</span>
                <code className="picker-fn">{s.id}()</code>
              </button>
            </li>
          ))}
        </ol>
        <div className="picker-foot">
          {saved != null ? (
            <button className="btn-quiet" onClick={onClearSaved}>
              Clear saved progress (step {saved + 1})
            </button>
          ) : (
            <span className="picker-note">No saved progress on this device.</span>
          )}
          <button className="btn-quiet" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
