// Fire-and-forget notices (a badge earned, a set bonus). The App hosts the
// stack; anything anywhere can post to it.
export function toast({ icon = '✦', title, text = '' }) {
  window.dispatchEvent(new CustomEvent('t5334-toast', { detail: { icon, title, text, id: Math.random() } }))
}
