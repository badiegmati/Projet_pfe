/**
 * apiService.js — Service HTTP centralisé CORRIGÉ
 * Alpha Technology — PFE 2024-2025
 */
import axios from 'axios'

const BASE = 'http://localhost:8080'

// ── Instance Axios ──────────────────────────────────────────
const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  // ✅ AJOUT : nécessaire pour CORS avec credentials
  withCredentials: false,
})

// ── Intercepteur requête — injecte le JWT ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Intercepteur réponse — gère 401 ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Log détaillé pour déboguer
    if (error.code === 'ERR_NETWORK') {
      console.error('[API] Network Error — Spring Boot démarré ?', {
        url: error.config?.url,
        method: error.config?.method,
      })
    }

    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════
export const authAPI = {
  login: (id, motDePasse) =>
    api.post('/api/auth/login', { id, motDePasse }),
  conducteurExiste: (id) =>
    api.get(`/api/conducteurs/${id}/existe`),
}

// ════════════════════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════════════════════
export const adminAPI = {
  getGestionnaires: () =>
    api.get('/api/admin/gestionnaires'),
  getGestionnaire: (id) =>
    api.get(`/api/admin/gestionnaires/${id}`),
  creerGestionnaire: (data) =>
    api.post('/api/admin/gestionnaires', data),
  modifierGestionnaire: (id, data) =>
    api.put(`/api/admin/gestionnaires/${id}`, data),
  supprimerGestionnaire: (id) =>
    api.delete(`/api/admin/gestionnaires/${id}`),
  getProfil: () =>
    api.get('/api/admin/profil'),
}

// ════════════════════════════════════════════════════════════
// GESTIONNAIRE
// ════════════════════════════════════════════════════════════
export const gestionnaireAPI = {
  getMesConducteurs: () =>
    api.get('/api/gestionnaire/conducteurs'),
  getConducteur: (id) =>
    api.get(`/api/gestionnaire/conducteurs/${id}`),
  creerConducteur: (data) =>
    api.post('/api/gestionnaire/conducteurs', data),
  modifierConducteur: (id, data) =>
    api.put(`/api/gestionnaire/conducteurs/${id}`, data),
  supprimerConducteur: (id) =>
    api.delete(`/api/gestionnaire/conducteurs/${id}`),
  getMesVehicules: () =>
    api.get('/api/gestionnaire/vehicules'),
  creerVehicule: (data) =>
    api.post('/api/gestionnaire/vehicules', data),
  modifierVehicule: (id, data) =>
    api.put(`/api/gestionnaire/vehicules/${id}`, data),
  supprimerVehicule: (id) =>
    api.delete(`/api/gestionnaire/vehicules/${id}`),
  assignerVehicule: (vid, cid) =>
    api.put(`/api/gestionnaire/vehicules/${vid}/assigner/${cid}`),
  getProfil: () =>
    api.get('/api/gestionnaire/profil'),
  modifierProfil: (data) =>
    api.put('/api/gestionnaire/profil', data),
}

// ════════════════════════════════════════════════════════════
// CONDUCTEUR
// ════════════════════════════════════════════════════════════
export const conducteurAPI = {
  getProfil: (id) =>
    api.get(`/api/conducteur/${id}/profil`),
  modifierProfil: (id, data) =>
    api.put(`/api/conducteur/${id}/profil`, data),
  getScore: (id) =>
    api.get(`/api/conducteur/${id}/score`),
  getHistoriqueScore: (id) =>
    api.get(`/api/conducteur/${id}/score/historique`),
  getEvenements: (id) =>
    api.get(`/api/conducteur/${id}/evenements`),
  getHistorique: (id) =>
    api.get(`/api/conducteur/${id}/historique`),
  getTableauBord: (id) =>
    api.get(`/api/conducteur/${id}/tableau-bord`),
}

// ════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════════
export const notificationAPI = {
  getAll: (conducteurId) =>
    api.get(`/api/notifications/${conducteurId}`),
  countNonLues: (conducteurId) =>
    api.get(`/api/notifications/${conducteurId}/non-lues`),
  marquerLue: (id) =>
    api.put(`/api/notifications/${id}/lu`),
}

// ════════════════════════════════════════════════════════════
// MESSAGES
// ════════════════════════════════════════════════════════════
export const messageAPI = {
  envoyer: (data) =>
    api.post('/api/messages', data),
  getConversation: (conducteurId, avec) =>
    api.get(`/api/messages/${conducteurId}?avec=${avec}`),
  getRecus: (conducteurId) =>
    api.get(`/api/messages/${conducteurId}/recus`),
  marquerLu: (id) =>
    api.put(`/api/messages/${id}/lu`),
}

// ════════════════════════════════════════════════════════════
// SCORES
// ════════════════════════════════════════════════════════════
export const scoreAPI = {
  getActuel: (conducteurId) =>
    api.get(`/api/scores/${conducteurId}/actuel`),
  getHistorique: (conducteurId) =>
    api.get(`/api/scores/${conducteurId}/historique`),
}

export default api