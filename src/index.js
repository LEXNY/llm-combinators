import React, { useState, useEffect } from 'react'
import { useImmer } from 'use-immer'
import ReactDOM from 'react-dom/client'
import InitialScene, {initialState} from './scenes'
import { useLanguage } from './hooks/useLanguage'

import './index.css'

const NullScene = () => "Downloading..."

export const App = () => {
  const [Scene, lazySetScene] = useState(() => NullScene)
  const setScene = (scene) => lazySetScene(() => scene)

  const [gameState, setGameState] = useImmer(initialState)

  const query = useLanguage(setGameState)
  useEffect(() => { if (query && Scene === NullScene) setScene(InitialScene) })

  return <Scene
    setScene={setScene} query={query}
    gameState={gameState} setGameState={setGameState}
  />
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
