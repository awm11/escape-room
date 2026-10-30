import { useEffect, useRef, useState } from 'react'
import { formatC, startingTemperature, temperatureAfter } from '../game/climate.js'

/** Header readout. Ticks once a second; the scenes never touch it. */
export default function CabinTemp({ startScene, heating, onTemp }) {
  // The last fixed point: a temperature and the moment it was true.
  const anchor = useRef(null)
  if (anchor.current === null) {
    anchor.current = { c: startingTemperature(startScene), at: performance.now(), heating: false }
  }
  const [now, setNow] = useState(() => performance.now())

  useEffect(() => {
    const id = setInterval(() => setNow(performance.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const read = (t) => {
    const a = anchor.current
    return temperatureAfter(a.c, (t - a.at) / 60000, a.heating)
  }

  // When the heating comes on, re-anchor at the current reading and start warming.
  if (heating && !anchor.current.heating) {
    const t = performance.now()
    anchor.current = { c: read(t), at: t, heating: true }
  }

  const c = read(now)
  useEffect(() => { onTemp?.(c) }, [c, onTemp])
  const state = heating ? 'temp-warm' : c <= 0 ? 'temp-danger' : c < 3 ? 'temp-cold' : ''

  return (
    <span className={`term-temp ${state}`} title="Cabin temperature">
      <span className="temp-label">Cabin</span>
      <span className="temp-value">{formatC(c)}</span>
    </span>
  )
}
