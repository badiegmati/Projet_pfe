export default function LoadingSpinner({ full = false, size = 'md' }) {
  const sizes = { sm: 28, md: 48, lg: 72 }
  const s = sizes[size]

  const spinner = (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '1rem',
    }}>
      {/* Anneau double */}
      <div style={{ position: 'relative', width: s, height: s }}>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: `${s * 0.06}px solid rgba(168,85,247,0.15)`,
          borderTopColor: '#A855F7',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: s * 0.15,
          borderRadius: '50%',
          border: `${s * 0.06}px solid rgba(6,182,212,0.15)`,
          borderTopColor: '#06B6D4',
          animation: 'spin 1.2s linear infinite reverse',
        }} />
        <div style={{
          position: 'absolute',
          inset: s * 0.3,
          background: 'linear-gradient(135deg, #A855F7, #06B6D4)',
          borderRadius: '50%',
          opacity: 0.6,
          animation: 'glow-pulse 1.5s ease-in-out infinite',
        }} />
      </div>
      <p style={{
        fontSize: '0.8rem', fontWeight: 500,
        background: 'linear-gradient(135deg, #A855F7, #06B6D4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Chargement…
      </p>
    </div>
  )

  if (full) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#0D0D1A', position: 'relative',
      }}>
        {/* Orbes déco */}
        <div className="glow-orb glow-purple" style={{
          width: 300, height: 300, top: '20%', left: '10%',
          opacity: 0.3,
        }} />
        <div className="glow-orb glow-cyan" style={{
          width: 200, height: 200, bottom: '20%', right: '10%',
          opacity: 0.2,
        }} />
        {spinner}
      </div>
    )
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '3rem 0',
    }}>
      {spinner}
    </div>
  )
}