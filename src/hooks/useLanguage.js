import { useState, useEffect } from 'react';
import * as language from '@mlc-ai/web-llm';

// TODO: implement a stream digraph.  Callbacks at the ends.
// Just async and callbacks are all we need for the whole impl.
// Singleton maintains the global graph.
// Call params are a list of functions, each a node in the tree.
// If any given function already
// ----
// Scratch all that.
// ----
// What we can do that's easier is to just call `useLanguage` more than once.
// Thus, we'll have a pool of `query` functions.
// Implement a pool which just gives you the first ready `query` function.
// Wrap the callback in another callback, which moves `query` back to ready.
// The inner callback is still passed to `query`.
const usePool = (hook, n) => {
  const [ready, setReady] = useState([]);
  for(let i = 0; i < n; i++) {
    const query = hook()
    const wrappedQuery = () => {
      query()
      setReady([...ready, wrappedQuery])
    }
    setReady([...ready, wrappedQuery])
  }
  return () => {
    const [query, ...rest] = ready
    setReady(rest)
    return query
  }
}

export const useLanguage = (setter) => {
  const [engine, setEngine] = useState(undefined);

  // TODO: engine thread pool.  3 should be doable.
  // implement a separate stream processing hook.
  useEffect(() => {
    (async () => {
      setEngine(await language.CreateMLCEngine("Phi-3-mini-4k-instruct-q4f16_1-MLC"));
    })();
  }, []);

  if (engine) {
    return async (prompt, schematic, callback) => {
      const strungifiedSchematic = JSON.stringify(schematic);

      while (true) {
        try {
          await engine.chatCompletion({
            stream: false,
            response_format: { type: "json_object" },
            temperature: 0.8,
            messages: [
              { role: "system", content: "You respond with JSON matching the schema of this object: \n```" + strungifiedSchematic + "```"},
              { role: "user", content: prompt }
            ],
          });

          const message = await engine.getMessage();

          // callback is the API-consumer-provided plan.
          // setter is the `useImmer` setter.
          // JSON.parse(message) is the generated content.
          console.log(`generated: ${message}`);
          const parsedResponse = JSON.parse(message);

          // TODO: keep?  Or better idea?  Search codebase for VALIDATION
          // additional validation of parsedResponse against schematic.
          // TODO: pass in a validation function.
          for(const key in schematic) {
            // TODO: hack until improving validation of optional keys.
            if(key === 'does' || key === 'says') { continue }
            if(!(key in parsedResponse)) {
              console.error(JSON.stringify(parsedResponse), JSON.stringify(schematic));
              throw new Error(`Key ${key} not found in response`);
            }
          }

          setter(callback(parsedResponse));
          break;
        } catch (e) {
          console.error(e, prompt);
        }
      }
    };
  }
};