/**
 * HistoriqueEvenements — Liste des événements DMS/ADAS Pro
 * Groupement par date, filtres, animations séquentielles
 */
import React, { useState, useMemo } from 'react'
import {
  AlertTriangle, Eye, Phone, Cigarette,
  UserX, Navigation, Car, Clock,
  MapPin, Gauge, Filter, ChevronDown,
  Activity, Zap
} from 'lucide-react'

/* ─── Config types ────────────────────────────────────── */
const TYPE_CFG = {
  FATIGUE_EYES_CLOSED: { icon: Eye,         label: 'Yeux fermés',      cat: 'DMS',  emoji: '😴' },
  FATIGUE_EYES_DROWSY: { icon: Eye,         label: 'Somnolence',       cat: 'DMS',  emoji: '😪' },
  FATIGUE_YAWN:        { icon: Eye,         label: 'Baillement',       cat: 'DMS',  emoji: '🥱' },
  FATIGUE_DROP:        { icon: Eye,         label: 'Tête tombante',    cat: 'DMS',  emoji: '😵' },
  DISTRACTION:         { icon: Eye,         label: 'Distraction',      cat: 'DMS',  emoji: '👁' },
  PHONE:               { icon: Phone,       label: 'Téléphone',        cat: 'DMS',  emoji: '📱' },
  SMOKING:             { icon: Cigarette,   label: 'Tabagisme',        cat: 'DMS',  emoji: '🚬' },
  SEATBELT:            { icon: UserX,       label: 'Ceinture absente', cat: 'DMS',  emoji: '🔓' },
  FCW_WARNING:         { icon: Car,         label: 'Alerte collision', cat: 'ADAS', emoji: '⚠️' },
  FCW_DANGER:          { icon: Car,         label: 'Danger collision', cat: 'ADAS', emoji: '🚨' },
  LDW_LEFT:            { icon: Navigation,  label: 'Sortie voie G',   cat: 'ADAS', emoji: '↙️' },
  LDW_RIGHT:           { icon: Navigation,  label: 'Sortie voie D',   cat: 'ADAS', emoji: '↘️' },
}

const SEVERITE_CFG = {
  CRITIQUE: {
    dot:    'bg-red-500',
    icon:   'bg-red-500/15 text-red-400 border border-red-500/20',
    badge:  'bg-red-500/10 text-red-400 border border-red-500/20',
    glow:   'shadow-red-500/10',
    ring:   'ring-1 ring-red-500/15',
    label:  'Critique',
  },
  ELEVE: {
    dot:    'bg-orange-500',
    icon:   'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    badge:  'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    glow:   'shadow-orange-500/10',
    ring:   'ring-1 ring-orange-500/15',
    label:  'Élevé',
  },
  MODERE: {
    dot:    'bg-amber-500',
    icon:   'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    badge:  'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    glow:   '',
    ring:   '',
    label:  'Modéré',
  },
  FAIBLE: {
    dot:    'bg-emerald-500',
    icon:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    badge:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    glow:   '',
    ring:   '',
    label:  'Faible',
  },
}

/* ─── Helpers ─────────────────────────────────────────── */
const formatDate = (dt) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const formatDateGroup = (dt) => {
  if (!dt) return '—'
  const d = new Date(dt)
  const today     = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString())
    return "Aujourd'hui"
  if (d.toDateString() === yesterday.toDateString())
    return 'Hier'
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

