/**
 * DashboardAdministrateur — Dark Dashboard Style Professionnel
 * Sidebar + Stats + CRUD Gestionnaires + Animations néon + RESPONSIVE
 */
import React, { useState, useEffect, useCallback } from 'react'
import {
  Users, Shield, Plus, Edit, Trash2,
  CheckCircle, X, RefreshCw, AlertCircle,
  LayoutDashboard, Mail, Phone, Calendar,
  TrendingUp, Activity, Zap, Star,
  ChevronRight, Search, Crown, Settings,
  BarChart2, Lock, Eye, EyeOff,
  ArrowUpRight, Bell, Globe, Menu
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
  PointElement, LineElement
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { useAuth }    from '../hooks/useAuth'
import NavBar         from '../components/common/NavBar'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { adminAPI }   from '../api/apiService'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
  PointElement, LineElement
)

// ── Palette ───────────────────────────────────────────────
const BG      = '#0D0D1A'
const BG_CARD = '#12121F'
const BG_CARD2= '#1A1A2E'
const BORDER  = 'rgba(255,255,255,0.06)'
const PURPLE  = '#A855F7'
const PINK    = '#EC4899'
const CYAN    = '#06B6D4'
const BLUE    = '#3B82F6'
const GREEN   = '#10B981'
const ORANGE  = '#F97316'
const RED     = '#EF4444'
const YELLOW  = '#EAB308'
const TEXT    = '#F1F5F9'
const MUTED   = '#475569'
const VIOLET  = '#8B5CF6'

// ── Breakpoints ───────────────────────────────────────────
const BP = { sm: 640, md: 768, lg: 1024 }

// ── Hook responsive ───────────────────────────────────────
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  })
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth })
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return size
}

// ════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════
export default function DashboardAdministrateur() {
  const { user } = useAuth()
  const { width } = useWindowSize()
  const isMobile  = width < BP.md
  const isTablet  = width >= BP.md && width < BP.lg
  const isNarrow  = isMobile || isTablet

  const [activeTab,     setActiveTab]     = useState('dashboard')
  const [gestionnaires, setGestionnaires] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [showForm,      setShowForm]      = useState(false)
  const [editGest,      setEditGest]      = useState(null)
  const [erreurForm,    setErreurForm]    = useState('')
  const [successMsg,    setSuccessMsg]    = useState('')
  const [selectedGest,  setSelectedGest]  = useState(null)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)

  const charger = useCallback(async () => {
    try {
      const r = await adminAPI.getGestionnaires()
      setGestionnaires(r.data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    charger()
    const iv = setInterval(charger, 30000)
    return () => clearInterval(iv)
  }, [charger])

  // Fermer sidebar sur changement d'onglet
  useEffect(() => {
    if (isNarrow) setSidebarOpen(false)
  }, [activeTab, isNarrow])

  const handleSave = async (formData) => {
    setErreurForm('')
    try {
      if (editGest) {
        await adminAPI.modifierGestionnaire(editGest.id, formData)
        setSuccessMsg(`Gestionnaire ${editGest.id} modifié avec succès`)
      } else {
        await adminAPI.creerGestionnaire(formData)
        setSuccessMsg(`Gestionnaire ${formData.id} créé avec succès`)
      }
      setShowForm(false); setEditGest(null)
      charger()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setErreurForm(
        err.response?.data?.erreur
        || JSON.stringify(err.response?.data?.details || 'Erreur')
      )
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(`Supprimer définitivement le gestionnaire ${id} ?`)) return
    try {
      await adminAPI.supprimerGestionnaire(id)
      setSuccessMsg(`Gestionnaire ${id} supprimé définitivement`)
      if (selectedGest?.id === id) setSelectedGest(null)
      charger()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      alert(err.response?.data?.erreur || 'Erreur')
    }
  }

  const sideItems = [
    { id: 'dashboard',     label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'gestionnaires', label: 'Gestionnaires',   icon: Users,
      badge: gestionnaires.length },
    { id: 'profil',        label: 'Mon Compte',      icon: Shield },
  ]

  if (loading) return <LoadingSpinner full />

  return (
    <div style={{ minHeight: '100vh', background: BG }}>
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Bouton hamburger (mobile + tablette) ── */}
      {isNarrow && (
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            position: 'fixed',
            top: 18, left: 16,
            zIndex: 60,
            width: 38, height: 38,
            background: BG_CARD2,
            border: `1px solid ${BORDER}`,
            borderRadius: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: TEXT,
            boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
          }}
        >
          {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      )}

      {/* ── Overlay sidebar ── */}
      {isNarrow && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 35,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            animation: 'fade-in 0.2s ease-out',
          }}
        />
      )}

      {/* ── Sidebar drawer (mobile/tablette) ── */}
      {isNarrow && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: 268, zIndex: 40,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          background: BG,
          borderRight: `1px solid ${BORDER}`,
          padding: '72px 0.75rem 5rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
          overflowY: 'auto',
        }}>
          <AdminSidebar
            items={sideItems}
            active={activeTab}
            onSelect={setActiveTab}
            user={user}
            nbGestionnaires={gestionnaires.length}
          />
        </div>
      )}

      {/* ── Barre navigation bas (mobile uniquement) ── */}
      {isMobile && (
        <MobileBottomBar
          items={sideItems}
          active={activeTab}
          onSelect={setActiveTab}
        />
      )}

      {/* ── Layout principal ── */}
      <div style={{
        display: 'flex',
        maxWidth: 1400, margin: '0 auto',
        padding: isMobile
          ? '70px 0.75rem 5.5rem'
          : isTablet
            ? '80px 1rem 2rem'
            : '80px 1.5rem 2rem',
        gap: '1.5rem',
      }}>

        {/* Sidebar desktop uniquement */}
        {!isNarrow && (
          <AdminSidebar
            items={sideItems}
            active={activeTab}
            onSelect={setActiveTab}
            user={user}
            nbGestionnaires={gestionnaires.length}
          />
        )}

        {/* ══ CONTENU ══ */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {successMsg && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.25rem', marginBottom: '1rem',
              background: `${GREEN}12`,
              border: `1px solid ${GREEN}30`,
              borderRadius: '0.75rem',
              color: '#34D399', fontSize: '0.82rem',
              animation: 'fade-in 0.3s ease-out',
            }}>
              <CheckCircle size={15} /> {successMsg}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardTab
              gestionnaires={gestionnaires}
              user={user}
              onRefresh={charger}
              onNavigate={setActiveTab}
              onNew={() => {
                setEditGest(null)
                setErreurForm('')
                setShowForm(true)
              }}
              onSelect={setSelectedGest}
              selected={selectedGest}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          )}

          {activeTab === 'gestionnaires' && (
            <GestionnairesTab
              gestionnaires={gestionnaires}
              successMsg={successMsg}
              onNew={() => {
                setEditGest(null)
                setErreurForm('')
                setShowForm(true)
              }}
              onEdit={(g) => {
                setEditGest(g)
                setErreurForm('')
                setShowForm(true)
              }}
              onDelete={handleDelete}
              onSelect={setSelectedGest}
              selected={selectedGest}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          )}

          {activeTab === 'profil' && (
            <ProfilAdminTab
              user={user}
              nbGestionnaires={gestionnaires.length}
              isMobile={isMobile}
            />
          )}
        </main>
      </div>

      {/* Formulaire gestionnaire */}
      {showForm && (
        <FormulaireGestionnaire
          gestionnaire={editGest}
          erreur={erreurForm}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditGest(null)
            setErreurForm('')
          }}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// BARRE NAVIGATION BAS — MOBILE
