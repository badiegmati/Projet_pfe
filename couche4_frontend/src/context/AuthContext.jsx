// src/context/AuthContext.jsx
import React, { createContext, useState, useCallback } from 'react'
import { authAPI } from '../api/apiService'
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('adas_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)

  // ── LOGIN ─────────────────────────────────────────────────
  const login = useCallback(async (id, motDePasse) => {
    setLoading(true)
    try {
      // ✅ Envoie { id, motDePasse } — correspond à LoginDTO
      const response = await authAPI.login(id, motDePasse)
      const data = response.data

      if (!data || !data.role) {
        throw new Error('Réponse invalide du serveur')
      }

      // ✅ Sauvegarder token JWT
      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      // ✅ Sauvegarder utilisateur
      const userInfo = {
        id:     data.id,
        nom:    data.nom,
        prenom: data.prenom,
        role:   data.role,
      }
      localStorage.setItem('adas_user', JSON.stringify(userInfo))
      setUser(userInfo)

      return data

    } finally {
      setLoading(false)
    }
  }, [])

  // ── LOGOUT ────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('adas_user')
    localStorage.removeItem('token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}