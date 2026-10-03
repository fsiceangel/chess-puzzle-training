// Small synthesised sounds, so there are no audio files to ship and nothing to
// download. Everything runs through one lazily-created AudioContext.
import { getSettings } from './storage.js'

let ctx = null

function audio() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq, dur = 0.12, type = 'sine', gain = 0.12, slideTo, delay = 0 }) {
  const ac = audio()
  if (!ac) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(amp).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

function enabled() {
  try {
    return getSettings().sound !== false
  } catch {
    return true
  }
}

export const sfx = {
  move() {
    if (enabled()) tone({ freq: 320, dur: 0.07, type: 'triangle', gain: 0.1 })
  },
  capture() {
    if (enabled()) tone({ freq: 180, dur: 0.1, type: 'square', gain: 0.08 })
  },
  right() {
    if (!enabled()) return
    tone({ freq: 660, dur: 0.1, type: 'sine', gain: 0.1 })
    tone({ freq: 990, dur: 0.14, type: 'sine', gain: 0.09, delay: 0.09 })
  },
  wrong() {
    if (enabled()) tone({ freq: 220, dur: 0.22, type: 'sawtooth', gain: 0.06, slideTo: 150 })
  },
  solved() {
    if (!enabled()) return
    ;[523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.16, gain: 0.09, delay: i * 0.075 }))
  },
  finish() {
    if (!enabled()) return
    ;[523, 659, 784, 1047, 1319].forEach((f, i) => tone({ freq: f, dur: 0.26, gain: 0.09, delay: i * 0.1 }))
  },
}