// ════════════════════════════════════════════════════════
function MobileBottomBar({ items, active, onSelect }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 50,
      background: BG_CARD2,
      borderTop: `1px solid ${BORDER}`,
      display: 'flex',
      padding: '0.4rem 0.25rem',
      paddingBottom: 'max(0.4rem, env(safe-area-inset-bottom))',
      backdropFilter: 'blur(12px)',
    }}>
      {items.map(item => {
        const Icon     = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.2rem',
              padding: '0.35rem 0.2rem',
              border: 'none', background: 'transparent',
              cursor: 'pointer', position: 'relative',
            }}
          >
            <div style={{
              width: 34, height: 34,
              borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? `${VIOLET}20` : 'transparent',
              transition: 'all 0.2s', position: 'relative',
            }}>
              <Icon size={17} style={{ color: isActive ? VIOLET : MUTED }} />
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: VIOLET, color: '#fff',
                  fontSize: '0.5rem', fontWeight: 700,
                  borderRadius: 999, minWidth: 14, height: 14,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 2px',
                }}>
                  {item.badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '0.5rem', fontWeight: 600,
              color: isActive ? VIOLET : MUTED,
              transition: 'color 0.2s', whiteSpace: 'nowrap',
            }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// SIDEBAR ADMIN
// ════════════════════════════════════════════════════════
function AdminSidebar({ items, active, onSelect, user, nbGestionnaires }) {
  return (
    <aside style={{
      width: 240, flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
    }}>
      {/* Admin card */}
      <div style={{
        background: BG_CARD2,
        border: `1px solid ${BORDER}`,
        borderRadius: '1rem',
        padding: '1.25rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 100, height: 100,
          background: `radial-gradient(circle, ${VIOLET}33, transparent 70%)`,
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -20, left: -20,
          width: 80, height: 80,
          background: `radial-gradient(circle, ${PINK}22, transparent 70%)`,
          borderRadius: '50%',
        }} />

        <div style={{
          width: 52, height: 52,
          background: `linear-gradient(135deg, ${VIOLET}, ${PINK})`,
          borderRadius: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '0.875rem',
          boxShadow: `0 0 24px ${VIOLET}55`,
          position: 'relative',
        }}>
          <Crown size={24} style={{ color: '#fff' }} />
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16,
            background: YELLOW, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${BG_CARD2}`,
          }}>
            <Star size={8} style={{ color: '#fff' }} />
          </div>
        </div>

        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: TEXT, marginBottom: 2 }}>
          Administrateur
        </p>
        <p style={{ fontSize: '0.7rem', color: MUTED, marginBottom: '0.875rem' }}>
          {user?.id} · Accès total
        </p>

        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: '0.62rem', fontWeight: 700,
          background: `linear-gradient(135deg, ${VIOLET}22, ${PINK}11)`,
          border: `1px solid ${VIOLET}44`,
          color: VIOLET, padding: '3px 10px', borderRadius: 999,
        }}>
          <Zap size={9} /> SUPER ADMIN
        </span>

        <div style={{
          marginTop: '0.875rem', padding: '0.625rem',
          background: `${VIOLET}10`,
          border: `1px solid ${VIOLET}20`,
          borderRadius: '0.625rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: VIOLET }}>
              {nbGestionnaires}
            </p>
            <p style={{ fontSize: '0.6rem', color: MUTED }}>Gestionnaires</p>
          </div>
          <Users size={18} style={{ color: VIOLET, opacity: 0.6 }} />
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: '1rem',
        padding: '0.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.2rem',
      }}>
        {items.map((item, i) => {
          const Icon     = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '0.625rem', border: 'none',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                background: isActive
                  ? `linear-gradient(135deg, ${VIOLET}20, ${PINK}10)`
                  : 'transparent',
                color: isActive ? TEXT : MUTED,
                borderLeft: isActive
                  ? `2px solid ${VIOLET}` : '2px solid transparent',
                transition: 'all 0.2s', textAlign: 'left', width: '100%',
                animation: `slide-up 0.4s ease-out ${i * 60}ms both`,
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
              <Icon size={16} style={{ color: isActive ? VIOLET : 'inherit', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && (
                <span style={{
                  background: `${VIOLET}22`,
                  border: `1px solid ${VIOLET}33`,
                  color: VIOLET,
                  fontSize: '0.6rem', fontWeight: 700,
                  borderRadius: 999, minWidth: 20, height: 20,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 5px',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Hiérarchie système */}
      <div style={{
        background: BG_CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: '1rem',
        padding: '1rem',
      }}>
        <p style={{
          fontSize: '0.62rem', color: MUTED,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          fontWeight: 600, marginBottom: '0.75rem',
        }}>
          Hiérarchie système
        </p>
        {[
          { label: 'Admin',        icon: Crown,  color: VIOLET },
          { label: 'Gestionnaire', icon: Users,  color: GREEN  },
          { label: 'Conducteur',   icon: Shield, color: CYAN   },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: i < 2 ? '0.4rem' : 0,
            }}>
              <div style={{
                width: 24, height: 24,
                background: `${item.color}18`,
                border: `1px solid ${item.color}22`,
                borderRadius: '0.375rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={11} style={{ color: item.color }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: MUTED }}>
                {item.label}
              </span>
              {i < 2 && (
                <ChevronRight size={10} style={{
                  color: MUTED, marginLeft: 'auto', opacity: 0.4,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

// ════════════════════════════════════════════════════════
// TAB — DASHBOARD
// ════════════════════════════════════════════════════════
function DashboardTab({
  gestionnaires, user, onRefresh,
  onNavigate, onNew, onSelect, selected,
  isMobile, isTablet,
}) {
  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun']
  const gestParMois = mois.map((_, i) =>
    Math.max(0, gestionnaires.length - (5 - i))
  )
  const avecEmail = gestionnaires.filter(g => g.email).length
  const sansEmail = gestionnaires.length - avecEmail
  const avecTel   = gestionnaires.filter(g => g.telephone).length

  const kpiCols   = isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'
  const chartCols = isMobile ? '1fr' : '1fr 1fr'
  const listCols  = selected && !isMobile ? '1fr 320px' : '1fr'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* En-tête */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '0.75rem' : 0,
        animation: 'fade-in 0.4s ease-out',
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '1.15rem' : '1.5rem',
            fontWeight: 800, color: TEXT, marginBottom: 4,
          }}>
            Administration{' '}
            <span style={{
              background: `linear-gradient(135deg, ${VIOLET}, ${PINK})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Système ⚡
            </span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: MUTED }}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric',
              month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <div style={{
          display: 'flex', gap: '0.5rem',
          width: isMobile ? '100%' : 'auto',
        }}>
          <button
            onClick={onRefresh}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.4rem',
              padding: '0.5rem 0.875rem',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${BORDER}`,
              borderRadius: '0.625rem',
              color: MUTED, fontSize: '0.75rem', cursor: 'pointer',
              flex: isMobile ? 1 : 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = VIOLET
              e.currentTarget.style.borderColor = `${VIOLET}44`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = MUTED
              e.currentTarget.style.borderColor = BORDER
            }}
          >
            <RefreshCw size={13} />
            {!isMobile && ' Actualiser'}
          </button>
          <button
            onClick={onNew}
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.4rem',
              padding: '0.5rem 0.875rem',
              background: `linear-gradient(135deg, ${VIOLET}, ${PINK})`,
              border: 'none', borderRadius: '0.625rem',
              color: '#fff', fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer',
              boxShadow: `0 4px 15px ${VIOLET}33`,
              flex: isMobile ? 1 : 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = `0 6px 25px ${VIOLET}55`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 4px 15px ${VIOLET}33`
            }}
          >
            <Plus size={14} />
            {isMobile ? ' Nouveau' : ' Nouveau gestionnaire'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: kpiCols,
        gap: isMobile ? '0.625rem' : '1rem',
      }}>
        {[
          {
            label: isMobile ? 'Gestionnaires' : 'Gestionnaires actifs',
            value: gestionnaires.length,
            sub: 'dans le système',
            icon: Users, color: VIOLET, delay: 0,
            trend: '+1 ce mois',
          },
          {
            label: 'Rôle',
            value: 'ADMIN',
            sub: 'Accès total système',
            icon: Crown, color: YELLOW, delay: 80,
          },
          {
            label: 'Avec email',
            value: avecEmail,
            sub: `${sansEmail} sans email`,
            icon: Mail, color: CYAN, delay: 160,
          },
          {
            label: isMobile ? 'Avec tél.' : 'Avec téléphone',
            value: avecTel,
            sub: 'contacts renseignés',
            icon: Phone, color: GREEN, delay: 240,
          },
        ].map((kpi, i) => (
          <KpiCard key={i} {...kpi} compact={isMobile} />
        ))}
      </div>

      {/* Ligne 2 : Règles + Bar chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: chartCols,
        gap: '1rem',
      }}>
        {/* Règles métier */}
        <DarkCard
          title="Règles métier — Hiérarchie stricte"
          subtitle="Contrôle d'accès système"
          delay={0} accent={VIOLET}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              {
                icon: Crown, color: VIOLET,
                text: "L'admin crée tous les gestionnaires (G1, G2…)",
              },
              {
                icon: Users, color: GREEN,
                text: 'Les gestionnaires créent leurs conducteurs (Cxx)',
              },
              {
                icon: Lock, color: PINK,
                text: 'Pas d\'inscription publique — accès contrôlé',
              },
              {
                icon: Shield, color: CYAN,
                text: 'Champs immuables : id, nom_gestionnaire, mot_de_passe',
              },
              {
                icon: AlertCircle, color: ORANGE,
                text: 'G1 protégé contre la suppression (compte de test)',
              },
              {
                icon: Activity, color: BLUE,
                text: 'DELETE physique — suppression définitive (sauf G1 protégé)',
              },
            ].map((rule, i) => {
              const Icon = rule.icon
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start',
                  gap: '0.5rem', padding: '0.5rem 0.625rem',
                  background: `${rule.color}08`,
                  border: `1px solid ${rule.color}15`,
                  borderRadius: '0.5rem',
                  animation: `fade-in 0.4s ease-out ${i * 60}ms both`,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${rule.color}15`
                    e.currentTarget.style.borderColor = `${rule.color}30`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = `${rule.color}08`
                    e.currentTarget.style.borderColor = `${rule.color}15`
                  }}
                >
                  <div style={{
                    width: 24, height: 24, flexShrink: 0,
                    background: `${rule.color}18`,
                    border: `1px solid ${rule.color}25`,
                    borderRadius: '0.375rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={11} style={{ color: rule.color }} />
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94A3B8', lineHeight: 1.5 }}>
                    {rule.text}
                  </p>
                </div>
              )
            })}
          </div>
        </DarkCard>

        {/* Bar chart */}
        <DarkCard
          title="Évolution des gestionnaires"
          subtitle="6 derniers mois"
          delay={80} accent={PINK}
        >
          <BarChartGest labels={mois} data={gestParMois} />
          <div style={{
            marginTop: '1rem', paddingTop: '1rem',
            borderTop: `1px solid ${BORDER}`,
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.5rem',
          }}>
            {[
              { label: 'Total',      val: gestionnaires.length, color: VIOLET },
              { label: 'Avec email', val: avecEmail,            color: CYAN   },
              { label: 'Avec tél.',  val: avecTel,              color: GREEN  },
            ].map(item => (
              <div key={item.label} style={{
                textAlign: 'center',
                background: `${item.color}10`,
                border: `1px solid ${item.color}20`,
                borderRadius: '0.625rem', padding: '0.5rem',
              }}>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: item.color }}>
                  {item.val}
                </p>
                <p style={{ fontSize: '0.6rem', color: MUTED }}>{item.label}</p>
              </div>
            ))}
          </div>
        </DarkCard>
      </div>

      {/* Ligne 3 : Liste + Détail */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: listCols,
        gap: '1rem',
        transition: 'grid-template-columns 0.4s ease',
      }}>
        <DarkCard
          title="Gestionnaires actifs"
          subtitle={`${gestionnaires.length} gestionnaires enregistrés`}
          delay={0} accent={VIOLET}
          headerRight={
            <button
              onClick={() => onNavigate('gestionnaires')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '0.72rem', color: VIOLET,
                background: `${VIOLET}12`,
                border: `1px solid ${VIOLET}25`,
                padding: '4px 10px', borderRadius: 999,
                cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${VIOLET}22`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `${VIOLET}12`
              }}
            >
              {!isMobile && 'Gérer tout'} <ChevronRight size={11} />
            </button>
          }
        >
          <GestListDashboard
            gestionnaires={gestionnaires}
            selected={selected}
            onSelect={onSelect}
          />
        </DarkCard>

        {/* Mini détail — desktop/tablette */}
        {selected && !isMobile && (
          <MiniDetailGest
            gestionnaire={selected}
            onClose={() => onSelect(null)}
          />
        )}
      </div>

      {/* Bottom sheet détail — mobile */}
      {selected && isMobile && (
        <MiniDetailSheet
          gestionnaire={selected}
          onClose={() => onSelect(null)}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════
// MINI DETAIL SHEET — MOBILE
// ════════════════════════════════════════════════════════
function MiniDetailSheet({ gestionnaire: g, onClose }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 45,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div style={{
        position: 'fixed',
        bottom: 64, left: 0, right: 0,
        zIndex: 46,
        background: BG_CARD,
        borderTop: `2px solid ${VIOLET}`,
        borderRadius: '1.25rem 1.25rem 0 0',
        padding: '1rem 1rem 1.5rem',
        maxHeight: '65vh',
        overflowY: 'auto',
        animation: 'slide-up 0.35s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: `0 -8px 40px rgba(0,0,0,0.5)`,
      }}>
        {/* Poignée */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.15)',
          margin: '0 auto 0.875rem',
        }} />

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 40, height: 40,
              background: `${VIOLET}22`, border: `1px solid ${VIOLET}33`,
              borderRadius: '0.625rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 700, color: VIOLET,
            }}>
              {g.id}
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT }}>
                {g.nomGestionnaire}
              </p>
              <p style={{ fontSize: '0.65rem', color: MUTED }}>
                Gestionnaire de flotte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${BORDER}`, borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: MUTED,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Statut */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px',
            background: `${GREEN}12`, border: `1px solid ${GREEN}25`,
            borderRadius: 999,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: GREEN, boxShadow: `0 0 6px ${GREEN}`,
            }} />
            <span style={{ fontSize: '0.72rem', color: GREEN, fontWeight: 600 }}>
              Compte actif
            </span>
          </div>
        </div>

        {/* Infos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { icon: Mail,     label: 'Email',     val: g.email || '—',     color: g.email ? CYAN : MUTED },
            { icon: Phone,    label: 'Téléphone', val: g.telephone || '—', color: g.telephone ? GREEN : MUTED },
            { icon: Calendar, label: 'Créé le',
              val: new Date(g.dateCreation).toLocaleDateString('fr-FR'), color: MUTED },
          ].map((info, i) => {
            const Icon = info.icon
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${BORDER}`,
                borderRadius: '0.5rem',
              }}>
                <Icon size={13} style={{ color: info.color, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: '0.6rem', color: MUTED }}>{info.label}</p>
                  <p style={{ fontSize: '0.8rem', color: info.color, fontWeight: 600 }}>
                    {info.val}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ════════════════════════════════════════════════════════
