/**
 * App.jsx — Routeur principal
 * Routes selon le rôle : CONDUCTEUR / GESTIONNAIRE / ADMINISTRATEUR
 */
import React from 'react'
import {
  BrowserRouter, Routes, Route, Navigate
} from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth }      from './hooks/useAuth'

import LoginPage              from './pages/LoginPage'
import DashboardConducteur    from './pages/DashboardConducteur'
import DashboardGestionnaire  from './pages/DashboardGestionnaire'
import DashboardAdministrateur from './pages/DashboardAdministrateur'
import LoadingSpinner         from './components/common/LoadingSpinner'

// ── Garde de route ──────────────────────────────────────────
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner full />
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role))
    return <Navigate to="/login" replace />

  return children
}

// ── Redirection selon rôle ──────────────────────────────────
function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner full />
  if (!user)   return <Navigate to="/login" replace />

  const routes = {
    CONDUCTEUR:    '/conducteur/dashboard',
    GESTIONNAIRE:  '/gestionnaire/dashboard',
    ADMINISTRATEUR:'/admin/dashboard',
  }
  return <Navigate to={routes[user.role] || '/login'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/"      element={<HomeRedirect />} />

          {/* CONDUCTEUR */}
          <Route
            path="/conducteur/*"
            element={
              <PrivateRoute roles={['CONDUCTEUR']}>
                <DashboardConducteur />
              </PrivateRoute>
            }
          />

          {/* GESTIONNAIRE */}
          <Route
            path="/gestionnaire/*"
            element={
              <PrivateRoute roles={['GESTIONNAIRE']}>
                <DashboardGestionnaire />
              </PrivateRoute>
            }
          />

          {/* ADMINISTRATEUR */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute roles={['ADMINISTRATEUR']}>
                <DashboardAdministrateur />
              </PrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}