/* ─── Event Row ───────────────────────────────────────── */
function EventRow({ evt, index, compact }) {
  const [expanded, setExpanded] = useState(false)

  const cfg   = TYPE_CFG[evt.typeEvenement] || {
    icon: AlertTriangle, label: evt.typeEvenement,
    cat: 'DMS', emoji: '⚡'
  }
  const sevCfg = SEVERITE_CFG[evt.severite] || SEVERITE_CFG.MODERE
  const Icon   = cfg.icon
  const isCrit = evt.severite === 'CRITIQUE'

  const hasDetails = !compact && (
    evt.dureeSecondes || evt.vitesseKmh ||
    evt.latitude || evt.longitude
  )

  return (
    <div
      className={`
        group relative overflow-hidden rounded-xl
        border border-white/5 bg-white/[0.03]
        hover:bg-white/[0.06] hover:border-white/10
        transition-all duration-250 cursor-pointer
        ${isCrit ? sevCfg.ring : ''}
        ${isCrit ? `shadow-lg ${sevCfg.glow}` : ''}
        animate-[fadeSlideIn_0.3s_ease_both]
      `}
      style={{ animationDelay: `${index * 35}ms` }}
      onClick={() => hasDetails && setExpanded(p => !p)}
    >
      {/* Barre latérale sévérité */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-0.5 rounded-full
        ${sevCfg.dot}
        ${isCrit ? 'opacity-100' : 'opacity-60'}
      `} />

      <div className="pl-3 pr-3 py-3 flex items-start gap-3">

        {/* ── Icône ── */}
        <div className={`
          w-9 h-9 rounded-xl flex items-center
          justify-center flex-shrink-0 text-base
          ${sevCfg.icon}
          ${isCrit
            ? 'animate-[subtlePulse_3s_ease-in-out_infinite]' : ''}
        `}>
          <Icon size={16} />
        </div>

        {/* ── Contenu ── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-200
              leading-tight">
              {cfg.label}
            </span>

            {/* Cat badge */}
            <span className={`
              text-[10px] px-1.5 py-0.5 rounded-md
              font-bold tracking-wide
              ${cfg.cat === 'ADAS'
                ? 'bg-purple-500/15 text-purple-400'
                : 'bg-blue-500/15 text-blue-400'}
            `}>
              {cfg.cat}
            </span>

            {/* Sévérité badge */}
            <span className={`
              text-[10px] px-1.5 py-0.5 rounded-md
              font-semibold ${sevCfg.badge}
            `}>
              {sevCfg.label}
            </span>
          </div>

          {/* Ligne métadonnées */}
          <div className="flex flex-wrap items-center gap-x-3
            gap-y-0.5 mt-1.5">
            <span className="flex items-center gap-1
              text-[11px] text-slate-500">
              <Clock size={10} />
              {formatDate(evt.dateHeure)}
            </span>
            {evt.vitesseKmh && (
              <span className="flex items-center gap-1
                text-[11px] text-slate-500">
                <Gauge size={10} />
                {Number(evt.vitesseKmh).toFixed(0)} km/h
              </span>
            )}
            {evt.latitude && (
              <span className="flex items-center gap-1
                text-[11px] text-slate-500">
                <MapPin size={10} />
                GPS
              </span>
            )}
          </div>

          {/* Détails expandables */}
          {expanded && hasDetails && (
            <div className="mt-2.5 pt-2.5 border-t border-white/5
              grid grid-cols-2 gap-2
              animate-[fadeIn_0.2s_ease]">
              {evt.dureeSecondes > 0 && (
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-500">Durée</p>
                  <p className="text-sm font-bold text-slate-200">
                    {Number(evt.dureeSecondes).toFixed(1)}s
                  </p>
                </div>
              )}
              {evt.vitesseKmh && (
                <div className="bg-white/5 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-500">Vitesse</p>
                  <p className="text-sm font-bold text-slate-200">
                    {Number(evt.vitesseKmh).toFixed(0)} km/h
                  </p>
                </div>
              )}
              {evt.latitude && evt.longitude && (
                <div className="bg-white/5 rounded-lg px-3 py-2
                  col-span-2">
                  <p className="text-[10px] text-slate-500">
                    Coordonnées
                  </p>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">
                    {Number(evt.latitude).toFixed(5)},
                    {Number(evt.longitude).toFixed(5)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expand indicator */}
        {hasDetails && (
          <ChevronDown
            size={14}
            className={`
              flex-shrink-0 mt-1 text-slate-600
              transition-transform duration-200
              group-hover:text-slate-400
              ${expanded ? 'rotate-180' : ''}
            `}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Date Group ──────────────────────────────────────── */
function DateGroup({ dateLabel, events, compact }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 mt-1">
        <span className="text-[11px] font-semibold text-slate-500
          uppercase tracking-wider capitalize">
          {dateLabel}
        </span>
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-[10px] text-slate-600 font-medium
          bg-white/5 px-2 py-0.5 rounded-full">
          {events.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {events.map((evt, i) => (
          <EventRow key={evt.id} evt={evt}
            index={i} compact={compact} />
        ))}
      </div>
    </div>
  )
}

/* ─── Filtre chip ─────────────────────────────────────── */
function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-xl
        text-xs font-semibold transition-all duration-200
        ${active
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : 'bg-white/5 text-slate-500 border border-white/5'
            + ' hover:bg-white/8 hover:text-slate-400'}
      `}
    >
      {label}
      <span className={`
        px-1.5 py-0.5 rounded-md text-[10px] font-bold
        ${active ? 'bg-blue-500/20' : 'bg-white/10'}
      `}>
        {count}
      </span>
    </button>
  )
}

/* ─── Composant principal ─────────────────────────────── */
export default function HistoriqueEvenements({
  evenements = [],
  compact    = false,
}) {
  const [filtre, setFiltre] = useState('TOUS')

  const filtres = useMemo(() => ({
    TOUS:     evenements,
    DMS:      evenements.filter(e =>
      (TYPE_CFG[e.typeEvenement]?.cat || 'DMS') === 'DMS'),
    ADAS:     evenements.filter(e =>
      TYPE_CFG[e.typeEvenement]?.cat === 'ADAS'),
    CRITIQUE: evenements.filter(e => e.severite === 'CRITIQUE'),
  }), [evenements])

  const displayed  = filtres[filtre] || []

  /* Groupement par date */
  const groupes = useMemo(() => {
    const map = {}
    displayed.forEach(evt => {
      const key = evt.dateHeure
        ? new Date(evt.dateHeure).toDateString()
        : 'unknown'
      if (!map[key]) map[key] = {
        label: formatDateGroup(evt.dateHeure),
        events: []
      }
      map[key].events.push(evt)
    })
    return Object.values(map)
  }, [displayed])

  if (!evenements.length) {
    return (
      <div className="flex flex-col items-center justify-center
        py-16 gap-4 animate-[fadeIn_0.4s_ease]">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl
            bg-slate-800/80 border border-white/5
            flex items-center justify-center">
            <Activity size={28} className="text-slate-600" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5
            rounded-full bg-slate-700 border border-black/20
            flex items-center justify-center">
            <Zap size={11} className="text-slate-500" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-400">
            Aucun événement détecté
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Les événements DMS/ADAS apparaîtront ici
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {/* ── Filtres ── */}
      {!compact && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-slate-600" />
          {Object.entries(filtres).map(([key, arr]) => (
            <FilterChip
              key={key}
              label={key === 'TOUS' ? 'Tous' : key}
              active={filtre === key}
              count={arr.length}
              onClick={() => setFiltre(key)}
            />
          ))}
        </div>
      )}

      {/* ── Liste groupée ── */}
      <div className="space-y-4">
        {groupes.map((g, i) => (
          <DateGroup key={i} dateLabel={g.label}
            events={g.events} compact={compact} />
        ))}
      </div>

      {/* ── Footer ── */}
      {displayed.length > 0 && (
        <p className="text-center text-[11px] text-slate-600 pt-2">
          {displayed.length} événement
          {displayed.length > 1 ? 's' : ''} affiché
          {displayed.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}