// TAB — GESTIONNAIRES (CRUD COMPLET)
// ════════════════════════════════════════════════════════
function GestionnairesTab({
  gestionnaires, successMsg,
  onNew, onEdit, onDelete, onSelect, selected,
  isMobile, isTablet,
}) {
  const [search, setSearch] = useState('')

  const filtered = gestionnaires.filter(g =>
    `${g.nomGestionnaire} ${g.id} ${g.email || ''}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const gridCols = isMobile
    ? '1fr'
    : isTablet
      ? 'repeat(2, 1fr)'
      : 'repeat(auto-fill, minmax(340px, 1fr))'

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
      animation: 'slide-up 0.4s ease-out',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '0.75rem' : 0,
      }}>
        <div>
          <h2 style={{
            fontSize: isMobile ? '1.1rem' : '1.25rem',
            fontWeight: 700, color: TEXT,
          }}>
            Gestion des gestionnaires de flotte
          </h2>
          <p style={{ fontSize: '0.75rem', color: MUTED, marginTop: 2 }}>
            {gestionnaires.length} gestionnaire{gestionnaires.length > 1 ? 's' : ''} enregistré{gestionnaires.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onNew}
          style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '0.4rem',
            padding: '0.625rem 1.25rem',
            background: `linear-gradient(135deg, ${VIOLET}, ${PINK})`,
            border: 'none', borderRadius: '0.75rem',
            color: '#fff', fontSize: '0.82rem', fontWeight: 600,
            cursor: 'pointer',
            boxShadow: `0 4px 15px ${VIOLET}33`,
            transition: 'all 0.2s',
            width: isMobile ? '100%' : 'auto',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = `0 6px 25px ${VIOLET}55`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = `0 4px 15px ${VIOLET}33`
          }}
        >
          <Plus size={15} /> Nouveau gestionnaire
        </button>
      </div>

      {/* Info règle */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: `${BLUE}10`,
        border: `1px solid ${BLUE}22`,
        borderRadius: '0.75rem',
        animation: 'fade-in 0.4s ease-out',
      }}>
        <AlertCircle size={16} style={{ color: BLUE, flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#93C5FD' }}>
            Règle de création obligatoire
          </p>
          <p style={{ fontSize: '0.72rem', color: MUTED, marginTop: 2 }}>
            Tous les gestionnaires doivent être créés par l'administrateur (id=00000000).
            G1 est le compte de test protégé.
          </p>
        </div>
      </div>

      {/* Recherche */}
      <div style={{
        position: 'relative',
        maxWidth: isMobile ? '100%' : 320,
      }}>
        <Search size={14} style={{
          position: 'absolute', left: 12,
          top: '50%', transform: 'translateY(-50%)', color: MUTED,
        }} />
        <input
          type="text"
          placeholder="Rechercher un gestionnaire…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.575rem 0.875rem 0.575rem 2.25rem',
            background: BG_CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: '0.625rem',
            fontSize: '0.82rem', color: TEXT, outline: 'none',
            transition: 'all 0.2s', boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.target.style.borderColor = `${VIOLET}55`
            e.target.style.boxShadow = `0 0 0 3px ${VIOLET}12`
          }}
          onBlur={e => {
            e.target.style.borderColor = BORDER
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Grille gestionnaires */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: '1rem',
      }}>
        {filtered.map((g, i) => (
          <GestCard
            key={g.id}
            gestionnaire={g}
            index={i}
            isSelected={selected?.id === g.id}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            isMobile={isMobile}
          />
        ))}

        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1/-1',
            textAlign: 'center', padding: '3rem',
            color: MUTED,
          }}>
            <Users size={40} style={{ opacity: 0.15, margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.875rem' }}>
              {search ? 'Aucun gestionnaire trouvé' : 'Aucun gestionnaire enregistré'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── GestCard ──────────────────────────────────────────────
function GestCard({ gestionnaire: g, index, isSelected, onSelect, onEdit, onDelete, isMobile }) {
  const isTest = g.id === 'G1'

  return (
    <div
      onClick={() => onSelect(isSelected ? null : g)}
      style={{
        background: BG_CARD,
        border: `1px solid ${isSelected ? `${VIOLET}44` : BORDER}`,
        borderRadius: '1rem',
        overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.3s',
        animation: `slide-up 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 60}ms both`,
        boxShadow: isSelected ? `0 8px 32px ${VIOLET}15` : 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${VIOLET}44`
        e.currentTarget.style.boxShadow = `0 8px 32px ${VIOLET}12`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = isSelected ? `${VIOLET}44` : BORDER
        e.currentTarget.style.boxShadow = isSelected ? `0 8px 32px ${VIOLET}15` : 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, ${VIOLET}, ${PINK}00)`,
      }} />

      <div style={{ padding: isMobile ? '1rem' : '1.25rem' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: '0.875rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 44, height: 44, flexShrink: 0,
              background: `linear-gradient(135deg, ${VIOLET}44, ${PINK}22)`,
              border: `1px solid ${VIOLET}33`,
              borderRadius: '0.875rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: VIOLET,
              boxShadow: isSelected ? `0 0 16px ${VIOLET}44` : 'none',
            }}>
              {g.id}
            </div>

            <div>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '0.4rem', marginBottom: 4,
                flexWrap: 'wrap',
              }}>
                <p style={{
                  fontSize: '0.875rem', fontWeight: 700, color: TEXT,
                }}>
                  {g.nomGestionnaire}
                </p>
                {isTest && (
                  <span style={{
                    fontSize: '0.58rem', fontWeight: 700,
                    background: `${YELLOW}15`,
                    border: `1px solid ${YELLOW}25`,
                    color: YELLOW, padding: '1px 5px', borderRadius: 999,
                  }}>
                    TEST
                  </span>
                )}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: '0.62rem', fontWeight: 600,
                background: `${GREEN}12`,
                border: `1px solid ${GREEN}20`,
                color: GREEN, padding: '2px 7px', borderRadius: 999,
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: GREEN, boxShadow: `0 0 4px ${GREEN}`,
                }} />
                Actif
              </div>
            </div>
          </div>

          {/* Boutons action */}
          <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}
            onClick={e => e.stopPropagation()}>
            <ActionBtn
              icon={Edit} color={CYAN}
              title="Modifier email/téléphone"
              onClick={() => onEdit(g)}
            />
            {!isTest && (
              <ActionBtn
                icon={Trash2} color={RED}
                title="Supprimer définitivement"
                onClick={() => onDelete(g.id)}
              />
            )}
          </div>
        </div>

        {/* Infos contact */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '0.35rem',
          marginBottom: '0.75rem',
        }}>
          {[
            {
              icon: Mail,
              val: g.email || 'Pas d\'email renseigné',
              color: g.email ? CYAN : MUTED,
            },
            {
              icon: Phone,
              val: g.telephone || 'Pas de téléphone',
              color: g.telephone ? GREEN : MUTED,
            },
            {
              icon: Calendar,
              val: `Créé le ${new Date(g.dateCreation)
                .toLocaleDateString('fr-FR')}`,
              color: MUTED,
            },
          ].map((info, j) => {
            const Icon = info.icon
            return (
              <div key={j} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <Icon size={12} style={{ color: info.color, flexShrink: 0 }} />
                <span style={{
                  fontSize: '0.72rem', color: info.color,
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {info.val}
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          paddingTop: '0.625rem',
          borderTop: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
        }}>
          <Lock size={10} style={{ color: MUTED, flexShrink: 0 }} />
          <span style={{
            fontSize: '0.6rem', color: MUTED,
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            Immuables : id, nom, mot_de_passe · Modifiables : email, téléphone
          </span>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// TAB — PROFIL ADMIN
// ════════════════════════════════════════════════════════
function ProfilAdminTab({ user, nbGestionnaires, isMobile }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
      animation: 'slide-up 0.4s ease-out',
    }}>
      <h2 style={{
        fontSize: isMobile ? '1.1rem' : '1.25rem',
        fontWeight: 700, color: TEXT,
      }}>
        Mon Compte Administrateur
      </h2>

      {/* Avatar hero */}
      <DarkCard title="" delay={0} accent={VIOLET}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'center',
          gap: '1.25rem',
          padding: '0.5rem 0 1rem',
          textAlign: isMobile ? 'center' : 'left',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -20,
            width: 160, height: 160,
            background: `radial-gradient(circle, ${VIOLET}15, transparent 70%)`,
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div style={{
            width: 72, height: 72,
            background: `linear-gradient(135deg, ${VIOLET}, ${PINK})`,
            borderRadius: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 32px ${VIOLET}55`,
            position: 'relative', flexShrink: 0,
          }}>
            <Crown size={32} style={{ color: '#fff' }} />
            <div style={{
              position: 'absolute', top: -6, right: -6,
              width: 20, height: 20,
              background: YELLOW, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${BG_CARD}`,
              boxShadow: `0 0 10px ${YELLOW}66`,
            }}>
              <Star size={10} style={{ color: '#fff' }} />
            </div>
          </div>

          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: TEXT }}>
              Administrateur
            </p>
            <p style={{ fontSize: '0.82rem', color: MUTED, marginTop: 3 }}>
              {user?.id}
            </p>
            <div style={{
              display: 'flex', gap: '0.5rem', marginTop: '0.625rem',
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                background: `linear-gradient(135deg, ${VIOLET}22, ${PINK}11)`,
                border: `1px solid ${VIOLET}44`,
                color: VIOLET, padding: '3px 10px', borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Zap size={9} /> SUPER ADMINISTRATEUR
              </span>
              <span style={{
                fontSize: '0.65rem', fontWeight: 600,
                background: `${GREEN}12`,
                border: `1px solid ${GREEN}25`,
                color: GREEN, padding: '3px 8px', borderRadius: 999,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: GREEN, boxShadow: `0 0 4px ${GREEN}`,
                }} />
                Session active
              </span>
            </div>
          </div>
        </div>

        {/* Stats grille */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: '0.75rem', marginTop: '0.5rem',
        }}>
          {[
            { label: 'Identifiant',         val: user?.id,         color: VIOLET },
            { label: 'Gestionnaires créés', val: nbGestionnaires,  color: GREEN  },
            { label: 'Statut',              val: 'Session active', color: CYAN   },
          ].map(item => (
            <div key={item.label} style={{
              background: `${item.color}10`,
              border: `1px solid ${item.color}20`,
              borderRadius: '0.75rem', padding: '0.875rem',
            }}>
              <p style={{
                fontSize: '0.6rem', color: MUTED,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: 4, fontWeight: 600,
              }}>
                {item.label}
              </p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: item.color }}>
                {item.val}
              </p>
            </div>
          ))}
        </div>
      </DarkCard>

      {/* Permissions */}
      <DarkCard
        title="Permissions & Accès"
        subtitle="Droits administrateur complets"
        delay={80} accent={VIOLET}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '0.625rem',
        }}>
          {[
            { label: 'Créer gestionnaires',      icon: Plus,     ok: true  },
            { label: 'Modifier gestionnaires',   icon: Edit,     ok: true  },
            { label: 'Désactiver gestionnaires', icon: Trash2,   ok: true  },
            { label: 'Voir tous les comptes',    icon: Eye,      ok: true  },
            { label: 'Créer conducteurs',        icon: Users,    ok: false, note: 'Via gestionnaire' },
            { label: 'Accès données ADAS/DMS',   icon: Activity, ok: false, note: 'Via gestionnaire' },
          ].map((perm, i) => {
            const Icon = perm.icon
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                background: perm.ok ? `${VIOLET}08` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${perm.ok ? `${VIOLET}18` : BORDER}`,
                borderRadius: '0.5rem',
                animation: `fade-in 0.3s ease-out ${i * 50}ms both`,
              }}>
                <div style={{
                  width: 28, height: 28,
                  background: perm.ok ? `${VIOLET}18` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${perm.ok ? `${VIOLET}25` : BORDER}`,
                  borderRadius: '0.375rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={13} style={{ color: perm.ok ? VIOLET : MUTED }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: perm.ok ? TEXT : MUTED,
                    whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {perm.label}
                  </p>
                  {perm.note && (
                    <p style={{ fontSize: '0.62rem', color: MUTED }}>
                      {perm.note}
                    </p>
                  )}
                </div>
                <div style={{ flexShrink: 0 }}>
                  {perm.ok ? (
                    <CheckCircle size={14} style={{ color: GREEN }} />
                  ) : (
                    <span style={{
                      fontSize: '0.6rem', color: MUTED,
                      background: 'rgba(255,255,255,0.04)',
                      padding: '2px 5px', borderRadius: 999,
                    }}>
                      Limité
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </DarkCard>

      {/* Compte immuable */}
      <DarkCard
        title="🔒 Compte immuable"
        subtitle="Ces informations ne peuvent pas être modifiées"
        delay={160} accent={MUTED}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '0.75rem',
        }}>
          {[
            { label: 'Identifiant système', val: user?.id },
            { label: 'Rôle',               val: 'ADMINISTRATEUR' },
            { label: 'Mot de passe',        val: '••••••••••••' },
            { label: 'Type de compte',      val: 'Unique — non dupliqué' },
          ].map(item => (
            <div key={item.label}>
              <label style={{
                display: 'block', fontSize: '0.68rem',
                color: MUTED, marginBottom: 5,
              }}>
                🔒 {item.label}
              </label>
              <div style={{
                padding: '0.6rem 0.875rem',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${BORDER}`,
                borderRadius: '0.5rem',
                fontSize: '0.82rem', color: '#475569',
              }}>
                {item.val}
              </div>
            </div>
          ))}
        </div>
      </DarkCard>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// COMPOSANTS DASHBOARD
