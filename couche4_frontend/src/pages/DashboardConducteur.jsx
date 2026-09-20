/**
 * DashboardConducteur — Dark Dashboard Style Professionnel
 * Responsive : Mobile / Tablette / Desktop
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  LayoutDashboard, Activity, Shield,
  MessageSquare, Car, Bell, RefreshCw,
  TrendingUp, AlertTriangle, CheckCircle,
  Eye, Phone, Cigarette, Navigation,
  Gauge, Clock, MapPin, ChevronRight,
  Zap, Star, BarChart2, User,
  ArrowUpRight, ArrowDownRight, Wifi,
  Menu, X
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { useAuth }          from '../hooks/useAuth'
import NavBar               from '../components/common/NavBar'
import ScoreJauge           from '../components/conducteur/ScoreJauge'
import MapLeaflet           from '../components/conducteur/MapLeaflet'
import MessageForm          from '../components/messagerie/MessageForm'
import ScoreBadge           from '../components/common/ScoreBadge'
import LoadingSpinner       from '../components/common/LoadingSpinner'
import {
  conducteurAPI, notificationAPI,
  scoreAPI, messageAPI
} from '../api/apiService'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
)

// ── Constantes style ─────────────────────────────────────
const BG       = '#0D0D1A'
const BG_CARD  = '#12121F'
const BG_CARD2 = '#1A1A2E'
const BORDER   = 'rgba(255,255,255,0.06)'
const PURPLE   = '#A855F7'
const PINK     = '#EC4899'
const CYAN     = '#06B6D4'
const BLUE     = '#3B82F6'
const GREEN    = '#10B981'
const ORANGE   = '#F97316'
const RED      = '#EF4444'
const TEXT     = '#F1F5F9'
const MUTED    = '#475569'

// ── Hook responsive ──────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState({
    isMobile:  window.innerWidth < 640,
    isTablet:  window.innerWidth >= 640 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    width:     window.innerWidth,
  })
  useEffect(() => {
    const fn = () => setBp({
      isMobile:  window.innerWidth < 640,
      isTablet:  window.innerWidth >= 640 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024,
      width:     window.innerWidth,
    })
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return bp
}

// ── Mapping types événements ──────────────────────────────
const TYPE_CFG = {
  FATIGUE_EYES_CLOSED: { icon: Eye,           label: 'Yeux fermés',      color: RED    },
  FATIGUE_EYES_DROWSY: { icon: Eye,           label: 'Somnolence',       color: RED    },
  FATIGUE_YAWN:        { icon: Eye,           label: 'Baillement',       color: ORANGE },
  FATIGUE_DROP:        { icon: Eye,           label: 'Tête tombante',    color: RED    },
  DISTRACTION:         { icon: Eye,           label: 'Distraction',      color: ORANGE },
  PHONE:               { icon: Phone,         label: 'Téléphone',        color: PINK   },
  SMOKING:             { icon: Cigarette,     label: 'Tabagisme',        color: ORANGE },
  SEATBELT:            { icon: AlertTriangle, label: 'Ceinture absente', color: RED    },
  FCW_WARNING:         { icon: Car,           label: 'Alerte collision', color: PURPLE },
  FCW_DANGER:          { icon: Car,           label: 'Danger collision', color: RED    },
  LDW_LEFT:            { icon: Navigation,    label: 'Sortie voie G',    color: CYAN   },
  LDW_RIGHT:           { icon: Navigation,    label: 'Sortie voie D',    color: CYAN   },
}

// ════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
export default function DashboardConducteur() {
  const { user }                      = useAuth()
  const { isMobile, isTablet }        = useBreakpoint()
  const [activeTab,   setActiveTab]   = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profil,      setProfil]      = useState(null)
  const [score,       setScore]       = useState(null)
  const [historique,  setHistorique]  = useState([])
  const [evenements,  setEvenements]  = useState([])
  const [notifs,      setNotifs]      = useState([])
  const [tableau,     setTableau]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [lastUpdate,  setLastUpdate]  = useState(new Date())

  const chargerDonnees = useCallback(async () => {
    if (!user?.id) return
    try {
      const [p, s, h, e, n, t] = await Promise.allSettled([
        conducteurAPI.getProfil(user.id),
        scoreAPI.getActuel(user.id),
        scoreAPI.getHistorique(user.id),
        conducteurAPI.getEvenements(user.id),
        notificationAPI.getAll(user.id),
        conducteurAPI.getTableauBord(user.id),
      ])
      if (p.status === 'fulfilled') setProfil(p.value.data)
      if (s.status === 'fulfilled') setScore(s.value.data)
      if (h.status === 'fulfilled') setHistorique(h.value.data || [])
      if (e.status === 'fulfilled') setEvenements(e.value.data || [])
      if (n.status === 'fulfilled') setNotifs(n.value.data || [])
      if (t.status === 'fulfilled') setTableau(t.value.data)
      setLastUpdate(new Date())
    } catch {}
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    chargerDonnees()
    const iv = setInterval(chargerDonnees, 30000)
    return () => clearInterval(iv)
  }, [chargerDonnees])

  // Fermer sidebar si on passe en desktop
  useEffect(() => {
    if (!isMobile && !isTablet) setSidebarOpen(false)
  }, [isMobile, isTablet])

  const scoreVal = parseFloat(
    score?.scoreValeur ?? profil?.scoreJournalier ?? 0
  )
  const niveau = score?.niveauRisque
    || (scoreVal < 0.25 ? 'FAIBLE'
      : scoreVal < 0.50 ? 'MODERE'
      : scoreVal < 0.75 ? 'ELEVE'
      : 'CRITIQUE')
  const nbNonLues = notifs.filter(n => !n.lue).length

  const marquerLue = async (id) => {
    await notificationAPI.marquerLue(id)
    setNotifs(prev => prev.map(n =>
      n.id === id ? { ...n, lue: true } : n
    ))
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  if (loading) return <LoadingSpinner full />

  const sideItems = [
    { id: 'dashboard',  label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'historique', label: 'Historique',       icon: Activity,
      badge: nbNonLues > 0 ? nbNonLues : null },
    { id: 'score',      label: 'Mon Score',        icon: Shield },
    { id: 'messages',   label: 'Messages',         icon: MessageSquare },
    { id: 'profil',     label: 'Mon Compte',       icon: User },
  ]

  const showSidebar = !isMobile && !isTablet

  return (
    <div style={{ minHeight: '100vh', background: BG, display: 'flex', flexDirection: 'column' }}>

      {/* NavBar top */}
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Bouton hamburger mobile/tablette ── */}
      {(isMobile || isTablet) && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            top: 70, left: 12,
            zIndex: 60,
            width: 38, height: 38,
            background: BG_CARD2,
            border: `1px solid ${BORDER}`,
            borderRadius: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: TEXT,
            boxShadow: `0 4px 16px rgba(0,0,0,0.4)`,
          }}
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      {/* ── Overlay sidebar mobile ── */}
      {(isMobile || isTablet) && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 45,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            animation: 'fade-in 0.2s ease-out',
          }}
        />
      )}

      {/* Corps */}
      <div style={{
        display: 'flex',
        flex: 1,
        maxWidth: 1400,
        margin: '0 auto',
        width: '100%',
        padding: isMobile
          ? '72px 0.75rem 1.5rem'
          : isTablet
            ? '72px 1rem 1.5rem'
            : '80px 1.5rem 2rem',
        gap: showSidebar ? '1.5rem' : 0,
        position: 'relative',
      }}>

        {/* ══ SIDEBAR ══════════════════════════════════════ */}
        {/* Desktop sidebar */}
        {showSidebar && (
          <Sidebar
            items={sideItems}
            active={activeTab}
            onSelect={handleTabChange}
            profil={profil}
            scoreVal={scoreVal}
            niveau={niveau}
          />
        )}

        {/* Mobile/Tablette sidebar (drawer) */}
        {(isMobile || isTablet) && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            width: 260,
            zIndex: 50,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
            background: BG,
            borderRight: `1px solid ${BORDER}`,
            boxShadow: sidebarOpen ? `4px 0 32px rgba(0,0,0,0.6)` : 'none',
            overflowY: 'auto',
            padding: '80px 0.75rem 1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
          }}>
            <Sidebar
              items={sideItems}
              active={activeTab}
              onSelect={handleTabChange}
              profil={profil}
              scoreVal={scoreVal}
              niveau={niveau}
              compact={isMobile}
            />
          </div>
        )}

        {/* ══ CONTENU PRINCIPAL ════════════════════════════ */}
        <main style={{
          flex: 1,
          minWidth: 0,
          marginLeft: (isMobile || isTablet) ? 0 : undefined,
        }}>
          {activeTab === 'dashboard' && (
            <DashboardTab
              profil={profil}
              score={score}
              scoreVal={scoreVal}
              niveau={niveau}
              historique={historique}
              evenements={evenements}
              tableau={tableau}
              nbNonLues={nbNonLues}
              lastUpdate={lastUpdate}
              onRefresh={chargerDonnees}
              onNavigate={handleTabChange}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          )}

          {activeTab === 'historique' && (
            <HistoriqueTab
              notifs={notifs}
              evenements={evenements}
              nbNonLues={nbNonLues}
              onMarquerLue={marquerLue}
              isMobile={isMobile}
            />
          )}

          {activeTab === 'score' && (
            <ScoreTab
              score={score}
              scoreVal={scoreVal}
              niveau={niveau}
              historique={historique}
              evenements={evenements}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesTab profil={profil} isMobile={isMobile} />
          )}

          {activeTab === 'profil' && (
            <ProfilTab
              profil={profil}
              onUpdate={chargerDonnees}
              isMobile={isMobile}
            />
          )}
        </main>
      </div>

      {/* ── Bottom nav mobile ── */}
      {isMobile && (
        <BottomNav
          items={sideItems}
          active={activeTab}
          onSelect={handleTabChange}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// BOTTOM NAV (mobile uniquement)
// ════════════════════════════════════════════════════════
function BottomNav({ items, active, onSelect }) {
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 50,
      background: 'rgba(18,18,31,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${BORDER}`,
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {items.map(item => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '0.625rem 0.25rem',
              background: 'none', border: 'none',
              cursor: 'pointer',
              color: isActive ? PURPLE : MUTED,
              position: 'relative',
              transition: 'color 0.2s',
            }}
          >
            {/* Indicateur actif */}
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 24, height: 2,
                background: `linear-gradient(90deg, ${PURPLE}, ${PINK})`,
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <div style={{ position: 'relative' }}>
              <Icon size={20} />
              {item.badge && (
                <span style={{
                  position: 'absolute', top: -6, right: -8,
                  background: RED, color: '#fff',
                  fontSize: '0.55rem', fontWeight: 700,
                  borderRadius: 999, minWidth: 15, height: 15,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 3px',
                }}>
                  {item.badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '0.6rem', fontWeight: isActive ? 600 : 400,
              marginTop: 3, lineHeight: 1,
            }}>
              {item.label.split(' ')[0]}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ════════════════════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════════════════════
function Sidebar({ items, active, onSelect, profil, scoreVal, niveau, compact = false }) {
  const niveauColor = {
    FAIBLE: GREEN, MODERE: '#EAB308',
    ELEVE: ORANGE, CRITIQUE: RED,
  }[niveau] || PURPLE

  return (
    <aside style={{
      width: compact ? 220 : 240,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      {/* Profil card */}
      <div style={{
        background: BG_CARD2,
        border: `1px solid ${BORDER}`,
        borderRadius: '1rem',
        padding: compact ? '1rem' : '1.25rem',
        marginBottom: '0.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80,
          background: `radial-gradient(circle, ${PURPLE}33, transparent 70%)`,
          borderRadius: '50%',
        }} />
        <div style={{
          width: compact ? 40 : 48,
          height: compact ? 40 : 48,
          background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`,
          borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? '0.9rem' : '1.1rem',
          fontWeight: 700, color: '#fff',
          marginBottom: '0.75rem',
          boxShadow: `0 0 20px ${PURPLE}44`,
        }}>
          {profil?.prenom?.[0]}{profil?.nom?.[0]}
        </div>
        <p style={{
          fontWeight: 700,
          fontSize: compact ? '0.8rem' : '0.9rem',
          color: TEXT, marginBottom: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {profil?.prenom} {profil?.nom}
        </p>
        <p style={{
          fontSize: '0.7rem', color: MUTED,
          marginBottom: '0.75rem',
        }}>
          {profil?.id} · Conducteur
        </p>
        {/* Mini score bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '0.65rem', color: MUTED }}>Score risque</span>
            <span style={{ fontSize: '0.65rem', color: niveauColor, fontWeight: 600 }}>
              {(scoreVal * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{
            height: 4, background: 'rgba(255,255,255,0.06)',
            borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${scoreVal * 100}%`,
              background: `linear-gradient(90deg, ${niveauColor}, ${PINK})`,
              borderRadius: 2,
              boxShadow: `0 0 8px ${niveauColor}66`,
              transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
            }} />
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <div style={{
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: '1rem',
        padding: '0.625rem',
        display: 'flex', flexDirection: 'column', gap: '0.25rem',
      }}>
        {items.map((item, i) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                display: 'flex', alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '0.625rem',
                border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 500,
                background: isActive
                  ? `linear-gradient(135deg, ${PURPLE}22, ${PINK}11)`
                  : 'transparent',
                color: isActive ? TEXT : MUTED,
                borderLeft: isActive
                  ? `2px solid ${PURPLE}` : '2px solid transparent',
                transition: 'all 0.2s',
                textAlign: 'left', width: '100%',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = TEXT
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = MUTED
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Icon size={16} style={{ color: isActive ? PURPLE : 'inherit', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  background: RED, color: '#fff',
                  fontSize: '0.6rem', fontWeight: 700,
                  borderRadius: 999, minWidth: 18, height: 18,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 4px',
                  boxShadow: `0 0 8px ${RED}66`,
                  animation: 'pulse-neon 2s infinite',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Véhicule assigné */}
      {profil?.nomVehicule && (
        <div style={{
          background: BG_CARD,
          border: `1px solid ${BORDER}`,
          borderRadius: '1rem',
          padding: '1rem',
          marginTop: '0.25rem',
        }}>
          <p style={{
            fontSize: '0.65rem', color: MUTED,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: '0.625rem', fontWeight: 600,
          }}>
            Véhicule assigné
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32, height: 32,
              background: `${CYAN}18`, border: `1px solid ${CYAN}33`,
              borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Car size={14} style={{ color: CYAN }} />
            </div>
            <div>
              <p style={{
                fontSize: '0.78rem', fontWeight: 600, color: TEXT,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: 140,
              }}>
                {profil.nomVehicule}
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.65rem', color: GREEN,
              }}>
                <Wifi size={9} /> En service
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

// ════════════════════════════════════════════════════════
// TAB — DASHBOARD PRINCIPAL
// ════════════════════════════════════════════════════════
function DashboardTab({
  profil, score, scoreVal, niveau, historique,
  evenements, tableau, nbNonLues, lastUpdate,
  onRefresh, onNavigate, isMobile, isTablet
}) {
  const niveauColor = {
    FAIBLE: GREEN, MODERE: '#EAB308',
    ELEVE: ORANGE, CRITIQUE: RED,
  }[niveau] || PURPLE

  const dmsData = {
    fatigue:     score?.nbFatigue     || 0,
    telephone:   score?.nbTelephone   || 0,
    ceinture:    score?.nbCeinture    || 0,
    distraction: score?.nbDistraction || 0,
    other: Math.max(0,
      (score?.nbTotal || 0)
      - (score?.nbFatigue || 0)
      - (score?.nbTelephone || 0)
      - (score?.nbCeinture || 0)
      - (score?.nbDistraction || 0)
    ),
  }

  const histLabels = [...historique].reverse().map(s =>
    new Date(s.dateCalcul).toLocaleDateString('fr-FR',
      { day: '2-digit', month: '2-digit' })
  )
  const histScores = [...historique].reverse().map(s =>
    +(s.scoreValeur * 100).toFixed(1)
  )

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const evtParJour = days.map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return evenements.filter(e => {
      const ed = new Date(e.dateHeure)
      return ed.toDateString() === d.toDateString()
    }).length
  })

  // Grilles responsives
  const kpiCols = isMobile
    ? 'repeat(2, 1fr)'
    : isTablet
      ? 'repeat(2, 1fr)'
      : 'repeat(4, 1fr)'

  const jaugeCols = isMobile
    ? '1fr'
    : isTablet
      ? '1fr'
      : '280px 1fr'

  const chartsCols = isMobile
    ? '1fr'
    : isTablet
      ? '1fr 1fr'
      : '220px 1fr 1fr'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: isMobile ? '1rem' : '1.25rem',
      paddingBottom: isMobile ? '5rem' : 0,
    }}>

      {/* ── En-tête ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.75rem',
        animation: 'fade-in 0.4s ease-out',
        paddingLeft: (isMobile || isTablet) ? '2.5rem' : 0,
      }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: 800, color: TEXT, marginBottom: 4,
          }}>
            Bonjour,{' '}
            <span style={{
              background: `linear-gradient(135deg, ${PURPLE}, ${PINK})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {profil?.prenom} 👋
            </span>
          </h1>
          {!isMobile && (
            <p style={{ fontSize: '0.8rem', color: MUTED }}>
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric',
                month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>
        <button
          onClick={onRefresh}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: isMobile ? '0.4rem 0.625rem' : '0.5rem 1rem',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${BORDER}`,
            borderRadius: '0.625rem',
            color: MUTED, fontSize: '0.75rem',
            cursor: 'pointer', transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = PURPLE
            e.currentTarget.style.borderColor = `${PURPLE}44`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = MUTED
            e.currentTarget.style.borderColor = BORDER
          }}
        >
          <RefreshCw size={13} />
          {!isMobile && lastUpdate.toLocaleTimeString('fr-FR',
            { hour: '2-digit', minute: '2-digit' })}
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: kpiCols,
        gap: isMobile ? '0.625rem' : '1rem',
      }}>
        {[
          {
            label: 'Score de risque',
            value: `${(scoreVal * 100).toFixed(0)}%`,
            sub: niveau,
            icon: Shield,
            color: niveauColor,
            trend: scoreVal > 0.5 ? 'up' : 'down',
            delay: 0,
          },
          {
            label: 'Total alertes',
            value: score?.nbTotal || evenements.length,
            sub: '7 derniers jours',
            icon: AlertTriangle,
            color: ORANGE,
            delay: 80,
          },
          {
            label: 'Fatigue',
            value: score?.nbFatigue || 0,
            sub: 'événements DMS',
            icon: Eye,
            color: RED,
            delay: 160,
          },
          {
            label: 'Notifications',
            value: nbNonLues,
            sub: 'non lues',
            icon: Bell,
            color: CYAN,
            delay: 240,
          },
        ].map((kpi, i) => (
          <KpiCard key={i} {...kpi} compact={isMobile} />
        ))}
      </div>

      {/* ── Ligne 2 : Score jauge + Line chart ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: jaugeCols,
        gap: isMobile ? '0.75rem' : '1rem',
      }}>
        <DarkCard
          title="Score actuel"
          subtitle="Risque comportemental"
          delay={0} accent={niveauColor}
        >
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: isMobile ? '0.5rem 0' : 0,
          }}>
            <div style={{ flexShrink: 0 }}>
              <ScoreJauge score={scoreVal} niveau={niveau} />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr',
              gap: '0.5rem',
              width: isMobile ? 'auto' : '100%',
              marginTop: isMobile ? 0 : '1rem',
            }}>
              {[
                { label: 'Fatigue',   val: score?.nbFatigue   || 0, color: RED    },
                { label: 'Téléphone', val: score?.nbTelephone || 0, color: PINK   },
                { label: 'Ceinture',  val: score?.nbCeinture  || 0, color: ORANGE },
                { label: 'FCW',       val: score?.nbFcw       || 0, color: PURPLE },
              ].map(item => (
                <div key={item.label} style={{
                  background: `${item.color}12`,
                  border: `1px solid ${item.color}22`,
                  borderRadius: '0.5rem',
                  padding: isMobile ? '0.375rem' : '0.5rem',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontSize: isMobile ? '0.9rem' : '1.1rem',
                    fontWeight: 700, color: item.color,
                  }}>
                    {item.val}
                  </p>
                  <p style={{ fontSize: '0.6rem', color: MUTED }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DarkCard>

        <DarkCard
          title="Évolution du score de risque"
          subtitle="7 derniers jours"
          delay={80} accent={PURPLE}
        >
          <LineChartScore
            labels={histLabels}
            scores={histScores}
            height={isMobile ? 160 : 200}
          />
        </DarkCard>
      </div>

      {/* ── Ligne 3 : Charts ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: chartsCols,
        gap: isMobile ? '0.75rem' : '1rem',
      }}>
        <DarkCard title="Types d'alertes" subtitle="Répartition DMS"
          delay={0} accent={CYAN}>
          <DoughnutChart data={dmsData} compact={isMobile} />
        </DarkCard>

        <DarkCard title="Alertes par jour" subtitle="7 derniers jours"
          delay={80} accent={BLUE}>
          <BarChartJour labels={days} data={evtParJour}
            height={isMobile ? 150 : 180} />
        </DarkCard>

        {/* Sur mobile, DmsVsAdas passe en pleine largeur */}
        <div style={{
          gridColumn: isMobile ? '1 / -1' : 'auto',
        }}>
          <DarkCard title="DMS vs ADAS" subtitle="Comparaison"
            delay={160} accent={PINK}>
            <DmsVsAdas
              dms={tableau?.totalDms   || tableau?.dmsTotal   || tableau?.dms?.totalDms   || 0}
              adas={tableau?.totalAdas || tableau?.adasTotal  || tableau?.adas?.totalAdas || 0}
              compact={isMobile}
            />
          </DarkCard>
        </div>
      </div>

      {/* ── Derniers événements ── */}
      <DarkCard
        title="Derniers événements détectés"
        subtitle={`${evenements.length} total · Polling 30s`}
        delay={0} accent={PURPLE}
        headerRight={
          evenements.length > 5 && (
            <button
              onClick={() => onNavigate('historique')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.75rem', color: PURPLE,
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              Voir tout <ChevronRight size={13} />
            </button>
          )
        }
      >
        <EventsList evenements={evenements.slice(0, isMobile ? 4 : 6)} />
      </DarkCard>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// TAB — HISTORIQUE
// ════════════════════════════════════════════════════════
function HistoriqueTab({ notifs, evenements, nbNonLues, onMarquerLue, isMobile }) {
  const [subTab, setSubTab] = useState('notifs')

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: '1.25rem', animation: 'slide-up 0.4s ease-out',
      paddingBottom: isMobile ? '5rem' : 0,
      paddingLeft: isMobile ? '2.5rem' : 0,
    }}>
      <div>
        <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 700, color: TEXT }}>
          Historique & Notifications
        </h2>
        {nbNonLues > 0 && (
          <p style={{ fontSize: '0.78rem', color: RED, marginTop: 2 }}>
            {nbNonLues} notification{nbNonLues > 1 ? 's' : ''} non lue{nbNonLues > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'notifs',     label: `Notifs (${notifs.length})`,    icon: Bell,     color: PURPLE },
          { id: 'evenements', label: `Événements (${evenements.length})`, icon: Activity, color: CYAN },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = subTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: isMobile ? '0.5rem 0.875rem' : '0.6rem 1.25rem',
                borderRadius: '0.625rem', border: 'none', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600,
                background: isActive
                  ? `linear-gradient(135deg, ${tab.color}22, ${tab.color}11)`
                  : BG_CARD,
                color: isActive ? tab.color : MUTED,
                borderBottom: isActive
                  ? `2px solid ${tab.color}` : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {subTab === 'notifs' && (
        <DarkCard title="" delay={0} accent={PURPLE}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {notifs.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                message="Aucune notification"
                sub="Les alertes DMS/ADAS apparaîtront automatiquement"
              />
            ) : notifs.map((n, i) => (
              <NotifRow key={n.id} notif={n} delay={i * 30}
                onMarquer={onMarquerLue} />
            ))}
          </div>
        </DarkCard>
      )}

      {subTab === 'evenements' && (
        <DarkCard title="" delay={0} accent={CYAN}>
          <EventsList evenements={evenements} compact={false} />
        </DarkCard>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// TAB — SCORE
// ════════════════════════════════════════════════════════
function ScoreTab({ score, scoreVal, niveau, historique, evenements,
  isMobile, isTablet }) {
  const niveauColor = {
    FAIBLE: GREEN, MODERE: '#EAB308',
    ELEVE: ORANGE, CRITIQUE: RED,
  }[niveau] || PURPLE

  const histLabels = [...historique].reverse().map(s =>
    new Date(s.dateCalcul).toLocaleDateString('fr-FR',
      { day: '2-digit', month: '2-digit' })
  )
  const histScores = [...historique].reverse().map(s =>
    +(s.scoreValeur * 100).toFixed(1)
  )

  const details = [
    { label: 'Alertes fatigue',     val: score?.nbFatigue     || 0, max: 20, color: RED      },
    { label: 'Téléphone au volant', val: score?.nbTelephone   || 0, max: 10, color: PINK     },
    { label: 'Ceinture absente',    val: score?.nbCeinture    || 0, max: 10, color: ORANGE   },
    { label: 'Distraction',         val: score?.nbDistraction || 0, max: 10, color: '#EAB308'},
    { label: 'FCW (collision)',      val: score?.nbFcw         || 0, max: 10, color: PURPLE   },
    { label: 'LDW (voie)',           val: score?.nbLdw         || 0, max: 10, color: CYAN     },
  ]

  const gridCols = isMobile ? '1fr' : '1fr 1fr'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: '1.25rem', animation: 'slide-up 0.4s ease-out',
      paddingBottom: isMobile ? '5rem' : 0,
      paddingLeft: isMobile ? '2.5rem' : 0,
    }}>
      <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 700, color: TEXT }}>
        Mon Score de Risque
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '1rem' }}>
        <DarkCard title="Score actuel"
          subtitle="Calculé sur 7 jours glissants"
          delay={0} accent={niveauColor}
        >
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', padding: '0.5rem 0',
          }}>
            <ScoreJauge score={scoreVal} niveau={niveau} />
            <div style={{
              display: 'flex', gap: '0.75rem', marginTop: '1rem',
              width: '100%',
            }}>
              {[
                { label: 'Total',  val: score?.nbTotal || 0, color: PURPLE },
                { label: 'Graves',
                  val: Math.round((score?.ratioGraves || 0) * (score?.nbTotal || 0)),
                  color: RED },
              ].map(item => (
                <div key={item.label} style={{
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                  borderRadius: '0.75rem',
                  padding: isMobile ? '0.625rem' : '0.875rem 1.25rem',
                  textAlign: 'center', flex: 1,
                }}>
                  <p style={{
                    fontSize: isMobile ? '1.4rem' : '1.75rem',
                    fontWeight: 800, color: item.color,
                    textShadow: `0 0 16px ${item.color}66`,
                  }}>
                    {item.val}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: MUTED }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </DarkCard>

        <DarkCard title="Détail par catégorie"
          subtitle="Pondération score final"
          delay={80} accent={CYAN}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {details.map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: item.color }}>
                    {item.val}
                  </span>
                </div>
                <div style={{
                  height: 6, background: 'rgba(255,255,255,0.05)',
                  borderRadius: 3, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min((item.val / item.max) * 100, 100)}%`,
                    background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                    borderRadius: 3,
                    boxShadow: `0 0 8px ${item.color}55`,
                    transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </DarkCard>
      </div>

      <DarkCard title="Évolution historique"
        subtitle="Score de risque sur 7 jours"
        delay={160} accent={PURPLE}
      >
        <LineChartScore
          labels={histLabels}
          scores={histScores}
          height={isMobile ? 200 : 280}
        />
      </DarkCard>

      <DarkCard title="Carte des alertes GPS"
        subtitle={`${evenements.filter(e => e.latitude).length} alertes géolocalisées`}
        delay={240} accent={CYAN}
      >
        <div style={{ height: isMobile ? 240 : 320 }}>
          <MapLeaflet evenements={evenements} />
        </div>
      </DarkCard>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// TAB — MESSAGES
// ════════════════════════════════════════════════════════
function MessagesTab({ profil, isMobile }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: '1.25rem', animation: 'slide-up 0.4s ease-out',
      paddingBottom: isMobile ? '5rem' : 0,
      paddingLeft: isMobile ? '2.5rem' : 0,
    }}>
      <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 700, color: TEXT }}>
        Messagerie
      </h2>
      <div style={{
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: '1rem',
        overflow: 'hidden',
        height: isMobile ? 'calc(100vh - 220px)' : 560,
      }}>
        <MessageForm
          destinataireId={profil?.creeParGestionnaire}
          destinataireNom="Mon Gestionnaire"
        />
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// TAB — PROFIL
// ════════════════════════════════════════════════════════
function ProfilTab({ profil, onUpdate, isMobile }) {
  const { user }    = useAuth()
  const [email,     setEmail]     = useState(profil?.email     || '')
  const [telephone, setTelephone] = useState(profil?.telephone || '')
  const [mdp,       setMdp]       = useState('')
  const [mdpConf,   setMdpConf]   = useState('')
  const [saving,    setSaving]    = useState(false)
  const [success,   setSuccess]   = useState('')
  const [erreur,    setErreur]    = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setErreur(''); setSuccess('')
    if (mdp && mdp !== mdpConf) {
      setErreur('Les mots de passe ne correspondent pas')
      return
    }
    if (mdp && mdp.length < 8) {
      setErreur('Mot de passe trop court (min 8 caractères)')
      return
    }
    setSaving(true)
    try {
      const { conducteurAPI } = await import('../api/apiService')
      const data = {}
      if (email)     data.email      = email
      if (telephone) data.telephone  = telephone
      if (mdp)       data.motDePasse = mdp
      await conducteurAPI.modifierProfil(user.id, data)
      setSuccess('Profil mis à jour avec succès !')
      setMdp(''); setMdpConf('')
      onUpdate()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const gridCols = isMobile ? '1fr' : '1fr 1fr'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: '1.25rem', animation: 'slide-up 0.4s ease-out',
      paddingBottom: isMobile ? '5rem' : 0,
      paddingLeft: isMobile ? '2.5rem' : 0,
    }}>
      <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 700, color: TEXT }}>
        Mon Compte
      </h2>

      <DarkCard title="Informations immuables"
        subtitle="Gérées par votre gestionnaire"
        delay={0} accent={MUTED}
      >
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '0.75rem' }}>
          {[
            { label: '🔒 Identifiant',      val: profil?.id },
            { label: '🔒 Nom',              val: profil?.nom },
            { label: '🔒 Prénom',           val: profil?.prenom },
            { label: '🔒 Véhicule assigné', val: profil?.nomVehicule },
          ].map(item => (
            <div key={item.label}>
              <label style={{
                display: 'block', fontSize: '0.7rem',
                color: MUTED, marginBottom: 6, fontWeight: 500,
              }}>
                {item.label}
              </label>
              <div style={{
                padding: '0.6rem 0.875rem',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${BORDER}`,
                borderRadius: '0.5rem',
                fontSize: '0.85rem', color: '#64748B',
              }}>
                {item.val || '—'}
              </div>
            </div>
          ))}
        </div>
      </DarkCard>

      <DarkCard title="Informations modifiables"
        subtitle="Vous pouvez mettre à jour ces champs"
        delay={80} accent={PURPLE}
      >
        <form onSubmit={handleSave}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '0.75rem' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '0.7rem', color: MUTED, marginBottom: 6,
              }}>
                Email
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="exemple@email.com"
              />
            </div>
            <div>
              <label style={{
                display: 'block', fontSize: '0.7rem', color: MUTED, marginBottom: 6,
              }}>
                Téléphone
              </label>
              <input
                type="tel" value={telephone}
                onChange={e => setTelephone(e.target.value)}
                className="input-field"
                placeholder="+216 XX XXX XXX"
              />
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.78rem', color: MUTED, marginBottom: '0.75rem' }}>
              Changer le mot de passe
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '0.75rem' }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '0.7rem', color: MUTED, marginBottom: 6,
                }}>
                  Nouveau mot de passe
                </label>
                <input
                  type="password" value={mdp}
                  onChange={e => setMdp(e.target.value)}
                  className="input-field"
                  placeholder="Min. 8 caractères"
                />
              </div>
              <div>
                <label style={{
                  display: 'block', fontSize: '0.7rem', color: MUTED, marginBottom: 6,
                }}>
                  Confirmer
                </label>
                <input
                  type="password" value={mdpConf}
                  onChange={e => setMdpConf(e.target.value)}
                  className="input-field"
                  placeholder="Répéter"
                />
              </div>
            </div>
          </div>

          {erreur && (
            <div style={{
              padding: '0.75rem', borderRadius: '0.625rem',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#FCA5A5', fontSize: '0.8rem',
              animation: 'fade-in 0.3s ease-out',
            }}>
              {erreur}
            </div>
          )}
          {success && (
            <div style={{
              padding: '0.75rem', borderRadius: '0.625rem',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              color: '#34D399', fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              animation: 'fade-in 0.3s ease-out',
            }}>
              <CheckCircle size={14} /> {success}
            </div>
          )}

          <button
            type="submit" disabled={saving}
            className="btn-primary"
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.5rem',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving && (
              <div style={{
                width: 14, height: 14,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            )}
            {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
          </button>
        </form>
      </DarkCard>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SUB-COMPOSANTS RÉUTILISABLES
// ════════════════════════════════════════════════════════

function DarkCard({
  title, subtitle, children, delay = 0,
  accent = PURPLE, style: extraStyle = {},
  headerRight,
}) {
  return (
    <div style={{
      background: BG_CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: '1rem',
      overflow: 'hidden',
      animation: `slide-up 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      transition: 'border-color 0.3s, box-shadow 0.3s',
      ...extraStyle,
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${accent}33`
        e.currentTarget.style.boxShadow   = `0 8px 32px ${accent}12`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = BORDER
        e.currentTarget.style.boxShadow   = 'none'
      }}
    >
      {title && (
        <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}, ${accent}00)` }} />
      )}
      {title && (
        <div style={{
          padding: '1rem 1.25rem 0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT, marginBottom: 2 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.7rem', color: MUTED }}>{subtitle}</p>
            )}
          </div>
          {headerRight}
        </div>
      )}
      <div style={{ padding: title ? '0 1.25rem 1.25rem' : '1.25rem' }}>
        {children}
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, icon: Icon, color, delay, trend, compact = false }) {
  return (
    <div style={{
      background: BG_CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: '1rem',
      padding: compact ? '0.875rem' : '1.25rem',
      position: 'relative', overflow: 'hidden',
      animation: `slide-up 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      transition: 'all 0.3s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}44`
        e.currentTarget.style.boxShadow   = `0 8px 32px ${color}18`
        e.currentTarget.style.transform   = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = BORDER
        e.currentTarget.style.boxShadow   = 'none'
        e.currentTarget.style.transform   = 'translateY(0)'
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, ${color}00)`,
      }} />
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 70, height: 70,
        background: `radial-gradient(circle, ${color}22, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: compact ? '0.625rem' : '0.875rem',
      }}>
        <div style={{
          width: compact ? 32 : 40, height: compact ? 32 : 40,
          background: `${color}18`, border: `1px solid ${color}30`,
          borderRadius: '0.625rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={compact ? 15 : 18} style={{ color }} />
        </div>
        {trend && !compact && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 600,
            color: trend === 'up' ? RED : GREEN,
            display: 'flex', alignItems: 'center', gap: 2,
            background: trend === 'up'
              ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            padding: '2px 6px', borderRadius: 999,
          }}>
            {trend === 'up'
              ? <ArrowUpRight size={10} />
              : <ArrowDownRight size={10} />}
            Risque
          </span>
        )}
      </div>

      <p style={{
        fontSize: compact ? '1.4rem' : '1.75rem', fontWeight: 800,
        color, marginBottom: 4,
        textShadow: `0 0 20px ${color}44`,
      }}>
        {value}
      </p>
      <p style={{
        fontSize: compact ? '0.65rem' : '0.7rem',
        color: TEXT, fontWeight: 600, marginBottom: 2,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {label}
      </p>
      <p style={{ fontSize: '0.62rem', color: MUTED }}>{sub}</p>
    </div>
  )
}

