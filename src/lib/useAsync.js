import { useEffect, useState } from 'react'

// Minimal data-loading hook: runs the promise factory when its key changes and
// reports the three states a view needs to render.
export function useAsync(factory, key) {
  const [state, setState] = useState({ loading: true, data: null, error: null })
  useEffect(() => {
    let live = true
    setState({ loading: true, data: null, error: null })
    factory()
      .then((data) => live && setState({ loading: false, data, error: null }))
      .catch((error) => live && setState({ loading: false, data: null, error }))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return state
}

// Deterministic shuffle helpers, so a day's mix is the same one all day and a
// different one tomorrow.
export function seedFrom(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function mulberry32(seed) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
