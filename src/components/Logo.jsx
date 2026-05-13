// ─────────────────────────────────────────────
// Logo.jsx — ExamNova N-mark logo
// Usage: <Logo size={32} />
// ─────────────────────────────────────────────

export default function Logo({ size = 32, style = {} }) {
  const radius = Math.round(size * 0.22)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ borderRadius: radius, flexShrink: 0, display: 'block', ...style }}
    >
      {/* Dark navy background */}
      <rect width="100" height="100" rx="22" fill="#0f1f3d"/>
      {/* N letterform in white */}
      <path
        d="M28,72 L28,28 L50,60 L72,28 L72,72"
        fill="none"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Orange accent dot — top right of N */}
      <circle cx="72" cy="28" r="7" fill="#f97316"/>
    </svg>
  )
}