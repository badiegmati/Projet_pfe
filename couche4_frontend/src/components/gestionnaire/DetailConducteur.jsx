/**
 * DetailConducteur — Panneau détail conducteur Pro
 * Drawer animé, onglets stylisés, contenu enrichi
 */
import React, { useState, useEffect, useRef } from 'react'
import {
  X, Shield, Activity, Map, BarChart2,
  Phone, Mail, Car, Wifi, WifiOff,
  TrendingUp, TrendingDown, Minus,
  AlertTriangle, ChevronLeft, Zap,
} from 'lucide-react'
import { conducteurAPI, scoreAPI } from '../../api/apiService'
import ScoreJauge           from '../conducteur/ScoreJauge'
import GraphiqueScore       from '../conducteur/GraphiqueScore'
import HistoriqueEvenements from '../conducteur/HistoriqueEvenements'
import MapLeaflet           from '../conducteur/MapLeaflet'
import ScoreBadge           from '../common/ScoreBadge'
import LoadingSpinner       from '../common/LoadingSpinner'

/* ─── Config onglets ───────────────────────────────────── */
const ONGLETS = [
  { id: 'score',      label: 'Score',      icon: Shield   },
  { id: 'historique', label: 'Historique', icon: Activity },
  { id: 'carte',      label: 'Carte',      icon: Map      },
  { id: 'stats',      label: 'Stats',      icon: BarChart2 },
]

const NIVEAU_GRADIENT = {
  FAIBLE:   'from-emerald-600 to-teal-700',
  MODERE:   'from-amber-500  to-orange-600',
  ELEVE:    'from-orange-500 to-red-600',
  CRITIQUE: 'from-red-600    to-rose-800',
}

/* ─── Mini stat card ───────────────────────────────────── */
function StatCard({ label, value, color = 'slate', highlight }) {
  const colors = {
    blue:   'bg-blue-50   border-blue-100   text-blue-700',
    red:    'bg-red-50    border-red-100    text-red-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    slate:  'bg-slate-50  border-slate-100  text-slate-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    green:  'bg-green-50  border-green-100  text-green-700',
  }
  return (
    <div className={`
      p-3 rounded-xl border text-center
      transition-all duration-200 hover:scale-105
      ${colors[color]}
      ${highlight ? 'shadow-md' : ''}
    `}>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[11px] font-medium mt-0.5 opacity-70">
        {label}
      </p>
    </div>
  )
}