// ════════════════════════════════════════════════════════
function GestListDashboard({ gestionnaires, selected, onSelect }) {
  if (!gestionnaires.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: MUTED }}>
        <Users size={32} style={{ opacity: 0.15, margin: '0 auto 0.75rem' }} />
        <p style={{ fontSize: '0.82rem' }}>Aucun gestionnaire enregistré</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {gestionnaires.map((g, i) => {
        const isSel  = selected?.id === g.id
        const isTest = g.id === 'G1'
        return (
          <div
            key={g.id}
            onClick={() => onSelect(isSel ? null : g)}
            style={{
              display: 'flex', alignItems: 'center',
              gap: '0.75rem', padding: '0.625rem 0.75rem',
              borderRadius: '0.625rem', cursor: 'pointer',
              border: isSel ? `1px solid ${VIOLET}44` : '1px solid transparent',
              background: isSel ? `${VIOLET}08` : 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s',
              animation: `fade-in 0.3s ease-out ${i * 40}ms both`,
            }}
            onMouseEnter={e => {
              if (!isSel) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = `${VIOLET}22`
              }
            }}
            onMouseLeave={e => {
              if (!isSel) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.01)'
                e.currentTarget.style.borderColor = 'transparent'
              }
            }}
          >
            <div style={{
              width: 38, height: 38, flexShrink: 0,
              background: `${VIOLET}20`, border: `1px solid ${VIOLET}30`,
              borderRadius: '0.625rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.82rem', fontWeight: 700, color: VIOLET,
            }}>
              {g.id}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <p style={{
                  fontSize: '0.82rem', fontWeight: 600, color: TEXT,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {g.nomGestionnaire}
                </p>
                {isTest && (
                  <span style={{
                    fontSize: '0.55rem', fontWeight: 700,
                    background: `${YELLOW}15`, border: `1px solid ${YELLOW}25`,
                    color: YELLOW, padding: '1px 4px', borderRadius: 999,
                    flexShrink: 0,
                  }}>
                    TEST
                  </span>
                )}
              </div>
              <p style={{
                fontSize: '0.68rem', color: MUTED, marginTop: 1,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {g.email || 'Pas d\'email'} ·{' '}
                {new Date(g.dateCreation).toLocaleDateString('fr-FR')}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: GREEN, boxShadow: `0 0 6px ${GREEN}`,
              }} />
              <ChevronRight size={13} style={{
                color: isSel ? VIOLET : MUTED,
                transform: isSel ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Mini Détail Gestionnaire — Desktop ────────────────────
function MiniDetailGest({ gestionnaire: g, onClose }) {
  return (
    <div style={{
      background: BG_CARD,
      border: `1px solid ${VIOLET}33`,
      borderRadius: '1rem',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      animation: 'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
      boxShadow: `0 8px 32px ${VIOLET}12`,
    }}>
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, ${VIOLET}, ${PINK})`,
      }} />

      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 38, height: 38,
            background: `${VIOLET}22`, border: `1px solid ${VIOLET}33`,
            borderRadius: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.875rem', fontWeight: 700, color: VIOLET,
          }}>
            {g.id}
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: TEXT }}>
              {g.nomGestionnaire}
            </p>
            <p style={{ fontSize: '0.65rem', color: MUTED }}>
              Gestionnaire de flotte
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 26, height: 26,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${BORDER}`,
            borderRadius: '0.375rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: MUTED,
          }}
        >
          <X size={13} />
        </button>
      </div>

      <div style={{ padding: '1rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px',
              background: `${GREEN}12`, border: `1px solid ${GREEN}25`,
              borderRadius: 999,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: GREEN, boxShadow: `0 0 6px ${GREEN}`,
              }} />
              <span style={{ fontSize: '0.72rem', color: GREEN, fontWeight: 600 }}>
                Compte actif
              </span>
            </div>
          </div>

          {[
            { icon: Shield,   label: 'Identifiant',   val: g.id,             color: VIOLET },
            { icon: Users,    label: 'Nom',           val: g.nomGestionnaire,color: TEXT   },
            { icon: Mail,     label: 'Email',         val: g.email || '—',   color: g.email ? CYAN : MUTED },
            { icon: Phone,    label: 'Téléphone',     val: g.telephone || '—',color: g.telephone ? GREEN : MUTED },
            { icon: Calendar, label: 'Date création',
              val: new Date(g.dateCreation).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric',
              }), color: MUTED },
          ].map((info, i) => {
            const Icon = info.icon
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${BORDER}`,
                borderRadius: '0.5rem',
                animation: `fade-in 0.3s ease-out ${i * 50}ms both`,
              }}>
                <div style={{
                  width: 28, height: 28,
                  background: `${info.color}15`, border: `1px solid ${info.color}20`,
                  borderRadius: '0.375rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={12} style={{ color: info.color }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.62rem', color: MUTED, marginBottom: 1 }}>
                    {info.label}
                  </p>
                  <p style={{
                    fontSize: '0.8rem', color: info.color, fontWeight: 600,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {info.val}
                  </p>
                </div>
              </div>
            )
          })}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '0.5rem',
          }}>
            <Lock size={10} style={{ color: MUTED, flexShrink: 0 }} />
            <span style={{ fontSize: '0.62rem', color: MUTED }}>
              id, nom et mot_de_passe sont immuables
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// FORMULAIRE GESTIONNAIRE
// ════════════════════════════════════════════════════════
function FormulaireGestionnaire({ gestionnaire, erreur, onSave, onClose, isMobile }) {
  const isEdit = !!gestionnaire
  const [showMdp, setShowMdp] = useState(false)
  const [form, setForm] = useState({
    id:              gestionnaire?.id              || '',
    nomGestionnaire: gestionnaire?.nomGestionnaire || '',
    motDePasse:      '',
    email:           gestionnaire?.email           || '',
    telephone:       gestionnaire?.telephone       || '',
  })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const data = {}
    if (isEdit) {
      if (form.email)     data.email     = form.email
      if (form.telephone) data.telephone = form.telephone
    } else {
      Object.assign(data, form)
    }
    onSave(data)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      padding: isMobile ? 0 : '1rem',
      animation: 'fade-in 0.2s ease-out',
    }}>
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(10px)',
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative',
        background: BG_CARD,
        border: `1px solid ${VIOLET}33`,
        overflow: 'hidden',
        boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 40px ${VIOLET}12`,
        animation: 'slide-up 0.4s cubic-bezier(0.16,1,0.3,1)',
        ...(isMobile ? {
          width: '100%',
          borderRadius: '1.25rem 1.25rem 0 0',
          maxHeight: '92vh',
        } : {
          width: '100%', maxWidth: 480,
          borderRadius: '1.25rem',
          maxHeight: '90vh',
        }),
      }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, ${VIOLET}, ${PINK})` }} />

        {isMobile && (
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.15)',
            margin: '0.875rem auto 0',
          }} />
        )}

        {/* Header */}
        <div style={{
          padding: '1.125rem 1.5rem',
          borderBottom: `1px solid ${BORDER}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38, height: 38,
              background: `linear-gradient(135deg, ${VIOLET}33, ${PINK}22)`,
              border: `1px solid ${VIOLET}33`,
              borderRadius: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isEdit
                ? <Edit size={16} style={{ color: VIOLET }} />
                : <Plus size={16} style={{ color: VIOLET }} />
              }
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: TEXT }}>
                {isEdit ? `Modifier ${gestionnaire.id}` : 'Nouveau gestionnaire'}
              </h3>
              <p style={{ fontSize: '0.68rem', color: MUTED, marginTop: 1 }}>
                {isEdit
                  ? 'Seuls email et téléphone sont modifiables'
                  : 'Créé par l\'administrateur (id=00000000)'
                }
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${BORDER}`, borderRadius: '0.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: MUTED,
          }}>
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.125rem 1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.875rem',
            overflowY: 'auto',
            maxHeight: isMobile ? 'calc(92vh - 120px)' : 'calc(90vh - 120px)',
          }}
        >
          {/* ID */}
          <FormField
            label={isEdit ? '🔒 Identifiant (immuable)' : 'Identifiant *'}
            locked={isEdit}
            value={form.id}
            onChange={set('id')}
            placeholder="Format : G + chiffres (ex: G2, G3)"
            required={!isEdit}
            hint={!isEdit ? 'Format : G + chiffres (ex: G2, G3, G10)' : null}
            accent={VIOLET}
          />

          {/* Nom */}
          <FormField
            label={isEdit ? '🔒 Nom gestionnaire (immuable)' : 'Nom gestionnaire *'}
            locked={isEdit}
            value={form.nomGestionnaire}
            onChange={set('nomGestionnaire')}
            placeholder="ex: Gestionnaire Beta"
            required={!isEdit}
            accent={VIOLET}
          />

          {/* Mot de passe — création seulement */}
          {!isEdit && (
            <div>
              <label style={{
                display: 'block', fontSize: '0.7rem',
                color: MUTED, marginBottom: 6,
              }}>
                Mot de passe *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showMdp ? 'text' : 'password'}
                  value={form.motDePasse}
                  onChange={set('motDePasse')}
                  placeholder="Min. 8 caractères"
                  required
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.5rem 0.625rem 0.875rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${BORDER}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.82rem', color: TEXT, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = `${VIOLET}55`
                    e.target.style.boxShadow = `0 0 0 3px ${VIOLET}12`
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = BORDER
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowMdp(!showMdp)}
                  style={{
                    position: 'absolute', right: 10,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: MUTED,
                  }}
                >
                  {showMdp ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p style={{
                fontSize: '0.62rem', color: MUTED, marginTop: 4,
                display: 'flex', alignItems: 'center', gap: 3,
              }}>
                <Lock size={9} />
                Immuable après création — le gestionnaire ne peut pas le changer
              </p>
            </div>
          )}

          {/* Email */}
          <FormField
            label={`Email ${isEdit ? '(modifiable)' : ''}`}
            value={form.email}
            onChange={set('email')}
            type="email"
            placeholder="gestionnaire@alpha.tn"
            accent={CYAN}
          />

          {/* Téléphone */}
          <FormField
            label={`Téléphone ${isEdit ? '(modifiable)' : ''}`}
            value={form.telephone}
            onChange={set('telephone')}
            type="tel"
            placeholder="+216 71 XXX XXX"
            accent={GREEN}
          />

          {/* Erreur */}
          {erreur && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
              padding: '0.75rem',
              background: `${RED}12`, border: `1px solid ${RED}25`,
              borderRadius: '0.625rem',
              color: '#FCA5A5', fontSize: '0.8rem',
              animation: 'fade-in 0.3s ease-out',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              {erreur}
            </div>
          )}

          {/* Boutons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              type="button" onClick={onClose}
              style={{
                flex: 1, padding: '0.675rem',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${BORDER}`,
                borderRadius: '0.75rem',
                color: MUTED, fontSize: '0.85rem',
                fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                flex: 1, padding: '0.675rem',
                background: `linear-gradient(135deg, ${VIOLET}, ${PINK})`,
                border: 'none', borderRadius: '0.75rem',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: `0 4px 15px ${VIOLET}44`,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = `0 6px 25px ${VIOLET}66`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 4px 15px ${VIOLET}44`
              }}
            >
              {isEdit ? 'Mettre à jour' : 'Créer le gestionnaire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════
// CHARTS
// ════════════════════════════════════════════════════════
function BarChartGest({ labels, data }) {
  const chartData = {
    labels,
    datasets: [{
      label: 'Gestionnaires',
      data,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return `${VIOLET}88`
        const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        grad.addColorStop(0, `${VIOLET}CC`)
        grad.addColorStop(1, `${PINK}66`)
        return grad
      },
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: `${PINK}CC`,
    }],
  }

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(18,18,31,0.98)',
        borderColor: `${VIOLET}44`, borderWidth: 1,
        titleColor: MUTED, bodyColor: TEXT,
        callbacks: {
          label: ctx => ` ${ctx.raw} gestionnaire${ctx.raw > 1 ? 's' : ''}`,
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
    <div style={{ height: 160 }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}

// ════════════════════════════════════════════════════════
// COMPOSANTS UTILITAIRES
// ════════════════════════════════════════════════════════
function DarkCard({
  title, subtitle, children, delay = 0,
  accent = PURPLE, headerRight, style: extra = {}
}) {
  return (
    <div
      style={{
        background: BG_CARD, border: `1px solid ${BORDER}`,
        borderRadius: '1rem', overflow: 'hidden',
        animation: `slide-up 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
        transition: 'border-color 0.3s, box-shadow 0.3s',
        ...extra,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${accent}33`
        e.currentTarget.style.boxShadow = `0 8px 32px ${accent}10`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = BORDER
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {title && (
        <div style={{
          height: 2,
          background: `linear-gradient(90deg, ${accent}, ${accent}00)`,
        }} />
      )}
      {title && (
        <div style={{
          padding: '1rem 1.25rem 0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{
              fontSize: '0.85rem', fontWeight: 700, color: TEXT, marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.7rem', color: MUTED }}>{subtitle}</p>
            )}
          </div>
          {headerRight && (
            <div style={{ flexShrink: 0, marginLeft: '0.75rem' }}>
              {headerRight}
            </div>
          )}
        </div>
      )}
      <div style={{ padding: title ? '0 1.25rem 1.25rem' : '1.25rem' }}>
        {children}
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, icon: Icon, color, delay, trend, compact }) {
  return (
    <div style={{
      background: BG_CARD, border: `1px solid ${BORDER}`,
      borderRadius: '1rem',
      padding: compact ? '0.875rem' : '1.25rem',
      position: 'relative', overflow: 'hidden',
      animation: `slide-up 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      transition: 'all 0.3s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}44`
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}18`
        e.currentTarget.style.transform = 'translateY(-3px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = BORDER
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, ${color}00)`,
      }} />
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: compact ? 60 : 80, height: compact ? 60 : 80,
        background: `radial-gradient(circle, ${color}22, transparent 70%)`,
        borderRadius: '50%',
      }} />

      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: compact ? '0.625rem' : '0.875rem',
      }}>
        <div style={{
          width: compact ? 34 : 40, height: compact ? 34 : 40,
          background: `${color}18`, border: `1px solid ${color}30`,
          borderRadius: '0.625rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={compact ? 15 : 18} style={{ color }} />
        </div>
        {trend && !compact && (
          <span style={{
            fontSize: '0.6rem', color: GREEN,
            background: `${GREEN}12`, border: `1px solid ${GREEN}22`,
            padding: '2px 6px', borderRadius: 999,
            display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600,
          }}>
            <ArrowUpRight size={9} /> {trend}
          </span>
        )}
      </div>

      <p style={{
        fontSize: compact ? '1.4rem' : '1.75rem',
        fontWeight: 800, color,
        marginBottom: 4, textShadow: `0 0 20px ${color}44`,
      }}>
        {value}
      </p>
      <p style={{
        fontSize: compact ? '0.65rem' : '0.7rem',
        color: TEXT, fontWeight: 600, marginBottom: 2,
      }}>
        {label}
      </p>
      <p style={{ fontSize: '0.6rem', color: MUTED }}>{sub}</p>
    </div>
  )
}