function LineChartScore({ labels, scores, height = 200 }) {
  if (!labels.length) {
    return (
      <div style={{
        height,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: MUTED, fontSize: '0.8rem',
      }}>
        Aucun historique disponible
      </div>
    )
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Score (%)',
        data: scores,
        fill: true,
        backgroundColor: (ctx) => {
          const chart = ctx.chart
          const { ctx: c, chartArea } = chart
          if (!chartArea) return 'transparent'
          const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          grad.addColorStop(0, 'rgba(168,85,247,0.3)')
          grad.addColorStop(0.6, 'rgba(168,85,247,0.05)')
          grad.addColorStop(1, 'rgba(168,85,247,0)')
          return grad
        },
        borderColor: PURPLE,
        borderWidth: 2.5,
        pointBackgroundColor: scores.map(s =>
          s < 25 ? GREEN : s < 50 ? '#EAB308' : s < 75 ? ORANGE : RED
        ),
        pointBorderColor: BG_CARD,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.45,
      },
      {
        label: 'Limite modéré',
        data: labels.map(() => 25),
        borderColor: `${GREEN}44`,
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Limite critique',
        data: labels.map(() => 75),
        borderColor: `${RED}44`,
        borderWidth: 1,
        borderDash: [4, 4],
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18,18,31,0.98)',
        borderColor: `${PURPLE}44`, borderWidth: 1,
        titleColor: MUTED, bodyColor: TEXT, padding: 12,
        callbacks: { label: ctx => ` ${ctx.raw}%` },
      },
    },
    scales: {
      y: {
        min: 0, max: 100,
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { callback: v => `${v}%`, color: MUTED, font: { size: 10 } },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: MUTED, font: { size: 10 } },
        border: { display: false },
      },
    },
  }

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  )
}

