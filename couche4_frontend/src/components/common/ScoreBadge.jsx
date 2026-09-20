export default function ScoreBadge({ niveau, score, size = 'md' }) {
  const cfg = {
    FAIBLE:   {
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.3)',
      text: '#34D399',
      dot: '#10B981',
      glow: 'rgba(16,185,129,0.3)',
    },
    MODERE:   {
      bg: 'rgba(234,179,8,0.12)',
      border: 'rgba(234,179,8,0.3)',
      text: '#FDE047',
      dot: '#EAB308',
      glow: 'rgba(234,179,8,0.3)',
    },
    ELEVE:    {
      bg: 'rgba(249,115,22,0.12)',
      border: 'rgba(249,115,22,0.3)',
      text: '#FB923C',
      dot: '#F97316',
      glow: 'rgba(249,115,22,0.3)',
    },
    CRITIQUE: {
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.4)',
      text: '#F87171',
      dot: '#EF4444',
      glow: 'rgba(239,68,68,0.4)',
    },
  }

  const sizes = {
    sm: { fontSize: '0.65rem', padding: '0.2rem 0.5rem', dotSize: 5 },
    md: { fontSize: '0.75rem', padding: '0.3rem 0.7rem', dotSize: 6 },
    lg: { fontSize: '0.875rem',padding: '0.4rem 0.9rem', dotSize: 8 },
  }

  const c = cfg[niveau] || cfg.MODERE
  const s = sizes[size]

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: s.padding,
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '999px',
      fontSize: s.fontSize,
      fontWeight: 600,
      color: c.text,
      boxShadow: niveau === 'CRITIQUE'
        ? `0 0 10px ${c.glow}` : 'none',
      animation: niveau === 'CRITIQUE'
        ? 'pulse-neon 2s infinite' : 'none',
    }}>
      <span style={{
        width: s.dotSize, height: s.dotSize,
        borderRadius: '50%',
        background: c.dot,
        boxShadow: `0 0 6px ${c.glow}`,
        flexShrink: 0,
      }} />
      {niveau}
      {score !== undefined && (
        <span style={{ opacity: 0.75 }}>
          {(score * 100).toFixed(1)}%
        </span>
      )}
    </span>
  )
}