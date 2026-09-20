/**
 * GraphiqueScore — Graphique d'évolution du score
 * Design glassmorphism + animations fluides
 */
import React, { useRef, useEffect, useState } from 'react'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { TrendingUp, TrendingDown, Minus, BarChart2 } from 'lucide-react'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler
)

/* ─── Plugin annotation zones risque ─────────────────── */
const zonePlugin = {
  id: 'riskZones',
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart
    if (!chartArea) return
    const { top, bottom, left, right } = chartArea

    const zones = [
      { min: 0,  max: 25, color: 'rgba(16,185,129,0.04)'  },
      { min: 25, max: 50, color: 'rgba(234,179,8,0.04)'   },
      { min: 50, max: 75, color: 'rgba(249,115,22,0.05)'  },
      { min: 75, max: 100,color: 'rgba(239,68,68,0.06)'   },
    ]

    zones.forEach(({ min, max, color }) => {
      const y1 = scales.y.getPixelForValue(max)
      const y2 = scales.y.getPixelForValue(min)
      ctx.save()
      ctx.fillStyle = color
      ctx.fillRect(left, y1, right - left, y2 - y1)
      ctx.restore()
    })
  }
}

/* ─── Helpers ─────────────────────────────────────────── */
const getColor = (val) => {
  if (val < 25) return { line: '#10B981', glow: 'rgba(16,185,129,0.6)'  }
  if (val < 50) return { line: '#EAB308', glow: 'rgba(234,179,8,0.6)'   }
  if (val < 75) return { line: '#F97316', glow: 'rgba(249,115,22,0.6)'  }
  return           { line: '#EF4444', glow: 'rgba(239,68,68,0.6)'   }
}

const getTrend = (scores) => {
  if (scores.length < 2) return null
  const diff = scores.at(-1) - scores.at(-2)
  if (diff > 2)  return { icon: TrendingUp,   color: 'text-red-400',   bg: 'bg-red-500/10',   label: `+${diff.toFixed(1)}%` }
  if (diff < -2) return { icon: TrendingDown, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: `${diff.toFixed(1)}%` }
  return           { icon: Minus,       color: 'text-slate-400',  bg: 'bg-slate-500/10',  label: 'Stable' }
}

/* ─── Mini stat pill ──────────────────────────────────── */
function Pill({ label, value, color }) {
  return (
    <div className={`flex flex-col items-center px-3 py-1.5
      rounded-xl ${color} gap-0.5`}>
      <span className="text-[10px] text-slate-400 font-medium">
        {label}
      </span>
      <span className="text-sm font-bold text-slate-200
        tabular-nums">
        {value}
      </span>
    </div>
  )
}