function DoughnutChart({ data, compact = false }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)

  const chartData = {
    labels: ['Fatigue', 'Téléphone', 'Ceinture', 'Distraction', 'Autre'],
    datasets: [{
      data: Object.values(data),
      backgroundColor: [
        `${RED}CC`, `${PINK}CC`, `${ORANGE}CC`, '#EAB308CC', `${CYAN}CC`,
      ],
      borderColor: BG_CARD,
      borderWidth: 3,
      hoverBorderColor: BG_CARD2,
      hoverOffset: 6,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: MUTED, font: { size: 9 }, boxWidth: 8, padding: 6 },
      },
      tooltip: {
        backgroundColor: 'rgba(18,18,31,0.98)',
        borderColor: `${CYAN}44`, borderWidth: 1,
        titleColor: MUTED, bodyColor: TEXT,
        callbacks: {
          label: ctx =>
            ` ${ctx.label}: ${ctx.raw} (${
              total > 0 ? ((ctx.raw / total) * 100).toFixed(0) : 0
            }%)`,
        },
      },
    },
  }

  const h = compact ? 160 : 180

  return (
    <div style={{ height: h, position: 'relative' }}>
      {total === 0 ? (
        <div style={{
          height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: MUTED, fontSize: '0.8rem',
        }}>
          Aucune donnée
        </div>
      ) : (
        <>
          <Doughnut data={chartData} options={options} />
          <div style={{
            position: 'absolute', top: '35%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <p style={{
              fontSize: '1.4rem', fontWeight: 800, color: CYAN,
              textShadow: `0 0 16px ${CYAN}66`,
            }}>
              {total}
            </p>
            <p style={{ fontSize: '0.6rem', color: MUTED }}>Total</p>
          </div>
        </>
      )}
    </div>
  )
}

