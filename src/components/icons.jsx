const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
})

export const ArrowRight = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ArrowLeft = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)

export const Check = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M4 12.5 9.5 18 20 6.5" />
  </svg>
)

export const Cross = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const Bulb = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .9 1.6l.1.6h5.2l.1-.6c.1-.6.4-1.2.9-1.6A6 6 0 0 0 12 3z" />
  </svg>
)

export const Eye = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
)

export const Refresh = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M20 11a8 8 0 1 0-.6 4M20 5v6h-6" />
  </svg>
)

export const Flame = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M12 22c3.6 0 6-2.4 6-5.6 0-3.9-3.4-5.5-3.4-9.4 0 0-2.3 1.3-2.9 4.2C10.6 8.9 12 7.4 12 5c0 0-6 2.6-6 11.4C6 19.6 8.4 22 12 22z" />
  </svg>
)

export const Target = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)

export const Clock = ({ size = 18 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.3l3.4 2" />
  </svg>
)

export const Chart = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const Swords = ({ size = 18 }) => (
  <svg {...base(size)}>
    <path d="M4 3h3.5l9 9-3.5 3.5-9-9zM20 3h-3.5l-4.2 4.2M4.5 20 8 16.5M19.5 20 16 16.5M14 14l6 6" />
  </svg>
)

export const Star = ({ size = 18, filled = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'var(--gold)' : 'none'}
    stroke={filled ? 'var(--gold)' : 'var(--line-strong)'}
    strokeWidth="2"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m12 3.5 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9z" />
  </svg>
)

export const Logo = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 45 45" aria-hidden="true">
    <g fill="currentColor">
      <path d="M21.2 6h2.6v2.6h2.6v2.6h-2.6v2.8h-2.6v-2.8h-2.6V8.6h2.6z" />
      <path d="M22.5 14.4c-2.7 0-4.6 1.2-5.8 2.6-1.6-1.4-3.4-1.7-4.8-.7-1.6 1.2-1.8 3.4-.6 5.4 1 1.7 2.4 3.4 3.4 5.2.9 1.6 1.4 3.4 1.6 5.1h12.4c.2-1.7.7-3.5 1.6-5.1 1-1.8 2.4-3.5 3.4-5.2 1.2-2 1-4.2-.6-5.4-1.4-1-3.2-.7-4.8.7-1.2-1.4-3.1-2.6-5.8-2.6z" />
      <path d="M13.6 33h17.8c1 1 1.6 1.9 1.8 2.8H11.8c.2-.9.8-1.8 1.8-2.8z" />
      <path d="M11.5 39.2h22a1.2 1.2 0 0 0 1.2-1.2v-1.6a1.2 1.2 0 0 0-1.2-1.2h-22a1.2 1.2 0 0 0-1.2 1.2V38a1.2 1.2 0 0 0 1.2 1.2z" />
    </g>
  </svg>
)