/* ─── Skeleton sections ────────────────────────────────── */
function ContentSkeleton() {
  return (
    <div className="p-5 space-y-4 animate-pulse">
      <div className="h-40 bg-slate-100 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/* ─── Composant principal ──────────────────────────────── */
export default function DetailConducteur({ conducteur, onClose }) {
  const [onglet,     setOnglet]     = useState('score')
  const [score,      setScore]      = useState(null)
  const [historique, setHistorique] = useState([])
  const [evenements, setEvenements] = useState([])
  const [tableau,    setTableau]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [visible,    setVisible]    = useState(false)
  const panelRef = useRef(null)

  /* Animation d'entrée */
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  /* Chargement données */
  useEffect(() => {
    if (!conducteur) return
    setLoading(true)
    setOnglet('score')

    Promise.allSettled([
      scoreAPI.getActuel(conducteur.id),
      scoreAPI.getHistorique(conducteur.id),
      conducteurAPI.getEvenements(conducteur.id),
      conducteurAPI.getTableauBord(conducteur.id),
    ]).then(([s, h, e, t]) => {
      if (s.status === 'fulfilled') setScore(s.value.data)
      if (h.status === 'fulfilled') setHistorique(h.value.data || [])
      if (e.status === 'fulfilled') setEvenements(e.value.data || [])
      if (t.status === 'fulfilled') setTableau(t.value.data)
      setLoading(false)
    })
  }, [conducteur?.id])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 320)
  }

  if (!conducteur) return null

  const scoreVal = parseFloat(conducteur.scoreJournalier) || 0
  const niveau   = score?.niveauRisque
    || (scoreVal < 0.25 ? 'FAIBLE'
      : scoreVal < 0.50 ? 'MODERE'
      : scoreVal < 0.75 ? 'ELEVE'
      : 'CRITIQUE')

  const gradient    = NIVEAU_GRADIENT[niveau]
  const isCritique  = niveau === 'CRITIQUE'

  /* Tendance score */
  const getTendance = () => {
    if (historique.length < 2) return null
    const last = historique.at(-1)?.score || 0
    const prev = historique.at(-2)?.score || 0
    if (last > prev) return { icon: TrendingUp,   color: 'text-red-400',   label: '+' + ((last - prev) * 100).toFixed(1) + '%' }
    if (last < prev) return { icon: TrendingDown, color: 'text-green-400', label: '-' + ((prev - last) * 100).toFixed(1) + '%' }
    return { icon: Minus, color: 'text-slate-400', label: 'Stable' }
  }
  const tendance = getTendance()

  return (
    <>
      {/* ── Overlay ── */}
      <div
        onClick={handleClose}
        className={`
          fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]
          transition-opacity duration-300
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* ── Drawer ── */}
      <div
        ref={panelRef}
        className={`
          fixed top-0 right-0 bottom-0 z-50
          w-full max-w-[520px]
          flex flex-col bg-white shadow-2xl
          transition-transform duration-300 ease-out
          ${visible ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* ════ En-tête ════ */}
        <div className={`
          relative flex-shrink-0 bg-gradient-to-br ${gradient}
          text-white overflow-hidden
        `}>
          {/* Motif décoratif */}
          <div className="absolute -top-8 -right-8 w-40 h-40
            rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-12 -left-4 w-32 h-32
            rounded-full bg-black/10 pointer-events-none" />

          <div className="relative p-5">
            {/* Barre top */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 text-white/70
                  hover:text-white text-sm font-medium
                  transition-colors duration-150 group"
              >
                <ChevronLeft size={18}
                  className="group-hover:-translate-x-0.5
                    transition-transform duration-150" />
                Retour
              </button>

              <div className="flex items-center gap-2">
                {isCritique && (
                  <span className="flex items-center gap-1
                    bg-white/20 text-white text-xs font-bold
                    px-2 py-1 rounded-lg
                    animate-[subtlePulse_2s_infinite]">
                    <AlertTriangle size={11} />
                    CRITIQUE
                  </span>
                )}
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-white/20 rounded-xl
                    transition-all duration-150 hover:rotate-90"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Identité */}
            <div className="flex items-center gap-4">
              {/* Avatar large */}
              <div className={`
                relative w-16 h-16 rounded-2xl
                bg-white/20 backdrop-blur-sm
                flex items-center justify-center
                text-2xl font-bold tracking-tight
                shadow-xl ring-2 ring-white/30
                flex-shrink-0
              `}>
                {conducteur.prenom?.[0]}{conducteur.nom?.[0]}
                <span className={`
                  absolute -bottom-1 -right-1
                  w-4 h-4 rounded-full border-2 border-white
                  ${conducteur.enLigne
                    ? 'bg-emerald-400' : 'bg-slate-400'}
                `}>
                  {conducteur.enLigne && (
                    <span className="absolute inset-0 rounded-full
                      bg-emerald-400 animate-ping opacity-60" />
                  )}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold leading-tight">
                  {conducteur.prenom} {conducteur.nom}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-white/60 text-xs
                    font-mono bg-white/10 px-2 py-0.5 rounded-md">
                    {conducteur.id}
                  </span>
                  <ScoreBadge
                    niveau={niveau} score={scoreVal} size="sm"
                    className="!bg-white/20 !text-white !border-white/30"
                  />
                  {tendance && (
                    <span className={`flex items-center gap-0.5
                      text-xs font-medium ${tendance.color}
                      bg-white/10 px-1.5 py-0.5 rounded-md`}>
                      <tendance.icon size={11} />
                      {tendance.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Infos contact */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5
              mt-4 text-[12px] text-white/75">
              <span className="flex items-center gap-1.5">
                <Car size={12} />
                {conducteur.nomVehicule || '—'}
              </span>
              {conducteur.telephone && (
                <a href={`tel:${conducteur.telephone}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5
                    hover:text-white transition-colors">
                  <Phone size={12} />
                  {conducteur.telephone}
                </a>
              )}
              {conducteur.email && (
                <a href={`mailto:${conducteur.email}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5
                    hover:text-white transition-colors truncate
                    max-w-[180px]">
                  <Mail size={12} />
                  {conducteur.email}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                {conducteur.enLigne
                  ? <><Wifi size={12} className="text-emerald-300" />
                      <span className="text-emerald-300">En ligne</span></>
                  : <><WifiOff size={12} />Hors ligne</>
                }
              </span>
            </div>
          </div>

          {/* Barre score visuelle */}
          <div className="h-1 bg-black/20">
            <div
              className="h-full bg-white/60 transition-all
                duration-1000 ease-out"
              style={{ width: `${(scoreVal * 100).toFixed(1)}%` }}
            />
          </div>
        </div>

        {/* ════ Onglets ════ */}
        <div className="flex-shrink-0 flex bg-white
          border-b border-slate-100 shadow-sm">
          {ONGLETS.map(o => {
            const Icon    = o.icon
            const isActive = onglet === o.id
            return (
              <button
                key={o.id}
                onClick={() => setOnglet(o.id)}
                className={`
                  relative flex-1 flex flex-col items-center
                  gap-1 py-3 text-[11px] font-semibold
                  transition-all duration-200
                  ${isActive
                    ? 'text-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                  }
                `}
              >
                <Icon
                  size={16}
                  className={`transition-transform duration-200
                    ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                />
                {o.label}

                {/* Indicateur actif */}
                <span className={`
                  absolute bottom-0 left-1/2 -translate-x-1/2
                  h-0.5 rounded-full bg-blue-500
                  transition-all duration-300
                  ${isActive ? 'w-8' : 'w-0'}
                `} />
              </button>
            )
          })}
        </div>

        {/* ════ Contenu scrollable ════ */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading ? <ContentSkeleton /> : (
            <div className="p-5 space-y-4
              animate-[fadeIn_0.25s_ease]">

              {/* ── Score ── */}
              {onglet === 'score' && (
                <>
                  <div className="flex justify-center py-6
                    bg-gradient-to-b from-slate-50 to-white
                    rounded-2xl border border-slate-100">
                    <ScoreJauge score={scoreVal} niveau={niveau} />
                  </div>

                  {score && (
                    <>
                      <p className="text-xs font-semibold
                        text-slate-400 uppercase tracking-wider">
                        Détail des infractions
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { label: 'Fatigue',      val: score.nbFatigue,     color: 'orange' },
                          { label: 'Téléphone',    val: score.nbTelephone,   color: 'red'    },
                          { label: 'Ceinture',     val: score.nbCeinture,    color: 'orange' },
                          { label: 'Tabagisme',    val: score.nbTabagisme,   color: 'slate'  },
                          { label: 'Distraction',  val: score.nbDistraction, color: 'orange' },
                          { label: 'FCW',          val: score.nbFcw,         color: 'red'    },
                          { label: 'LDW',          val: score.nbLdw,         color: 'slate'  },
                          { label: 'Total',        val: score.nbTotal,
                            color: 'blue', highlight: true },
                        ].map(item => (
                          <StatCard key={item.label} {...item}
                            value={item.val ?? 0} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── Historique ── */}
              {onglet === 'historique' && (
                <>
                  <div className="flex items-center
                    justify-between">
                    <h3 className="font-semibold text-slate-700">
                      Événements récents
                    </h3>
                    <span className="text-xs font-semibold
                      text-slate-500 bg-slate-100 px-2.5 py-1
                      rounded-full">
                      {evenements.length} événement
                      {evenements.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <HistoriqueEvenements
                    evenements={evenements.slice(0, 20)}
                    compact
                  />
                  {evenements.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <Activity size={36}
                        className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Aucun événement enregistré</p>
                    </div>
                  )}
                </>
              )}

              {/* ── Carte ── */}
              {onglet === 'carte' && (
                <>
                  <div className="flex items-center
                    justify-between">
                    <h3 className="font-semibold text-slate-700">
                      Localisation des alertes
                    </h3>
                    <span className="flex items-center gap-1
                      text-xs text-slate-500 bg-slate-100
                      px-2.5 py-1 rounded-full font-semibold">
                      <Zap size={11} className="text-amber-500" />
                      {evenements.filter(e => e.latitude).length} géo
                    </span>
                  </div>
                  <div className="rounded-2xl overflow-hidden
                    border border-slate-100 shadow-sm">
                    <MapLeaflet evenements={evenements} />
                  </div>
                  <p className="text-center text-[11px]
                    text-slate-400">
                    {evenements.filter(e => e.latitude).length} alertes
                    géolocalisées sur {evenements.length} total
                  </p>
                </>
              )}

              {/* ── Statistiques ── */}
              {onglet === 'stats' && (
                <>
                  {tableau ? (
                    <>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-gradient-to-br
                          from-blue-500 to-blue-700
                          p-4 rounded-2xl text-white shadow-lg
                          shadow-blue-200 col-span-2 flex
                          items-center gap-4">
                          <div>
                            <p className="text-4xl font-black
                              tabular-nums">
                              {((scoreVal) * 100).toFixed(0)}
                              <span className="text-xl
                                text-blue-200">%</span>
                            </p>
                            <p className="text-blue-200
                              text-sm font-medium mt-0.5">
                              Score de risque actuel
                            </p>
                          </div>
                          <div className="ml-auto">
                            <ScoreBadge
                              niveau={niveau}
                              score={scoreVal}
                            />
                          </div>
                        </div>

                        <StatCard
                          label="Alertes DMS (7j)"
                          value={tableau.dms?.totalDms || 0}
                          color="blue"
                        />
                        <StatCard
                          label="Alertes ADAS (7j)"
                          value={tableau.adas?.totalAdas || 0}
                          color="purple"
                        />
                        <StatCard
                          label="Aujourd'hui"
                          value={tableau.evenementsAujourdhui || 0}
                          color="green"
                        />
                        <StatCard
                          label="Total global"
                          value={tableau.totalEvenements || 0}
                          color="slate"
                        />
                      </div>

                      <div className="mt-2">
                        <p className="text-xs font-semibold
                          text-slate-400 uppercase tracking-wider mb-3">
                          Évolution du score — 7 derniers jours
                        </p>
                        <div className="bg-slate-50 rounded-2xl
                          border border-slate-100 p-3">
                          <GraphiqueScore historique={historique} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <BarChart2 size={36}
                        className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">
                        Données statistiques indisponibles
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}