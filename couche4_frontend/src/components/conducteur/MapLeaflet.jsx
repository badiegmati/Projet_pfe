/**
 * MapLeaflet — Carte GPS professionnelle
 * Clusters, heatmap visuelle, dark theme soigné
 */
import React, { useState, useMemo } from 'react'
import {
  MapContainer, TileLayer, Marker,
  Popup, Circle, Polyline
} from 'react-leaflet'
import L from 'leaflet'
import {
  Map, Layers, Eye, AlertTriangle,
  Navigation, Zap, LocateFixed
} from 'lucide-react'

/* ─── Icônes SVG custom ───────────────────────────────── */
const makeIcon = (color, size = 32, pulse = false) =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;
        height:${size}px;display:flex;
        align-items:center;justify-content:center">
        ${pulse ? `
          <div style="
            position:absolute;inset:0;border-radius:50%;
            background:${color};opacity:0.2;
            animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite
          "></div>
        ` : ''}
        <div style="
          width:${size * 0.75}px;height:${size * 0.75}px;
          background:linear-gradient(135deg,${color}dd,${color});
          border:2.5px solid rgba(255,255,255,0.9);
          border-radius:50%;
          box-shadow:0 2px 12px ${color}66,
                     0 0 0 1px ${color}33;
          display:flex;align-items:center;
          justify-content:center;
        ">
          <div style="
            width:${size * 0.25}px;height:${size * 0.25}px;
            background:white;border-radius:50%;
            opacity:0.95;
          "></div>
        </div>
      </div>
    `,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2)],
  })

const ICONS = {
  CRITIQUE: makeIcon('#EF4444', 36, true),
  ELEVE:    makeIcon('#F97316', 30),
  MODERE:   makeIcon('#EAB308', 26),
  FAIBLE:   makeIcon('#10B981', 24),
}

const COLORS = {
  CRITIQUE: '#EF4444',
  ELEVE:    '#F97316',
  MODERE:   '#EAB308',
  FAIBLE:   '#10B981',
}

/* ─── Légende ─────────────────────────────────────────── */
function Legende({ counts }) {
  const items = [
    { key: 'CRITIQUE', label: 'Critique', color: '#EF4444' },
    { key: 'ELEVE',    label: 'Élevé',    color: '#F97316' },
    { key: 'MODERE',   label: 'Modéré',   color: '#EAB308' },
    { key: 'FAIBLE',   label: 'Faible',   color: '#10B981' },
  ].filter(i => counts[i.key] > 0)

  return (
    <div className="absolute bottom-3 left-3 z-[1000]
      bg-black/80 backdrop-blur-sm rounded-xl
      border border-white/10 px-3 py-2.5
      flex flex-col gap-1.5 shadow-xl">
      {items.map(({ key, label, color }) => (
        <div key={key}
          className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: color,
              boxShadow: `0 0 6px ${color}88`
            }}
          />
          <span className="text-[11px] text-slate-300
            font-medium">
            {label}
          </span>
          <span className="text-[11px] text-slate-500
            ml-auto pl-3 font-mono">
            {counts[key]}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Popup content ───────────────────────────────────── */
function PopupContent({ evt }) {
  const color = COLORS[evt.severite] || COLORS.MODERE
  return (
    <div style={{
      background: '#0f0f1a',
      borderRadius: 12,
      padding: '10px 14px',
      minWidth: 180,
      border: `1px solid ${color}33`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 8, marginBottom: 8
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, boxShadow: `0 0 8px ${color}`,
          flexShrink: 0
        }} />
        <p style={{
          color: '#F1F5F9', fontWeight: 700,
          fontSize: 13, margin: 0
        }}>
          {evt.typeEvenement?.replace(/_/g, ' ')}
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 6
      }}>
        <div style={{
          background: '#ffffff08', borderRadius: 8,
          padding: '5px 8px'
        }}>
          <p style={{ color: '#64748B', fontSize: 10,
            margin: '0 0 2px' }}>Sévérité</p>
          <p style={{ color, fontSize: 12,
            fontWeight: 700, margin: 0 }}>
            {evt.severite}
          </p>
        </div>
        {evt.vitesseKmh && (
          <div style={{
            background: '#ffffff08', borderRadius: 8,
            padding: '5px 8px'
          }}>
            <p style={{ color: '#64748B', fontSize: 10,
              margin: '0 0 2px' }}>Vitesse</p>
            <p style={{ color: '#F1F5F9', fontSize: 12,
              fontWeight: 700, margin: 0 }}>
              {Number(evt.vitesseKmh).toFixed(0)} km/h
            </p>
          </div>
        )}
      </div>

      <p style={{
        color: '#475569', fontSize: 10, marginTop: 8,
        textAlign: 'center'
      }}>
        {new Date(evt.dateHeure).toLocaleString('fr-FR')}
      </p>
    </div>
  )
}

/* ─── Composant principal ─────────────────────────────── */
export default function MapLeaflet({ evenements = [] }) {
  const [showTrajet, setShowTrajet] = useState(false)

  const withGps = useMemo(
    () => evenements.filter(e => e.latitude && e.longitude),
    [evenements]
  )

  const counts = useMemo(() => {
    const c = { CRITIQUE: 0, ELEVE: 0, MODERE: 0, FAIBLE: 0 }
    withGps.forEach(e => { if (c[e.severite] !== undefined) c[e.severite]++ })
    return c
  }, [withGps])

  const center = withGps.length > 0
    ? [withGps[0].latitude, withGps[0].longitude]
    : [36.8065, 10.1815]

  const trajetPoints = useMemo(
    () => withGps.map(e => [e.latitude, e.longitude]),
    [withGps]
  )

  if (!evenements.length) {
    return (
      <div className="flex flex-col items-center justify-center
        h-64 gap-3 rounded-2xl bg-slate-900/60
        border border-white/5">
        <Map size={32} className="text-slate-600" />
        <div className="text-center">
          <p className="text-slate-400 text-sm font-medium">
            Aucune donnée GPS
          </p>
          <p className="text-slate-600 text-xs mt-0.5">
            Les alertes géolocalisées apparaîtront ici
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5
          rounded-xl bg-white/5 border border-white/8">
          <LocateFixed size={12} className="text-blue-400" />
          <span className="text-[11px] text-slate-400 font-medium">
            {withGps.length} alertes GPS
          </span>
        </div>

        <button
          onClick={() => setShowTrajet(p => !p)}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5
            rounded-xl border text-[11px] font-medium
            transition-all duration-200
            ${showTrajet
              ? 'bg-blue-500/20 text-blue-400'
                + ' border-blue-500/30'
              : 'bg-white/5 text-slate-500'
                + ' border-white/8 hover:text-slate-400'}
          `}
        >
          <Navigation size={12} />
          Trajet
        </button>
      </div>

      {/* ── Carte ── */}
      <div className="relative rounded-2xl overflow-hidden
        border border-white/8 shadow-2xl shadow-black/40"
        style={{ height: 320 }}>

        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%',
            background: '#0a0a14' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Trajet */}
          {showTrajet && trajetPoints.length > 1 && (
            <Polyline
              positions={trajetPoints}
              color="#3B82F6"
              weight={2}
              opacity={0.5}
              dashArray="6 4"
            />
          )}

          {/* Marqueurs */}
          {withGps.map(evt => (
            <React.Fragment key={evt.id}>
              <Marker
                position={[evt.latitude, evt.longitude]}
                icon={ICONS[evt.severite] || ICONS.MODERE}
              >
                <Popup
                  className="custom-popup"
                  closeButton={false}
                  offset={[0, -8]}
                >
                  <PopupContent evt={evt} />
                </Popup>
              </Marker>

              {/* Zone critique */}
              {evt.severite === 'CRITIQUE' && (
                <Circle
                  center={[evt.latitude, evt.longitude]}
                  radius={120}
                  pathOptions={{
                    color:       '#EF4444',
                    fillColor:   '#EF4444',
                    fillOpacity: 0.08,
                    weight:      1,
                    dashArray:   '4 4',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Légende */}
        <Legende counts={counts} />

        {/* Vignette bords */}
        <div className="absolute inset-0 pointer-events-none
          rounded-2xl shadow-[inset_0_0_30px_rgba(0,0,0,0.4)]" />
      </div>

      {/* ── CSS popup Leaflet ── */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 12px !important;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: #0f0f1a !important;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}