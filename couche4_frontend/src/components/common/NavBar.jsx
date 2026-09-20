import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield, Car, Users, LayoutDashboard,
  Bell, LogOut, Menu, X, MessageSquare,
  Activity, ChevronDown
} from 'lucide-react'
import { useAuth }         from '../../hooks/useAuth'
import { notificationAPI } from '../../api/apiService'

export default function NavBar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [nbNotifs, setNbNotifs] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (user?.role !== 'CONDUCTEUR') return
    const fetch = () => {
      notificationAPI.countNonLues(user.id)
        .then(r => setNbNotifs(r.data.count || 0))
        .catch(() => {})
    }
    fetch()
    const iv = setInterval(fetch, 30000)
    return () => clearInterval(iv)
  }, [user])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const navItems = {
    CONDUCTEUR: [
      { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
      { id: 'historique', label: 'Historique', icon: Activity },
      { id: 'score',      label: 'Score',       icon: Shield },
      { id: 'messages',   label: 'Messages',    icon: MessageSquare },
      { id: 'profil',     label: 'Compte',      icon: Car },
    ],
    GESTIONNAIRE: [
      { id: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
      { id: 'conducteurs', label: 'Conducteurs',  icon: Users },
      { id: 'vehicules',   label: 'Véhicules',    icon: Car },
      { id: 'messages',    label: 'Messages',     icon: MessageSquare },
      { id: 'profil',      label: 'Compte',       icon: Shield },
    ],
    ADMINISTRATEUR: [
      { id: 'dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
      { id: 'gestionnaires', label: 'Gestionnaires', icon: Users },
      { id: 'profil',        label: 'Compte',        icon: Shield },
    ],
  }

  const items = navItems[user?.role] || []

  const roleAccent = {
    CONDUCTEUR:    { color: '#3B82F6', label: 'Conducteur' },
    GESTIONNAIRE:  { color: '#10B981', label: 'Gestionnaire' },
    ADMINISTRATEUR:{ color: '#A855F7', label: 'Admin' },
  }
  const accent = roleAccent[user?.role] || roleAccent.CONDUCTEUR

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled
        ? 'rgba(13,13,26,0.95)'
        : 'rgba(13,13,26,0.80)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: scrolled
        ? '1px solid rgba(255,255,255,0.08)'
        : '1px solid transparent',
      boxShadow: scrolled
        ? `0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(${
            user?.role === 'ADMINISTRATEUR' ? '168,85,247'
            : user?.role === 'GESTIONNAIRE' ? '16,185,129'
            : '59,130,246'
          },0.1)`
        : 'none',
      transition: 'all 0.3s',
    }}>
      {/* Ligne néon du haut */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)`,
        opacity: scrolled ? 1 : 0,
        transition: 'opacity 0.3s',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', height: 64,
        }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38, height: 38,
              background: `linear-gradient(135deg, ${accent.color}33, ${accent.color}11)`,
              border: `1px solid ${accent.color}44`,
              borderRadius: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 16px ${accent.color}33`,
            }}>
              <Shield size={18} style={{ color: accent.color }} />
            </div>
            <div>
              <p style={{
                color: '#F1F5F9', fontWeight: 700,
                fontSize: '0.875rem', lineHeight: 1,
              }}>
                Alpha Technology
              </p>
              <p style={{
                fontSize: '0.65rem', lineHeight: 1,
                marginTop: 2,
                background: `linear-gradient(90deg, ${accent.color}, #EC4899)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600,
              }}>
                ADAS/DMS
              </p>
            </div>
          </div>

          {/* Navigation desktop */}
          <div style={{
            display: 'none',
            alignItems: 'center', gap: '0.25rem',
          }}
            className="md:flex">
            {items.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '0.625rem',
                    fontSize: '0.8rem', fontWeight: 500,
                    border: isActive
                      ? `1px solid ${accent.color}44`
                      : '1px solid transparent',
                    background: isActive
                      ? `${accent.color}18`
                      : 'transparent',
                    color: isActive ? '#F1F5F9' : '#64748B',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#F1F5F9'
                      e.currentTarget.style.background =
                        'rgba(255,255,255,0.05)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#64748B'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <Icon size={15}
                    style={{ color: isActive ? accent.color : 'inherit' }}
                  />
                  {item.label}
                  {item.id === 'historique' && nbNotifs > 0 && (
                    <span style={{
                      background: '#EF4444', color: '#fff',
                      fontSize: '0.6rem', fontWeight: 700,
                      borderRadius: '999px',
                      minWidth: 18, height: 18,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      boxShadow: '0 0 10px rgba(239,68,68,0.5)',
                      animation: 'pulse-neon 2s infinite',
                    }}>
                      {nbNotifs > 99 ? '99+' : nbNotifs}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Utilisateur + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Pill utilisateur */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 0.75rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '999px',
            }}
              className="hidden md:flex">
              <div style={{
                width: 24, height: 24,
                background: `linear-gradient(135deg, ${accent.color}, #EC4899)`,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700, color: '#fff',
              }}>
                {user?.nom?.[0] || user?.id?.[0]}
              </div>
              <div>
                <p style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: '#F1F5F9', lineHeight: 1,
                }}>
                  {user?.nom || user?.id}
                </p>
                <p style={{
                  fontSize: '0.6rem', color: accent.color, lineHeight: 1,
                  marginTop: 1,
                }}>
                  {accent.label}
                </p>
              </div>
            </div>

            {/* Bouton logout */}
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 0.875rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '0.625rem',
                color: '#FCA5A5',
                fontSize: '0.8rem', fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.2)'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
              }}
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Déconnexion</span>
            </button>

            {/* Menu mobile */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.5rem', padding: '0.4rem',
                color: '#94A3B8', cursor: 'pointer',
              }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {menuOpen && (
          <div style={{
            paddingBottom: '0.75rem',
            animation: 'fade-in 0.2s ease-out',
          }}>
            {items.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMenuOpen(false) }}
                  style={{
                    width: '100%', display: 'flex',
                    alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.625rem', marginBottom: '0.25rem',
                    border: 'none', cursor: 'pointer',
                    background: isActive
                      ? `${accent.color}18` : 'transparent',
                    color: isActive ? '#F1F5F9' : '#64748B',
                    fontSize: '0.875rem', fontWeight: 500,
                    textAlign: 'left',
                  }}>
                  <Icon size={18}
                    style={{ color: isActive ? accent.color : 'inherit' }}
                  />
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}