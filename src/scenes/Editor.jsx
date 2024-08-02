import React from 'react'

const prompt = (sourcePrompt) => `
  Write a draft of the following prompt:
  ===
  ${sourcePrompt}
  ===
`

const comparisonPrompt = (sourcePrompt, apicalMeristem, sky) => `
  Compare the following drafts:
  (1)===
  ${apicalMeristem}
  (2)===
  ${sky}
  ===

  Both are in response to the prompt:
  (3)===
  ${sourcePrompt}
  ===

  What does (2) do better than (1)?
`

const schematic = {
  draft: "a draft of a response to a prompt",
}

const Editor = ({ query, gameState, setGameState }) => {
  const [sourcePrompt, setSourcePrompt] = React.useState('')
  // TODO: apicalMeristem as useState?

  // TODO: parrallel queries for generating new sky, and new meristem.

  // TODO: then comparison
  query(
    prompt(sourcePrompt),
    // TODO: not correct data structure, should be array of comparisons.
    ({ draft }) => state => state.comparisons.push
  )

  return <div>
    <input key="sourcePrompt" value={sourcePrompt} onChange={e => {
        setSourcePrompt(e.target.value)
        setGameState(state => {state.comparisons = []})
    }} />
    {gameState.comparisons.map(({apicalMeristem, sky}) => <div className="comparisonSet">
      <p>{apicalMeristem}</p>
      <p>{sky}</p>
    </div>)}
  </div>
}

export default Editor