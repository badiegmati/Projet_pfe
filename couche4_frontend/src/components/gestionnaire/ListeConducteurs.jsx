/**
 * ListeConducteurs — Version Professionnelle
 * Animations fluides, design moderne, micro-interactions
 */
import React, { useState } from 'react'
import {
  User, Car, Wifi, WifiOff,
  AlertTriangle, ChevronRight,
  Activity, Shield, Zap
} from 'lucide-react'
import ScoreBadge from '../common/ScoreBadge'

/* ─── helpers ─────────────────────────────────────────── */
const getNiveau = (score) => {
  const s = parseFloat(score) || 0
  if (s < 0.25) return 'FAIBLE'
  if (s < 0.50) return 'MODERE'
  if (s < 0.75) return 'ELEVE'
  return 'CRITIQUE'
}

const NIVEAU_CONFIG = {
  FAIBLE:   {
    bar:    'from-emerald-400 to-green-500',
    avatar: 'from-emerald-500 to-teal-600',
    glow:   'shadow-emerald-200',
    ring:   'ring-emerald-100',
    text:   'text-emerald-600',
    bg:     'bg-emerald-50',
    pulse:  false,
  },
  MODERE:   {
    bar:    'from-amber-400 to-yellow-500',
    avatar: 'from-amber-500 to-orange-500',
    glow:   'shadow-amber-200',
    ring:   'ring-amber-100',
    text:   'text-amber-600',
    bg:     'bg-amber-50',
    pulse:  false,
  },
  ELEVE:    {
    bar:    'from-orange-400 to-red-400',
    avatar: 'from-orange-500 to-red-500',
    glow:   'shadow-orange-200',
    ring:   'ring-orange-100',
    text:   'text-orange-600',
    bg:     'bg-orange-50',
    pulse:  false,
  },
  CRITIQUE: {
    bar:    'from-red-500 to-rose-600',
    avatar: 'from-red-600 to-rose-700',
    glow:   'shadow-red-300',
    ring:   'ring-red-200',
    text:   'text-red-600',
    bg:     'bg-red-50',
    pulse:  true,
  },
}

