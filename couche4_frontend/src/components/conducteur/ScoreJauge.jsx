/**
 * ScoreJauge — Jauge canvas ultra-professionnelle
 * Double arc, particules, animation d'entrée fluide
 */
import React, { useEffect, useRef, useState } from 'react'

const NIVEAU_CFG = {
  FAIBLE:   {
    color:  '#10B981',
    color2: '#34D399',
    glow:   'rgba(16,185,129,0.55)',
    label:  'Risque Faible',
    bg:     'rgba(16,185,129,0.08)',
  },
  MODERE:   {
    color:  '#EAB308',
    color2: '#FDE047',
    glow:   'rgba(234,179,8,0.55)',
    label:  'Risque Modéré',
    bg:     'rgba(234,179,8,0.08)',
  },
  ELEVE:    {
    color:  '#F97316',
    color2: '#FB923C',
    glow:   'rgba(249,115,22,0.55)',
    label:  'Risque Élevé',
    bg:     'rgba(249,115,22,0.08)',
  },
  CRITIQUE: {
    color:  '#EF4444',
    color2: '#F87171',
    glow:   'rgba(239,68,68,0.65)',
    label:  'Risque Critique',
    bg:     'rgba(239,68,68,0.08)',
  },
}

/* ─── Draw frame ──────────────────────────────────────── */
function drawGauge(canvas, score, niveau, animPct) {
  const ctx    = canvas.getContext('2d')
  const W      = canvas.width
  const H      = canvas.height
  const dpr    = window.devicePixelRatio || 1
  const cx     = W / 2, cy = H / 2
  const R      = Math.min(W, H) / 2 - 22
  const cfg    = NIVEAU_CFG[niveau] || NIVEAU_CFG.FAIBLE
  const pct    = Math.round(score * 100)

  const START  = Math.PI * 0.75
  const SWEEP  = Math.PI * 1.5
  const end    = START + SWEEP * score * animPct

  ctx.clearRect(0, 0, W, H)

  /* ── Fond circulaire ── */
  const bgGrad = ctx.createRadialGradient(
    cx, cy, R * 0.3, cx, cy, R * 1.1
  )
  bgGrad.addColorStop(0, 'rgba(18,18,35,0.0)')
  bgGrad.addColorStop(1, 'rgba(0,0,0,0.12)')
  ctx.beginPath()
  ctx.arc(cx, cy, R + 18, 0, Math.PI * 2)
  ctx.fillStyle = bgGrad
  ctx.fill()

  /* ── Arc fond (piste) ── */
  const drawArc = (r, lw, color, alpha = 1) => {
    ctx.beginPath()
    ctx.arc(cx, cy, r, START, START + SWEEP)
    ctx.strokeStyle = color
    ctx.lineWidth   = lw
    ctx.lineCap     = 'round'
    ctx.globalAlpha = alpha
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  drawArc(R,      18, 'rgba(255,255,255,0.05)')
  drawArc(R - 22, 3,  'rgba(255,255,255,0.03)')

  /* Tirets sur la piste */
  for (let i = 0; i <= 20; i++) {
    const a   = START + (SWEEP / 20) * i
    const r1  = R - 10, r2 = R + 10
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth   = 1
    ctx.stroke()
  }

  /* ── Arc coloré (progression) ── */
  if (score * animPct > 0) {
    /* Glow externe */
    ctx.save()
    ctx.shadowColor = cfg.glow
    ctx.shadowBlur  = 30
    ctx.beginPath()
    ctx.arc(cx, cy, R, START, end)
    const grad = ctx.createLinearGradient(
      cx - R, cy, cx + R, cy
    )
    grad.addColorStop(0,   cfg.color)
    grad.addColorStop(0.5, cfg.color2)
    grad.addColorStop(1,   cfg.color)
    ctx.strokeStyle = grad
    ctx.lineWidth   = 18
    ctx.lineCap     = 'round'
    ctx.stroke()

    /* Double glow */
    ctx.shadowBlur = 50
    ctx.lineWidth  = 6
    ctx.stroke()
    ctx.restore()

    /* Tip lumineux (point d'extrémité) */
    const tipX = cx + Math.cos(end) * R
    const tipY = cy + Math.sin(end) * R
    ctx.save()
    ctx.shadowColor = cfg.color2
    ctx.shadowBlur  = 20
    ctx.beginPath()
    ctx.arc(tipX, tipY, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.restore()
  }

  /* ── Cercle intérieur ── */
  ctx.beginPath()
  ctx.arc(cx, cy, R - 28, 0, Math.PI * 2)
  const innerGrad = ctx.createRadialGradient(
    cx, cy, 0, cx, cy, R - 28
  )
  innerGrad.addColorStop(0, `${cfg.color}08`)
  innerGrad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle   = innerGrad
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx, cy, R - 28, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth   = 1
  ctx.stroke()

  /* ── Texte pourcentage ── */
  const animated = Math.round(pct * animPct)

  /* Ombre texte */
  ctx.save()
  ctx.shadowColor = cfg.glow
  ctx.shadowBlur  = 20
  ctx.fillStyle   = '#F8FAFC'
  ctx.font        = `800 ${W * 0.185}px Inter, system-ui, sans-serif`
  ctx.textAlign   = 'center'
  ctx.textBaseline= 'middle'
  ctx.fillText(`${animated}`, cx, cy - W * 0.055)
  ctx.restore()

  /* Symbole % plus petit */
  ctx.fillStyle   = 'rgba(248,250,252,0.5)'
  ctx.font        = `600 ${W * 0.085}px Inter, system-ui`
  ctx.textAlign   = 'center'
  ctx.fillText('%', cx + W * 0.16, cy - W * 0.08)

  /* Label niveau */
  ctx.fillStyle   = cfg.color
  ctx.font        = `700 ${W * 0.075}px Inter, system-ui`
  ctx.textAlign   = 'center'
  ctx.textBaseline= 'middle'
  ctx.shadowColor = cfg.glow
  ctx.shadowBlur  = 12
  ctx.fillText(niveau, cx, cy + W * 0.11)
  ctx.shadowBlur = 0

  /* Sous-label */
  ctx.fillStyle   = 'rgba(148,163,184,0.5)'
  ctx.font        = `500 ${W * 0.058}px Inter, system-ui`
  ctx.fillText('Score de risque', cx, cy + W * 0.2)
}

/* ─── Composant ───────────────────────────────────────── */
export default function ScoreJauge({ score = 0, niveau = 'FAIBLE' }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const cfg       = NIVEAU_CFG[niveau] || NIVEAU_CFG.FAIBLE
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  /* Animation d'entrée */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !mounted) return

    const duration = 1200
    const start    = performance.now()

    const animate = (now) => {
      const elapsed = now - start
      const raw     = Math.min(elapsed / duration, 1)
      /* easeOutCubic */
      const t = 1 - Math.pow(1 - raw, 3)
      drawGauge(canvas, score, niveau, t)
      if (raw < 1) rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [score, niveau, mounted])

  /* Mini indicateurs bas */
  const indicators = [
    { label: 'Faible',   pct: 0,  color: '#10B981' },
    { label: 'Modéré',  pct: 25, color: '#EAB308' },
    { label: 'Élevé',   pct: 50, color: '#F97316' },
    { label: 'Critique',pct: 75, color: '#EF4444' },
  ]

  return (
    <div className={`
      flex flex-col items-center gap-4
      transition-opacity duration-500
      ${mounted ? 'opacity-100' : 'opacity-0'}
    `}>

      {/* ── Canvas wrapper ── */}
      <div className="relative">
        {/* Halo externe animé */}
        <div
          className="absolute inset-[-12px] rounded-full
            animate-[slowPulse_4s_ease-in-out_infinite]
            pointer-events-none"
          style={{
            background: `radial-gradient(circle,
              ${cfg.bg} 0%, transparent 70%)`,
          }}
        />

        {/* Anneau déco rotatif */}
        <div
          className="absolute inset-[-4px] rounded-full
            pointer-events-none
            animate-[slowSpin_20s_linear_infinite]"
          style={{
            border: `1px dashed ${cfg.color}20`,
          }}
        />

        <canvas
          ref={canvasRef}
          width={240}
          height={240}
          style={{ borderRadius: '50%' }}
        />
      </div>

      {/* ── Scale mini ── */}
      <div className="flex items-center gap-1.5">
        {indicators.map(ind => (
          <div key={ind.label}
            className="flex flex-col items-center gap-1">
            <div
              className="w-2 h-2 rounded-full
                transition-all duration-300"
              style={{
                background: ind.color,
                boxShadow:  `0 0 ${
                  score * 100 >= ind.pct ? '8px' : '0px'
                } ${ind.color}`,
                opacity: score * 100 >= ind.pct ? 1 : 0.25,
              }}
            />
            <span className="text-[9px] text-slate-600
              font-medium">
              {ind.pct}%
            </span>
          </div>
        ))}
      </div>

      {/* ── Label ── */}
      <div
        className="flex items-center gap-2 px-4 py-2
          rounded-xl border text-sm font-bold
          transition-all duration-500"
        style={{
          background:   cfg.bg,
          borderColor:  `${cfg.color}30`,
          color:        cfg.color,
          textShadow:   `0 0 20px ${cfg.glow}`,
        }}
      >
        <div
          className="w-2 h-2 rounded-full
            animate-[subtlePulse_2s_ease-in-out_infinite]"
          style={{
            background: cfg.color,
            boxShadow:  `0 0 8px ${cfg.color}`,
          }}
        />
        {cfg.label}
      </div>
    </div>
  )
}