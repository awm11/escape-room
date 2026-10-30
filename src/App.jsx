import { useState } from 'react'
import { Runner } from './engine/runner.js'
import { play, loadProgress, clearProgress } from './game/play.js'
import LoadScreen from './components/LoadScreen.jsx'
import Terminal from './components/Terminal.jsx'

function keepScreenAwake() {
  try { navigator.wakeLock?.request('screen').catch(() => {}) } catch { /* not supported */ }
}

export default function App() {
  const [game, setGame] = useState(null)
  const [saved, setSaved] = useState(loadProgress)

  // Started from a click, not an effect, so it only ever runs once.
  function start(sceneIndex, crew = '') {
    const runner = new Runner()
    runner.crew = crew.trim()
    runner.startScene = sceneIndex
    setGame({ runner, startScene: sceneIndex })
    keepScreenAwake()
    play(runner, sceneIndex)
  }

  if (game) return <Terminal runner={game.runner} startScene={game.startScene} />

  return (
    <LoadScreen
      saved={saved}
      onStart={(crew) => { clearProgress(); start(0, crew) }}
      onResume={(crew) => start(saved, crew)}
      onSelectScene={start}
      onClearSaved={() => { clearProgress(); setSaved(null) }}
    />
  )
}
