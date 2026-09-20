import React, { useState } from 'react'
import { useNavigate }     from 'react-router-dom'
import {
  Shield, Eye, EyeOff,
  AlertCircle, Lock, User, Zap
} from 'lucide-react'
import { useAuth }  from '../hooks/useAuth'
import SoftAurora   from '../components/effects/SoftAurora'

// ── Hook responsive ───────────────────────────────────────
function useWindowSize() {
  const [size, setSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  })
  React.useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return size
}

const ROLES = [
  {
    id: 'CONDUCTEUR',
    label: 'Conducteur',
    desc: 'Accès à vos données personnelles',
    icon: '🚗',
    hint: 'C10 / Cond123456',
    color1: '#3B82F6',
    color2: '#06B6D4',
    glow: 'rgba(59,130,246,0.4)',
  },
  {
    id: 'GESTIONNAIRE',
    label: 'Gestionnaire',
    desc: 'Gestion de la flotte',
    icon: '👥',
    hint: 'G1 / Gest123456',
    color1: '#10B981',
    color2: '#06B6D4',
    glow: 'rgba(16,185,129,0.4)',
  },
  {
    id: 'ADMINISTRATEUR',
    label: 'Admin',
    desc: 'Administration système',
    icon: '⚡',
    hint: '00000000 / Admis123456',
    color1: '#A855F7',
    color2: '#EC4899',
    glow: 'rgba(168,85,247,0.4)',
  },
]

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const { width }  = useWindowSize()

  const isMobile  = width < 480
  const isTablet  = width >= 480 && width < 768

  const [role,    setRole]    = useState('CONDUCTEUR')
  const [id,      setId]      = useState('')
  const [mdp,     setMdp]     = useState('')

  const detectRoleFromId = (rawId) => {
    const candidate = rawId?.trim().toUpperCase() || ''
    if (candidate.startsWith('C')) return 'CONDUCTEUR'
    if (candidate.startsWith('G')) return 'GESTIONNAIRE'
    if (candidate === '00000000') return 'ADMINISTRATEUR'
    return null
  }
  const [showMdp, setShowMdp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur,  setErreur]  = useState('')

  const roleCfg = ROLES.find(r => r.id === role)

 const handleSubmit = async (e) => {
  e.preventDefault()

  if (!id.trim() || !mdp.trim()) {
    setErreur('Veuillez remplir tous les champs')
    return
  }

  const idSaisi = id.trim()

  setLoading(true)
  setErreur('')

  try {
    // ✅ login(id, motDePasse) — correspond à LoginDTO backend
    const data = await login(idSaisi, mdp)

    // ✅ Vérification que le rôle retourné correspond
    // au rôle sélectionné dans l'interface
    if (data.role !== role) {
      // Nettoyer le localStorage car mauvais rôle
      localStorage.removeItem('adas_user')
      localStorage.removeItem('token')

      const labelRole =
        role === 'CONDUCTEUR'     ? 'Conducteur'   :
        role === 'GESTIONNAIRE'   ? 'Gestionnaire' :
        'Administrateur'

      setErreur(
        `Cet identifiant n'appartient pas au profil "${labelRole}".`
        + ` Veuillez sélectionner le bon profil.`
      )
      return
    }

    // ✅ Navigation selon rôle
    const routes = {
      CONDUCTEUR:     '/conducteur/dashboard',
      GESTIONNAIRE:   '/gestionnaire/dashboard',
      ADMINISTRATEUR: '/admin/dashboard',
    }
    navigate(routes[data.role] || '/login')

  } catch (err) {
    setErreur(
      err.response?.data?.erreur
      || err.message
      || 'Identifiant ou mot de passe incorrect'
    )
  } finally {
    setLoading(false)
  }
}
  // ── Tailles adaptatives ───────────────────────────────
  const cardPadding   = isMobile ? '1.25rem' : isTablet ? '1.75rem' : '2rem'
  const logoSize      = isMobile ? 64 : 80
  const logoIconSize  = isMobile ? 28 : 36
  const titleSize     = isMobile ? '1.6rem' : '2rem'
  const subtitleSize  = isMobile ? '0.7rem' : '0.8rem'
  const maxCardWidth  = isMobile ? '100%' : isTablet ? '420px' : '440px'

  return (
    <div
      style={{
        /* ✅ CORRIGÉ : une seule propriété minHeight avec dvh + fallback vh */
        minHeight: 'max(100vh, 100dvh)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '1rem 0.875rem' : '1.5rem',
        overflow: 'hidden',
        background: '#0D0D1A',
      }}
    >
      {/* ── Aurora Background ── */}
      <SoftAurora
        speed={0.5}
        scale={isMobile ? 1.2 : 1.8}
        brightness={isMobile ? 0.5 : 0.7}
        color1={roleCfg.color1}
        color2={roleCfg.color2}
        noiseFrequency={2.0}
        noiseAmplitude={0.8}
        bandHeight={0.4}
        bandSpread={1.2}
        octaveDecay={0.15}
        layerOffset={0.3}
        colorSpeed={0.8}
        enableMouseInteraction={!isMobile}
        mouseInfluence={0.15}
      />

      {/* ── Orbes décoratifs (réduits sur mobile) ── */}
      {!isMobile && (
        <>
          <div
            style={{
              position: 'absolute',
              width: isTablet ? 280 : 400,
              height: isTablet ? 280 : 400,
              top: '-10%', left: '-5%',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(168,85,247,0.15), transparent 70%)`,
              filter: 'blur(40px)',
              opacity: 0.4,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: isTablet ? 200 : 300,
              height: isTablet ? 200 : 300,
              bottom: '5%', right: '-5%',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%)`,
              filter: 'blur(40px)',
              opacity: 0.3,
              pointerEvents: 'none',
            }}
          />
        </>
      )}

      {/* ── Grille décorative ── */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)
          `,
          backgroundSize: isMobile ? '40px 40px' : '60px 60px',
        }}
      />

      {/* ── Conteneur principal ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: maxCardWidth,
        }}
      >
        {/* ── Logo + Titre ── */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: isMobile ? '1.25rem' : '1.75rem',
            animation: 'fade-in 0.6s ease-out forwards',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: isMobile ? '0.875rem' : '1rem',
            }}
          >
            <div
              style={{
                width: logoSize,
                height: logoSize,
                borderRadius: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: `0 0 40px ${roleCfg.glow}`,
                transition: 'box-shadow 0.5s',
              }}
            >
              <Shield
                size={logoIconSize}
                style={{
                  color: role === 'ADMINISTRATEUR' ? '#A855F7'
                    : role === 'GESTIONNAIRE' ? '#10B981'
                    : '#3B82F6',
                }}
              />
            </div>
            {/* Anneau animé */}
            <div
              style={{
                position: 'absolute', inset: 0,
                borderRadius: '1.25rem',
                border: '2px solid transparent',
                borderTopColor: roleCfg.color1,
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
                animation: 'spin 4s linear infinite',
              }}
            />
          </div>

          <h1
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              color: '#fff',
              marginBottom: '0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Alpha Technology
          </h1>
          <p
            style={{
              fontSize: subtitleSize,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${roleCfg.color1}, ${roleCfg.color2})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Système ADAS/DMS — PFE 2024-2025
          </p>
        </div>

        {/* ── Card formulaire ── */}
        <div
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: isMobile ? '1.25rem' : '1.5rem',
            padding: cardPadding,
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
            animation: 'slide-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
          }}
        >
          {/* ── Sélecteur de rôle ── */}
          <div style={{ marginBottom: isMobile ? '1rem' : '1.25rem' }}>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#64748B',
                marginBottom: '0.625rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Sélectionner votre profil
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: isMobile ? '0.5rem' : '0.625rem',
              }}
            >
              {ROLES.map(r => {
                const isActive = role === r.id
                const rgbColor =
                  r.id === 'ADMINISTRATEUR' ? '168,85,247'
                  : r.id === 'GESTIONNAIRE'  ? '16,185,129'
                  : '59,130,246'
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => { setRole(r.id); setId(''); setErreur('') }}
                    style={{
                      padding: isMobile
                        ? '0.625rem 0.375rem'
                        : '0.75rem 0.5rem',
                      borderRadius: '0.75rem',
                      border: isActive
                        ? `1px solid rgba(${rgbColor},0.5)`
                        : '1px solid rgba(255,255,255,0.06)',
                      background: isActive
                        ? `linear-gradient(135deg, ${r.color1}22, ${r.color2}11)`
                        : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.25s',
                      boxShadow: isActive ? `0 0 20px ${r.glow}` : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: isMobile ? '1.2rem' : '1.4rem',
                        lineHeight: 1,
                      }}
                    >
                      {r.icon}
                    </span>
                    <p
                      style={{
                        fontSize: isMobile ? '0.62rem' : '0.7rem',
                        fontWeight: 600,
                        color: isActive ? '#F1F5F9' : '#64748B',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.label}
                    </p>
                  </button>
                )
              })}
            </div>

            <p
              style={{
                fontSize: '0.68rem',
                color: '#475569',
                textAlign: 'center',
                marginTop: '0.5rem',
              }}
            >
              {roleCfg?.desc}
            </p>
          </div>

          {/* ── Divider ── */}
          <div
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              margin: `${isMobile ? '0.875rem' : '1rem'} 0`,
            }}
          />

          {/* ── Formulaire ── */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '0.875rem' : '1rem',
            }}
          >
            {/* Identifiant */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#94A3B8',
                  marginBottom: '0.4rem',
                }}
              >
                Identifiant
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#475569',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={id}
                  onChange={e => {
                    const value = e.target.value
                    setId(value)
                    const autoRole = detectRoleFromId(value)
                    if (autoRole) setRole(autoRole)
                  }}
                  placeholder={roleCfg?.hint.split('/')[0].trim()}
                  autoComplete="username"
                  style={{
                    width: '100%',
                    padding: isMobile
                      ? '0.625rem 0.875rem 0.625rem 2.375rem'
                      : '0.75rem 0.875rem 0.75rem 2.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.625rem',
                    fontSize: isMobile ? '0.875rem' : '0.9rem',
                    color: '#F1F5F9',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    WebkitTextSizeAdjust: '100%',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = `${roleCfg.color1}66`
                    e.target.style.boxShadow = `0 0 0 3px ${roleCfg.color1}15`
                    e.target.style.background = 'rgba(255,255,255,0.07)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = 'rgba(255,255,255,0.05)'
                  }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#94A3B8',
                  marginBottom: '0.4rem',
                }}
              >
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#475569',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type={showMdp ? 'text' : 'password'}
                  value={mdp}
                  onChange={e => setMdp(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: isMobile
                      ? '0.625rem 2.5rem 0.625rem 2.375rem'
                      : '0.75rem 2.5rem 0.75rem 2.5rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.625rem',
                    fontSize: isMobile ? '0.875rem' : '0.9rem',
                    color: '#F1F5F9',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box',
                    WebkitTextSizeAdjust: '100%',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = `${roleCfg.color1}66`
                    e.target.style.boxShadow = `0 0 0 3px ${roleCfg.color1}15`
                    e.target.style.background = 'rgba(255,255,255,0.07)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.boxShadow = 'none'
                    e.target.style.background = 'rgba(255,255,255,0.05)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowMdp(!showMdp)}
                  style={{
                    position: 'absolute',
                    right: '0.875rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#475569',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 32,
                    minHeight: 32,
                  }}
                >
                  {showMdp
                    ? <EyeOff size={isMobile ? 16 : 14} />
                    : <Eye    size={isMobile ? 16 : 14} />
                  }
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {erreur && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '0.625rem',
                  color: '#FCA5A5',
                  fontSize: '0.78rem',
                  animation: 'fade-in 0.3s ease-out',
                  lineHeight: 1.5,
                }}
              >
                <AlertCircle
                  size={14}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                {erreur}
              </div>
            )}

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: isMobile ? '0.875rem' : '0.9rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                background: `linear-gradient(135deg, ${roleCfg.color1}, ${roleCfg.color2})`,
                color: '#fff',
                fontWeight: 700,
                fontSize: isMobile ? '0.9rem' : '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: `0 4px 20px ${roleCfg.glow}`,
                transition: 'all 0.25s',
                marginTop: '0.25rem',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = `0 8px 30px ${roleCfg.glow}`
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 4px 20px ${roleCfg.glow}`
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16, height: 16,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Connexion…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* ── Aide comptes de test ── */}
          <div
            style={{
              marginTop: isMobile ? '0.875rem' : '1.125rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '0.625rem',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: isMobile ? '0.68rem' : '0.7rem',
                color: '#475569',
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: '#64748B', fontWeight: 600 }}>
                Comptes de test :
              </span>{' '}
              {roleCfg?.hint}
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <p
          style={{
            textAlign: 'center',
            color: 'rgba(100,116,139,0.5)',
            fontSize: isMobile ? '0.62rem' : '0.68rem',
            marginTop: isMobile ? '1rem' : '1.5rem',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          Alpha Technology © 2024-2025 — PFE ADAS/DMS
        </p>
      </div>
    </div>
  )
}