/* ─── Composant principal ─────────────────────────────── */
export default function GraphiqueScore({ historique = [] }) {
  const chartRef   = useRef(null)
  const [ready,    setReady]   = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80)
    return () => clearTimeout(t)
  }, [])

  if (!historique.length) {
    return (
      <div className="flex flex-col items-center justify-center
        h-48 gap-3 animate-[fadeIn_0.3s_ease]">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60
          flex items-center justify-center
          border border-white/5">
          <BarChart2 size={24} className="text-slate-600" />
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm font-medium">
            Aucun historique disponible
          </p>
          <p className="text-slate-600 text-xs mt-0.5">
            Les données apparaîtront après quelques jours
          </p>
        </div>
      </div>
    )
  }

  /* ── Données ── */
  const labels = [...historique]
    .reverse()
    .map(s => new Date(s.dateCalcul).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit'
    }))

  const scores = [...historique]
    .reverse()
    .map(s => +(s.scoreValeur * 100).toFixed(1))

  const avg    = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
  const maxVal = Math.max(...scores).toFixed(1)
  const minVal = Math.min(...scores).toFixed(1)
  const trend  = getTrend(scores)
  const last   = scores.at(-1) || 0
  const lastCfg = getColor(last)

  /* ── Dataset ── */
  const data = {
    labels,
    datasets: [{
      label: 'Score',
      data:  scores,
      fill:  true,
      backgroundColor: (ctx) => {
        const chart = ctx.chart
        const { ctx: c, chartArea } = chart
        if (!chartArea) return 'transparent'
        const grad = c.createLinearGradient(
          0, chartArea.top, 0, chartArea.bottom
        )
        grad.addColorStop(0,   lastCfg.glow.replace('0.6', '0.18'))
        grad.addColorStop(0.5, lastCfg.glow.replace('0.6', '0.06'))
        grad.addColorStop(1,   'transparent')
        return grad
      },
      borderColor:      lastCfg.line,
      borderWidth:      2.5,
      pointBackgroundColor: scores.map(v => getColor(v).line),
      pointBorderColor:     '#0f0f1a',
      pointBorderWidth:     2,
      pointRadius:          5,
      pointHoverRadius:     8,
      pointHoverBorderWidth:  3,
      pointHoverBorderColor:  '#fff',
      tension: 0.42,
    }],
  }

  const options = {
    responsive:          true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing:   'easeInOutCubic',
    },
    interaction: {
      mode:      'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor:   'rgba(10,10,20,0.92)',
        borderColor:       `${lastCfg.line}55`,
        borderWidth:       1,
        titleColor:        '#94A3B8',
        bodyColor:         '#F1F5F9',
        padding:           { x: 14, y: 10 },
        cornerRadius:      12,
        displayColors:     false,
        titleFont:         { size: 11, weight: '500' },
        bodyFont:          { size: 14, weight: '700' },
        callbacks: {
          title: (items) => `📅 ${items[0].label}`,
          label: (ctx)   => `  Score : ${ctx.raw}%`,
          afterLabel: (ctx) => {
            const c = getColor(ctx.raw)
            const niveaux = ['FAIBLE','MODÉRÉ','ÉLEVÉ','CRITIQUE']
            const n = ctx.raw < 25 ? 0 : ctx.raw < 50 ? 1
                    : ctx.raw < 75 ? 2 : 3
            return `  Niveau : ${niveaux[n]}`
          },
        },
      },
    },
    scales: {
      y: {
        min: 0, max: 100,
        grid:  {
          color:     'rgba(255,255,255,0.04)',
          drawBorder: false,
        },
        ticks: {
          callback: v => `${v}%`,
          color:    '#475569',
          font:     { size: 10 },
          stepSize: 25,
          padding:  8,
        },
        border: { display: false },
      },
      x: {
        grid:  { display: false },
        ticks: {
          color: '#475569',
          font:  { size: 10 },
          maxRotation: 0,
          padding: 8,
        },
        border: { display: false },
      },
    },
  }

  return (
    <div className={`
      transition-opacity duration-500
      ${ready ? 'opacity-100' : 'opacity-0'}
    `}>
      {/* ── Header stats ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: lastCfg.line,
              boxShadow: `0 0 8px ${lastCfg.line}` }} />
          <span className="text-xs text-slate-400 font-medium">
            Score actuel :
          </span>
          <span className="text-sm font-bold"
            style={{ color: lastCfg.line }}>
            {last}%
          </span>
        </div>

        {trend && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1
            rounded-lg text-xs font-semibold ${trend.color}
            ${trend.bg}`}>
            <trend.icon size={13} />
            {trend.label}
          </div>
        )}
      </div>

      {/* ── Graphique ── */}
      <div className="relative" style={{ height: 200 }}>
        {/* Lignes de référence labels */}
        {[25, 50, 75].map(v => (
          <div key={v}
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: `${100 - v}%`,
              borderTop: '1px dashed rgba(255,255,255,0.06)',
            }}>
            <span className="absolute right-0 -top-3
              text-[9px] text-slate-700 font-mono pr-1">
              {v}%
            </span>
          </div>
        ))}

        <Line
          ref={chartRef}
          data={data}
          options={options}
          plugins={[zonePlugin]}
        />
      </div>

      {/* ── Pills stats ── */}
      <div className="flex justify-center gap-2 mt-4">
        <Pill label="Minimum" value={`${minVal}%`}
          color="bg-emerald-500/8 border border-emerald-500/20" />
        <Pill label="Moyenne"  value={`${avg}%`}
          color="bg-blue-500/8 border border-blue-500/20" />
        <Pill label="Maximum" value={`${maxVal}%`}
          color="bg-red-500/8 border border-red-500/20" />
        <Pill label="Points"  value={scores.length}
          color="bg-slate-500/8 border border-slate-500/20" />
      </div>
    </div>
  )
}