/* ─── Skeleton Card ────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl
      bg-white border border-slate-100 p-4 shadow-sm">
      <div className="absolute inset-0 -translate-x-full
        animate-[shimmer_1.5s_infinite]
        bg-gradient-to-r from-transparent
        via-white/60 to-transparent" />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded-full
            w-3/4 animate-pulse" />
          <div className="h-3 bg-slate-100 rounded-full
            w-1/2 animate-pulse" />
          <div className="h-2 bg-slate-100 rounded-full
            w-full animate-pulse mt-3" />
        </div>
      </div>
    </div>
  )
}

/* ─── Conducteur Card ──────────────────────────────────── */
function ConducteurCard({
  conducteur: c,
  index,
  isSelected,
  onSelect,
  onAlerte,
}) {
  const [hovered,  setHovered]  = useState(false)
  const [alerting, setAlerting] = useState(false)

  const score   = parseFloat(c.scoreJournalier) || 0
  const pct     = (score * 100).toFixed(1)
  const niveau  = getNiveau(score)
  const cfg     = NIVEAU_CONFIG[niveau]
  const isCrit  = niveau === 'CRITIQUE'

  const handleAlerte = async (e) => {
    e.stopPropagation()
    setAlerting(true)
    await onAlerte(c)
    setTimeout(() => setAlerting(false), 1500)
  }

  return (
    <div
      onClick={() => onSelect(c)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        animationDelay:    `${index * 60}ms`,
        animationFillMode: 'both',
      }}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer
        border transition-all duration-300 ease-out
        animate-[fadeSlideUp_0.4s_ease-out_both]

        /* ombre dynamique */
        ${isSelected
          ? `border-blue-300 shadow-xl shadow-blue-100
             bg-gradient-to-br from-blue-50 to-indigo-50/60`
          : `border-slate-100 shadow-sm hover:shadow-lg
             hover:shadow-slate-200/80 bg-white
             hover:border-slate-200 hover:-translate-y-0.5`
        }

        /* ring critique */
        ${isCrit && !isSelected
          ? `ring-2 ${cfg.ring} ring-offset-0` : ''}
      `}
    >
      {/* Indicateur latéral gauche */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl
        transition-all duration-300
        bg-gradient-to-b ${cfg.bar}
        ${isSelected ? 'w-1.5' : 'opacity-60 group-hover:opacity-100'}
      `} />

      {/* Fond glow subtil (sélectionné) */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br
          from-blue-500/5 to-indigo-500/5 pointer-events-none" />
      )}

      <div className="pl-4 pr-3 py-3.5 flex items-center gap-3.5">

        {/* ── Avatar ── */}
        <div className={`
          relative w-12 h-12 rounded-xl flex-shrink-0
          flex items-center justify-center
          font-bold text-white text-sm tracking-wide
          bg-gradient-to-br ${cfg.avatar}
          transition-all duration-300
          ${hovered || isSelected
            ? `shadow-lg ${cfg.glow}` : 'shadow-md'}
          ${isCrit ? 'animate-[subtlePulse_2s_ease-in-out_infinite]' : ''}
        `}>
          {c.prenom?.[0]}{c.nom?.[0]}

          {/* Badge en ligne */}
          <span className={`
            absolute -bottom-1 -right-1 w-3.5 h-3.5
            rounded-full border-2 border-white
            transition-colors duration-300
            ${c.enLigne
              ? 'bg-emerald-400 shadow-sm shadow-emerald-200'
              : 'bg-slate-300'}
          `}>
            {c.enLigne && (
              <span className="absolute inset-0 rounded-full
                bg-emerald-400 animate-ping opacity-75" />
            )}
          </span>
        </div>

        {/* ── Infos ── */}
        <div className="flex-1 min-w-0">

          {/* Ligne 1 : nom + ID */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`
              font-semibold text-sm leading-tight truncate
              transition-colors duration-200
              ${isSelected ? 'text-blue-700' : 'text-slate-800'}
            `}>
              {c.prenom} {c.nom}
            </p>
            <span className="text-[10px] text-slate-400
              bg-slate-100 px-1.5 py-0.5 rounded-md
              font-mono tracking-wide flex-shrink-0">
              {c.id}
            </span>
          </div>

          {/* Ligne 2 : véhicule + statut */}
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1
              text-[11px] text-slate-400">
              <Car size={11} />
              <span className="truncate max-w-[100px]">
                {c.nomVehicule}
              </span>
            </span>

            {c.enLigne ? (
              <span className="flex items-center gap-1
                text-[11px] text-emerald-600 font-medium">
                <Activity size={10} className="animate-pulse" />
                En ligne
              </span>
            ) : (
              <span className="flex items-center gap-1
                text-[11px] text-slate-400">
                <WifiOff size={10} /> Hors ligne
              </span>
            )}
          </div>

          {/* Ligne 3 : barre de score */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100
              rounded-full overflow-hidden">
              <div
                className={`
                  h-full rounded-full
                  bg-gradient-to-r ${cfg.bar}
                  transition-all duration-700 ease-out
                `}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`
              text-[11px] font-bold tabular-nums ${cfg.text}
            `}>
              {pct}%
            </span>
          </div>
        </div>

        {/* ── Actions droite ── */}
        <div className="flex flex-col items-center
          gap-2 flex-shrink-0 ml-1">

          <ScoreBadge niveau={niveau} score={score} size="sm" />

          {isCrit ? (
            <button
              onClick={handleAlerte}
              className={`
                relative flex items-center gap-1
                text-white text-[11px] font-semibold
                px-2.5 py-1.5 rounded-lg overflow-hidden
                transition-all duration-200
                ${alerting
                  ? 'bg-emerald-500 scale-95'
                  : 'bg-gradient-to-r from-red-500 to-rose-500'
                    + ' hover:from-red-600 hover:to-rose-600'
                    + ' hover:scale-105 active:scale-95'
                    + ' shadow-md shadow-red-200'
                }
              `}
            >
              {alerting ? (
                <span className="flex items-center gap-1">
                  <Zap size={11} /> Envoyé !
                </span>
              ) : (
                <>
                  <AlertTriangle size={11}
                    className="animate-bounce" />
                  Alerte
                </>
              )}
            </button>
          ) : (
            <ChevronRight
              size={16}
              className={`
                transition-all duration-200
                ${isSelected
                  ? 'rotate-90 text-blue-400'
                  : 'text-slate-200 group-hover:text-slate-400'
                    + ' group-hover:translate-x-0.5'}
              `}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Liste principale ─────────────────────────────────── */
export default function ListeConducteurs({
  conducteurs = [],
  onSelect,
  onAlerte,
  selected,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {[...Array(5)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!conducteurs.length) {
    return (
      <div className="flex flex-col items-center
        justify-center py-20 animate-[fadeIn_0.4s_ease]">
        <div className="w-20 h-20 rounded-2xl bg-slate-100
          flex items-center justify-center mb-4
          shadow-inner">
          <User size={36} className="text-slate-300" />
        </div>
        <p className="font-semibold text-slate-500">
          Aucun conducteur
        </p>
        <p className="text-sm text-slate-400 mt-1 text-center
          max-w-[200px]">
          Créez votre premier conducteur pour commencer
        </p>
      </div>
    )
  }

  /* tri : critique en tête */
  const sorted = [...conducteurs].sort(
    (a, b) => parseFloat(b.scoreJournalier || 0)
             - parseFloat(a.scoreJournalier || 0)
  )

  return (
    <div className="space-y-2.5">
      {sorted.map((c, i) => (
        <ConducteurCard
          key={c.id}
          conducteur={c}
          index={i}
          isSelected={selected === c.id}
          onSelect={onSelect}
          onAlerte={onAlerte}
        />
      ))}
    </div>
  )
}