function BarChartJour({ labels, data, height = 180 }) {
  const chartData = {
    labels,
    datasets: [{
      label: 'Alertes',
      data,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return `${CYAN}88`
        const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        grad.addColorStop(0, `${CYAN}CC`)
        grad.addColorStop(1, `${BLUE}44`)
        return grad
      },
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: `${PURPLE}CC`,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18,18,31,0.98)',
        borderColor: `${CYAN}44`, borderWidth: 1,
        titleColor: MUTED, bodyColor: TEXT,
        callbacks: {
          label: ctx => ` ${ctx.raw} alerte${ctx.raw > 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { color: MUTED, font: { size: 10 }, stepSize: 1 },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: MUTED, font: { size: 10 } },
        border: { display: false },
      },
    },
  }

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

function DmsVsAdas({ dms, adas, compact = false }) {
  const total   = dms + adas || 1
  const dmsPct  = Math.round((dms  / total) * 100)
  const adasPct = Math.round((adas / total) * 100)

  const chartData = {
    labels: ['DMS', 'ADAS'],
    datasets: [{
      data: [dms || 0, adas || 0],
      backgroundColor: [`${BLUE}CC`, `${PINK}CC`],
      borderColor: BG_CARD,
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18,18,31,0.98)',
        borderColor: `${PINK}44`, borderWidth: 1,
        titleColor: MUTED, bodyColor: TEXT,
      },
    },
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: compact ? 'row' : 'column',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <div style={{
        height: compact ? 100 : 130,
        width: compact ? 100 : '100%',
        flexShrink: 0,
        position: 'relative',
      }}>
        <Doughnut data={chartData} options={options} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <p style={{
            fontSize: compact ? '0.9rem' : '1.1rem',
            fontWeight: 800, color: PINK,
            textShadow: `0 0 12px ${PINK}66`,
          }}>
            {dms + adas}
          </p>
          <p style={{ fontSize: '0.55rem', color: MUTED }}>Total</p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: compact ? 'column' : 'row',
        gap: compact ? '0.5rem' : '1rem',
        width: compact ? 'auto' : '100%',
        justifyContent: 'center',
      }}>
        {[
          { label: 'DMS',  val: dms,  pct: dmsPct,  color: BLUE },
          { label: 'ADAS', val: adas, pct: adasPct, color: PINK },
        ].map(item => (
          <div key={item.label} style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: item.color, boxShadow: `0 0 6px ${item.color}`,
              }} />
              <span style={{ fontSize: '0.7rem', color: MUTED }}>{item.label}</span>
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: item.color }}>
              {item.val}
            </p>
            <p style={{ fontSize: '0.65rem', color: MUTED }}>{item.pct}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EventsList({ evenements, compact = true }) {
  if (!evenements.length) {
    return (
      <EmptyState
        icon={AlertTriangle}
        message="Aucun événement détecté"
        sub="Les événements DMS/ADAS apparaîtront ici automatiquement"
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {evenements.map((evt, i) => {
        const cfg  = TYPE_CFG[evt.typeEvenement]
          || { icon: AlertTriangle, label: evt.typeEvenement, color: MUTED }
        const Icon = cfg.icon
        const sevColor = {
          CRITIQUE: RED, ELEVE: ORANGE,
          MODERE: '#EAB308', FAIBLE: GREEN,
        }[evt.severite] || MUTED

        return (
          <div key={evt.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.625rem 0.75rem',
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${BORDER}`,
            borderRadius: '0.625rem',
            transition: 'all 0.2s',
            animation: `fade-in 0.3s ease-out ${i * 40}ms both`,
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = `${cfg.color}33`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              e.currentTarget.style.borderColor = BORDER
            }}
          >
            <div style={{
              width: 34, height: 34, flexShrink: 0,
              background: `${cfg.color}18`,
              border: `1px solid ${cfg.color}30`,
              borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={15} style={{ color: cfg.color }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '0.375rem', marginBottom: 2, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: TEXT }}>
                  {cfg.label}
                </span>
                <span style={{
                  fontSize: '0.6rem', fontWeight: 600, color: sevColor,
                  background: `${sevColor}18`, border: `1px solid ${sevColor}30`,
                  padding: '1px 6px', borderRadius: 999,
                }}>
                  {evt.severite}
                </span>
                <span style={{
                  fontSize: '0.6rem',
                  color: evt.categorie === 'ADAS' ? PURPLE : CYAN,
                  background: evt.categorie === 'ADAS'
                    ? `${PURPLE}18` : `${CYAN}18`,
                  padding: '1px 6px', borderRadius: 999,
                }}>
                  {evt.categorie}
                </span>
              </div>
              {!compact && (
                <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                  <InfoChip icon={Clock} color={MUTED}
                    val={new Date(evt.dateHeure).toLocaleString('fr-FR', {
                      day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  />
                  {evt.dureeSecondes > 0 && (
                    <InfoChip icon={Clock} color={MUTED}
                      val={`${Number(evt.dureeSecondes).toFixed(1)}s`}
                    />
                  )}
                </div>
              )}
            </div>

            {compact && (
              <span style={{ fontSize: '0.6rem', color: MUTED, flexShrink: 0 }}>
                {new Date(evt.dateHeure).toLocaleString('fr-FR', {
                  day: '2-digit', month: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function NotifRow({ notif, delay, onMarquer }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      padding: '0.75rem',
      background: notif.lue ? 'transparent' : 'rgba(168,85,247,0.04)',
      border: `1px solid ${notif.lue ? BORDER : `${PURPLE}22`}`,
      borderRadius: '0.625rem',
      opacity: notif.lue ? 0.6 : 1,
      transition: 'all 0.2s',
      animation: `fade-in 0.3s ease-out ${delay}ms both`,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: notif.lue ? MUTED : PURPLE,
        flexShrink: 0, marginTop: 6,
        boxShadow: notif.lue ? 'none' : `0 0 8px ${PURPLE}66`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.82rem', fontWeight: 600,
          color: notif.lue ? MUTED : TEXT, marginBottom: 2,
        }}>
          {notif.titre}
        </p>
        {notif.corps && (
          <p style={{ fontSize: '0.72rem', color: MUTED, marginBottom: 4 }}>
            {notif.corps}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', color: MUTED }}>
            {new Date(notif.dateEnvoi).toLocaleString('fr-FR', {
              day: '2-digit', month: '2-digit',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>

        </div>
      </div>
      {!notif.lue && (
        <button
          onClick={() => onMarquer(notif.id)}
          style={{
            fontSize: '0.65rem', color: PURPLE,
            background: `${PURPLE}18`, border: `1px solid ${PURPLE}30`,
            borderRadius: 999, padding: '3px 8px',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = `${PURPLE}30` }}
          onMouseLeave={e => { e.currentTarget.style.background = `${PURPLE}18` }}
        >
          ✓ Lue
        </button>
      )}
    </div>
  )
}

function InfoChip({ icon: Icon, val, color }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.65rem', color }}>
      <Icon size={10} />
      {val}
    </span>
  )
}

function EmptyState({ icon: Icon, message, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: MUTED }}>
      <div style={{
        width: 56, height: 56, margin: '0 auto 1rem',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${BORDER}`,
        borderRadius: '1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={24} style={{ opacity: 0.3 }} />
      </div>
      <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 4 }}>{message}</p>
      {sub && <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{sub}</p>}
    </div>
  )
}