function FormField({
  label, value, onChange, type = 'text',
  placeholder, required, locked, hint, accent = VIOLET
}) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.7rem',
        color: locked ? '#374151' : MUTED, marginBottom: 6,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={locked}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%', padding: '0.625rem 0.875rem',
          background: locked
            ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${locked ? 'rgba(255,255,255,0.04)' : BORDER}`,
          borderRadius: '0.5rem',
          fontSize: '0.82rem',
          color: locked ? '#374151' : TEXT,
          outline: 'none', cursor: locked ? 'not-allowed' : 'text',
          transition: 'all 0.2s', boxSizing: 'border-box',
        }}
        onFocus={e => {
          if (!locked) {
            e.target.style.borderColor = `${accent}55`
            e.target.style.boxShadow = `0 0 0 3px ${accent}12`
          }
        }}
        onBlur={e => {
          e.target.style.borderColor =
            locked ? 'rgba(255,255,255,0.04)' : BORDER
          e.target.style.boxShadow = 'none'
        }}
      />
      {hint && (
        <p style={{ fontSize: '0.62rem', color: MUTED, marginTop: 4 }}>
          {hint}
        </p>
      )}
    </div>
  )
}

function ActionBtn({ icon: Icon, color, title, onClick }) {
  return (
    <button
      onClick={onClick} title={title}
      style={{
        width: 30, height: 30,
        background: `${color}12`, border: `1px solid ${color}22`,
        borderRadius: '0.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `${color}25`
        e.currentTarget.style.borderColor = `${color}44`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `${color}12`
        e.currentTarget.style.borderColor = `${color}22`
      }}
    >
      <Icon size={13} style={{ color }} />
    </button>
  )
}