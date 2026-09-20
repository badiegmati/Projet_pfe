// src/components/common/Sidebar.jsx
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Shield, LayoutDashboard, Activity, TrendingUp,
  MessageSquare, User, LogOut, Users, Car,
  Bell, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar({ activeTab, setActiveTab, notificationCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Navigation items selon rôle
  const navItems = {
    CONDUCTEUR: [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'historique', label: 'Historique', icon: Activity },
      { id: 'score', label: 'Mon Score', icon: TrendingUp },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: notificationCount },
      { id: 'profil', label: 'Mon Compte', icon: User },
    ],
    GESTIONNAIRE: [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'conducteurs', label: 'Conducteurs', icon: Users },
      { id: 'vehicules', label: 'Véhicules', icon: Car },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'profil', label: 'Mon Compte', icon: User },
    ],
    ADMINISTRATEUR: [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'gestionnaires', label: 'Gestionnaires', icon: Users },
      { id: 'profil', label: 'Mon Compte', icon: User },
    ],
  }

  const items = navItems[user?.role] || []

  const getInitials = () => {
    if (user?.nom) {
      const parts = user.nom.split(' ')
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`
      return user.nom.slice(0, 2).toUpperCase()
    }
    return user?.id?.slice(0, 2)?.toUpperCase() || 'AT'
  }

  const getRoleColor = () => {
    switch (user?.role) {
      case 'CONDUCTEUR': return 'from-blue-500 to-blue-700'
      case 'GESTIONNAIRE': return 'from-emerald-500 to-emerald-700'
      case 'ADMINISTRATEUR': return 'from-violet-500 to-violet-700'
      default: return 'from-violet-500 to-cyan-500'
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0A0A12]/95 backdrop-blur-xl border-r border-white/10 z-30 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm leading-tight">Alpha Technology</p>
          <p className="text-white/40 text-[10px] tracking-wide">ADAS / DMS</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          {items.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} className={isActive ? 'text-violet-400' : ''} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className="notif-badge">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Section Utilisateur */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor()} rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.nom || user?.id}</p>
            <p className="text-white/40 text-xs">{user?.id} · {user?.role === 'CONDUCTEUR' ? 'COND' : user?.role === 'GESTIONNAIRE' ? 'GEST' : 'ADMIN'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn-ghost w-full flex items-center justify-center gap-2 text-sm py-2"
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}