import { useEffect, useRef, useState } from 'react'
import { formatC } from '../game/climate.js'
import { SCENES } from '../game/scenes.js'

function duration(ms) {
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  return m ? `${m} min ${String(total % 60).padStart(2, '0')} s` : `${total} s`
}

export default function MissionReport({ runner }) {
  const [copied, setCopied] = useState(false)
  const [ready, setReady] = useState(false) // the report appears 3 seconds after the engines start
  const ref = useRef(null)

  useEffect(() => {
    const id = setTimeout(() => setReady(true), 3000)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (ready) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [ready])

  const { wrong, crew, startScene } = runner
  const wrongTotal = wrong.phrase + wrong.period + wrong.code
  const time = duration(runner.endedAt - runner.startedAt)
  const coldest = formatC(runner.minTemp ?? 0)
  const partial = startScene > 0 // started mid-game from the admin menu

  const breakdown = [
    ['Manual phrase', wrong.phrase],
    ['Pendulum period', wrong.period],
    ['Engine code', wrong.code],
  ]

  function copy() {
    const lines = [
      'TEMPORA MISSION REPORT',
      crew && `Crew: ${crew}`,
      `Time taken: ${time}`,
      `Wrong answers: ${wrongTotal} (${breakdown.map(([k, n]) => `${k} ${n}`).join(', ')})`,
      `Coldest point: ${coldest}`,
      partial && `Started from scene ${startScene + 1}: ${SCENES[startScene].title}`,
    ].filter(Boolean)
    try {
      navigator.clipboard.writeText(lines.join('\n')).then(
        () => { setCopied(true); setTimeout(() => setCopied(false), 2000) },
        () => {},
      )
    } catch { /* clipboard unavailable: they can screenshot instead */ }
  }

  if (!ready) return null

  return (
    <section ref={ref} className="report" aria-label="Mission report">
      <h2 className="report-title">Mission report</h2>
      <p className="report-sub">Engines restarted. Transmission ended.</p>

      <dl className="report-rows">
        {crew && (<><dt>Crew</dt><dd>{crew}</dd></>)}
        <dt>Time taken</dt>
        <dd>{time}</dd>
        <dt>Wrong answers</dt>
        <dd>
          {wrongTotal}
          {wrongTotal > 0 && (
            <span className="report-detail">
              {breakdown.filter(([, n]) => n > 0).map(([k, n]) => `${k} ${n}`).join(', ')}
            </span>
          )}
        </dd>
        <dt>Coldest point</dt>
        <dd>{coldest}</dd>
      </dl>

      {partial && (
        <p className="report-note">
          Timer started at scene {startScene + 1} ({SCENES[startScene].title}), so this run is not the full mission.
        </p>
      )}

      <div className="report-actions">
        <button className="btn-quiet" onClick={copy}>{copied ? 'Copied' : 'Copy report'}</button>
        <button className="btn-quiet" onClick={() => window.location.reload()}>Back to start</button>
      </div>
    </section>
  )
}
