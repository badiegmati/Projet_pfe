/**
 * DashboardGestionnaire — Ultra Professional Dark Dashboard
 * Animations CSS-in-JS + Micro-interactions + Glassmorphism
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Users, Car, MessageSquare, Shield,
  Plus, Edit, Trash2, AlertTriangle,
  RefreshCw, TrendingUp, CheckCircle,
  X, Search, LayoutDashboard, ChevronRight,
  Bell, Menu, Activity, Zap, Eye,
  ArrowUpRight, BarChart2, LogOut
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'
import { useAuth }        from '../hooks/useAuth'
import NavBar             from '../components/common/NavBar'
import LoadingSpinner     from '../components/common/LoadingSpinner'
import MessageForm        from '../components/messagerie/MessageForm'
import DetailConducteur   from '../components/gestionnaire/DetailConducteur'
import {
  gestionnaireAPI, messageAPI,
  conducteurAPI, scoreAPI
} from '../api/apiService'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
)

// ═══════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════
const T = {
  bg:      '#080812',
  bg1:     '#0D0D1A',
  bg2:     '#111122',
  bg3:     '#161628',
  card:    '#12121F',
  card2:   '#1A1A2E',
  border:  'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.10)',
  green:   '#10B981',
  cyan:    '#06B6D4',
  blue:    '#3B82F6',
  purple:  '#A855F7',
  pink:    '#EC4899',
  red:     '#EF4444',
  orange:  '#F97316',
  yellow:  '#EAB308',
  text:    '#F1F5F9',
  text2:   '#CBD5E1',
  muted:   '#475569',
  muted2:  '#334155',
}

const BP = { md: 768, lg: 1024 }

// ═══════════════════════════════════════════════════════
// GLOBAL STYLES INJECTION
// ═══════════════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: ${T.bg};
    color: ${T.text};
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 99px;
  }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.95) translateY(8px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.7; transform: scale(0.97); }
  }
  @keyframes pulseDot {
    0%, 100% { box-shadow: 0 0 0 0 currentColor; }
    50%       { box-shadow: 0 0 0 5px transparent; }
  }
  @keyframes shimmer {
    from { background-position: -200% center; }
    to   { background-position: 200% center; }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 12px currentColor; }
    50%       { box-shadow: 0 0 28px currentColor, 0 0 60px currentColor; }
  }
  @keyframes borderFlow {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-4px); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes sheetIn {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes progressFill {
    from { width: 0; }
  }
  @keyframes neonBlink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes cardHover {
    from { transform: translateY(0) scale(1); }
    to   { transform: translateY(-4px) scale(1.005); }
  }

  .fade-in      { animation: fadeIn 0.5s cubic-bezier(.16,1,.3,1) both; }
  .fade-in-scale{ animation: fadeInScale 0.4s cubic-bezier(.16,1,.3,1) both; }
  .slide-left   { animation: slideInLeft 0.45s cubic-bezier(.16,1,.3,1) both; }
  .slide-right  { animation: slideInRight 0.45s cubic-bezier(.16,1,.3,1) both; }
  .slide-up     { animation: slideInUp 0.45s cubic-bezier(.16,1,.3,1) both; }
  .slide-down   { animation: slideInDown 0.4s cubic-bezier(.16,1,.3,1) both; }

  .stagger-1  { animation-delay: 0ms; }
  .stagger-2  { animation-delay: 60ms; }
  .stagger-3  { animation-delay: 120ms; }
  .stagger-4  { animation-delay: 180ms; }
  .stagger-5  { animation-delay: 240ms; }
  .stagger-6  { animation-delay: 300ms; }

  .btn-hover {
    transition: all 0.2s cubic-bezier(.16,1,.3,1);
    position: relative;
    overflow: hidden;
  }
  .btn-hover:hover  { transform: translateY(-2px); }
  .btn-hover:active { transform: translateY(0) scale(0.97); }
  .btn-hover::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.2s;
  }
  .btn-hover:hover::after { background: rgba(255,255,255,0.06); }

  .card-hover {
    transition: all 0.3s cubic-bezier(.16,1,.3,1);
  }
  .card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }

  .shimmer-text {
    background: linear-gradient(
      90deg,
      ${T.green} 0%,
      ${T.cyan} 30%,
      ${T.blue} 60%,
      ${T.green} 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  .gradient-border {
    position: relative;
  }
  .gradient-border::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, ${T.green}, ${T.cyan}, ${T.blue});
    -webkit-mask: linear-gradient(#fff 0 0) content-box,
                  linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .gradient-border:hover::before { opacity: 1; }

  .ripple-btn {
    position: relative;
    overflow: hidden;
  }
  .ripple-btn .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }

  input, textarea, select {
    font-family: inherit;
  }
  button { font-family: inherit; }
`

function injectGlobalStyles() {
  if (document.getElementById('gest-global-styles')) return
  const style = document.createElement('style')
  style.id = 'gest-global-styles'
  style.textContent = GLOBAL_CSS
  document.head.appendChild(style)
}

// ═══════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════
function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  })
  useEffect(() => {
    const h = () => setSize({ width: window.innerWidth })
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return size
}

function useRipple() {
  const ref = useRef(null)
  const trigger = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2
    const ripple = document.createElement('span')
    ripple.className = 'ripple-effect'
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`
    el.appendChild(ripple)
    setTimeout(() => ripple.remove(), 600)
  }, [])
  return [ref, trigger]
}

// ═══════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════
const getNiveau = (score) => {
  const s = parseFloat(score) || 0
  if (s < 0.25) return 'FAIBLE'
  if (s < 0.50) return 'MODERE'
  if (s < 0.75) return 'ELEVE'
  return 'CRITIQUE'
}
const getNiveauColor = (n) => ({
  FAIBLE: T.green, MODERE: T.yellow, ELEVE: T.orange, CRITIQUE: T.red,
}[n] || T.purple)

const getNiveauLabel = (n) => ({
  FAIBLE: 'Faible', MODERE: 'Modéré', ELEVE: 'Élevé', CRITIQUE: 'Critique',
}[n] || n)

// ═══════════════════════════════════════════════════════
// ANIMATED NUMBER
// ═══════════════════════════════════════════════════════
function AnimatedNumber({ value, suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0)
  const target = parseFloat(value) || 0
  useEffect(() => {
    let start = 0
    const duration = 800
    const step = 16
    const increment = target / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setDisplay(target); clearInterval(timer) }
      else setDisplay(start)
    }, step)
    return () => clearInterval(timer)
  }, [target])
  return <>{display.toFixed(decimals)}{suffix}</>
}

// ═══════════════════════════════════════════════════════
// SCORE RING
// ═══════════════════════════════════════════════════════
function ScoreRing({ score, size = 80, strokeWidth = 6 }) {
  const color  = getNiveauColor(getNiveau(score))
  const pct    = (parseFloat(score) || 0) * 100
  const r      = (size - strokeWidth * 2) / 2
  const circ   = 2 * Math.PI * r
  const dash   = (pct / 100) * circ

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - dash}
        style={{
          transition: 'stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)',
          filter: `drop-shadow(0 0 6px ${color}88)`,
        }}
      />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════
// LEVEL BADGE
// ═══════════════════════════════════════════════════════
function LevelBadge({ niveau, size = 'sm' }) {
  const color = getNiveauColor(niveau)
  const sizes = size === 'sm'
    ? { fontSize: '0.6rem', padding: '2px 8px' }
    : { fontSize: '0.72rem', padding: '4px 12px' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      ...sizes,
      borderRadius: 999,
      background: `${color}15`,
      border: `1px solid ${color}30`,
      color, fontWeight: 700, letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
        animation: niveau === 'CRITIQUE' ? 'neonBlink 1.5s infinite' : 'none',
        flexShrink: 0,
      }} />
      {getNiveauLabel(niveau)}
    </span>
  )
}

// ═══════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════
function ProgressBar({ value, color, height = 6, animated = true }) {
  const pct = Math.min(100, Math.max(0, (parseFloat(value) || 0) * 100))
  return (
    <div style={{
      height, borderRadius: height,
      background: 'rgba(255,255,255,0.06)',
      overflow: 'hidden', position: 'relative',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        borderRadius: height,
        background: `linear-gradient(90deg, ${color}CC, ${color})`,
        boxShadow: `0 0 10px ${color}66`,
        animation: animated ? 'progressFill 1.2s cubic-bezier(.16,1,.3,1) both' : 'none',
        transition: 'width 0.8s cubic-bezier(.16,1,.3,1)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          animation: 'shimmer 2s infinite',
          backgroundSize: '200% 100%',
        }} />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// GLASS CARD
// ═══════════════════════════════════════════════════════
function GlassCard({
  children, accent = T.purple,
  className = '', style: extra = {},
  hover = true, glow = false,
  onClick, padding = '1.25rem',
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        background: `linear-gradient(135deg, ${T.card} 0%, ${T.card2} 100%)`,
        border: `1px solid ${hovered && hover ? `${accent}33` : T.border}`,
        borderRadius: '1.125rem',
        overflow: 'hidden',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.35s cubic-bezier(.16,1,.3,1)',
        transform: hovered && hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered && hover
          ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px ${accent}22, inset 0 1px 0 rgba(255,255,255,0.05)`
          : glow
            ? `0 0 30px ${accent}15`
            : `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`,
        ...extra,
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}66, transparent)`,
        opacity: hovered ? 1 : 0.4,
        transition: 'opacity 0.3s',
      }} />

      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120,
        background: `radial-gradient(circle, ${accent}12, transparent 70%)`,
        borderRadius: '50%',
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.35s',
        pointerEvents: 'none',
      }} />

      <div style={{ padding, position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// SECTION CARD (with header)
// ═══════════════════════════════════════════════════════
function SectionCard({
  title, subtitle, accent = T.purple,
  headerRight, children, className = '',
  style: extra = {},
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: `linear-gradient(135deg, ${T.card} 0%, ${T.card2} 100%)`,
        border: `1px solid ${hovered ? `${accent}28` : T.border}`,
        borderRadius: '1.125rem',
        overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(.16,1,.3,1)',
        boxShadow: hovered
          ? `0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)`
          : `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`,
        ...extra,
      }}
    >
      {/* Animated top border */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, ${accent}88, ${accent}FF, ${accent}88)`,
        backgroundSize: '200% 100%',
        animation: 'borderFlow 3s ease infinite',
      }} />

      {/* Header */}
      {title && (
        <div style={{
          padding: '1rem 1.25rem 0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div>
            <h3 style={{
              fontSize: '0.875rem', fontWeight: 700,
              color: T.text, letterSpacing: '-0.01em',
            }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.7rem', color: T.muted, marginTop: 2 }}>
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && (
            <div style={{ flexShrink: 0 }}>{headerRight}</div>
          )}
        </div>
      )}

      <div style={{ padding: title ? '1rem 1.25rem 1.25rem' : '1.25rem' }}>
        {children}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// ICON BUTTON
// ═══════════════════════════════════════════════════════
function IconBtn({ icon: Icon, color, title, onClick, size = 30, iconSize = 13 }) {
  const [ref, ripple] = useRipple()
  const [hov, setHov] = useState(false)

  return (
    <button
      ref={ref}
      title={title}
      className="ripple-btn"
      onClick={(e) => { ripple(e); onClick?.(e) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: size, height: size,
        background: hov ? `${color}28` : `${color}12`,
        border: `1px solid ${hov ? `${color}55` : `${color}22`}`,
        borderRadius: '0.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(.16,1,.3,1)',
        transform: hov ? 'translateY(-1px) scale(1.05)' : 'scale(1)',
        boxShadow: hov ? `0 4px 12px ${color}33` : 'none',
        flexShrink: 0,
      }}
    >
      <Icon size={iconSize} style={{ color, transition: 'transform 0.2s' }} />
    </button>
  )
}

// ═══════════════════════════════════════════════════════
// PRIMARY BUTTON
// ═══════════════════════════════════════════════════════
function PrimaryBtn({
  children, onClick, color1 = T.green, color2 = T.cyan,
  icon: Icon, style: extra = {}, disabled = false, fullWidth = false,
  size = 'md',
}) {
  const [ref, ripple] = useRipple()
  const [hov, setHov] = useState(false)
  const pad = size === 'sm' ? '0.5rem 1rem' : '0.65rem 1.25rem'
  const fs  = size === 'sm' ? '0.78rem' : '0.85rem'

  return (
    <button
      ref={ref}
      className="ripple-btn"
      onClick={(e) => { if (!disabled) { ripple(e); onClick?.(e) } }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: '0.4rem',
        padding: pad, fontSize: fs, fontWeight: 600,
        background: disabled
          ? 'rgba(255,255,255,0.06)'
          : `linear-gradient(135deg, ${color1}, ${color2})`,
        border: 'none', borderRadius: '0.75rem',
        color: disabled ? T.muted : '#fff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.25s cubic-bezier(.16,1,.3,1)',
        transform: hov && !disabled ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov && !disabled
          ? `0 8px 25px ${color1}44, 0 0 0 1px ${color1}22`
          : `0 4px 15px ${color1}22`,
        opacity: disabled ? 0.5 : 1,
        ...extra,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  )
}

// ═══════════════════════════════════════════════════════
// GHOST BUTTON
// ═══════════════════════════════════════════════════════
function GhostBtn({ children, onClick, icon: Icon, style: extra = {} }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: '0.4rem',
        padding: '0.5rem 0.875rem',
        background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? T.border2 : T.border}`,
        borderRadius: '0.625rem',
        color: hov ? T.text : T.muted, fontSize: '0.78rem',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(.16,1,.3,1)',
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
        ...extra,
      }}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  )
}

// ═══════════════════════════════════════════════════════
// STYLED INPUT
// ═══════════════════════════════════════════════════════
function StyledInput({
  type = 'text', value, onChange, placeholder,
  icon: Icon, accent = T.green, disabled = false,
  style: extra = {}, ...rest
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative', ...extra }}>
      {Icon && (
        <Icon size={13} style={{
          position: 'absolute', left: 10,
          top: '50%', transform: 'translateY(-50%)',
          color: focused ? accent : T.muted,
          transition: 'color 0.2s',
          pointerEvents: 'none',
        }} />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: Icon ? '0.6rem 0.875rem 0.6rem 2rem' : '0.6rem 0.875rem',
          background: disabled
            ? 'rgba(255,255,255,0.02)'
            : focused
              ? 'rgba(255,255,255,0.07)'
              : 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? `${accent}55` : disabled ? 'rgba(255,255,255,0.04)' : T.border}`,
          borderRadius: '0.625rem',
          fontSize: '0.82rem',
          color: disabled ? T.muted : T.text,
          outline: 'none',
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'all 0.2s',
          boxShadow: focused ? `0 0 0 3px ${accent}15` : 'none',
        }}
        {...rest}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MODAL CONFIRM DELETE — Ultra Premium
// ═══════════════════════════════════════════════════════
function ModalConfirmDelete({ conducteur, onConfirm, onCancel, loading }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(4,4,15,0.85)',
        backdropFilter: 'blur(16px) saturate(180%)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        style={{
          background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
          border: `1px solid ${T.red}33`,
          borderRadius: '1.5rem',
          width: '100%', maxWidth: 420,
          overflow: 'hidden',
          boxShadow: `
            0 40px 100px rgba(0,0,0,0.8),
            0 0 0 1px rgba(255,255,255,0.05),
            0 0 60px ${T.red}15,
            inset 0 1px 0 rgba(255,255,255,0.06)
          `,
          animation: 'modalIn 0.4s cubic-bezier(.16,1,.3,1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated red gradient top */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${T.red}, ${T.pink}, ${T.red})`,
          backgroundSize: '200% 100%',
          animation: 'borderFlow 2s ease infinite',
        }} />

        {/* Red glow bg */}
        <div style={{
          position: 'absolute', top: -60, left: '50%',
          transform: 'translateX(-50%)',
          width: 200, height: 200,
          background: `radial-gradient(circle, ${T.red}12, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ padding: '1.75rem', position: 'relative' }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56, margin: '0 auto 1.25rem',
            background: `${T.red}15`,
            border: `1px solid ${T.red}30`,
            borderRadius: '1.125rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 24px ${T.red}22`,
            animation: 'floatY 3s ease-in-out infinite',
          }}>
            <Trash2 size={24} style={{ color: T.red }} />
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '1.1rem', fontWeight: 800,
            color: T.text, textAlign: 'center',
            marginBottom: 6, letterSpacing: '-0.02em',
          }}>
            Supprimer le conducteur ?
          </h3>
          <p style={{
            fontSize: '0.8rem', color: T.muted,
            textAlign: 'center', marginBottom: '1.5rem',
          }}>
            Cette action est irréversible — le compte sera définitivement supprimé
          </p>

          {/* Conducteur card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.875rem 1rem',
            background: `${T.red}08`,
            border: `1px solid ${T.red}18`,
            borderRadius: '0.875rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              width: 44, height: 44,
              background: `linear-gradient(135deg, ${T.red}33, ${T.red}18)`,
              border: `1px solid ${T.red}30`,
              borderRadius: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 800, color: T.red, flexShrink: 0,
              boxShadow: `0 0 16px ${T.red}22`,
            }}>
              {conducteur.prenom?.[0]}{conducteur.nom?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: T.text, marginBottom: 2 }}>
                {conducteur.prenom} {conducteur.nom}
              </p>
              <p style={{ fontSize: '0.7rem', color: T.muted }}>
                {conducteur.id} · {conducteur.nomVehicule || '—'}
              </p>
            </div>
            <LevelBadge niveau={getNiveau(conducteur.scoreJournalier)} />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1, padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${T.border2}`,
                borderRadius: '0.875rem',
                color: T.text2, fontSize: '0.875rem',
                fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1, padding: '0.75rem',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '0.5rem',
                background: `linear-gradient(135deg, ${T.red}, ${T.pink})`,
                border: 'none', borderRadius: '0.875rem',
                color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.25s cubic-bezier(.16,1,.3,1)',
                boxShadow: `0 4px 20px ${T.red}44`,
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = `0 8px 30px ${T.red}66`
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 4px 20px ${T.red}44`
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 15, height: 15,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Désactivation…
                </>
              ) : (
                <><Trash2 size={14} /> Supprimer</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════
export default function DashboardGestionnaire() {
  useEffect(() => { injectGlobalStyles() }, [])

  const { user } = useAuth()
  const { width } = useWindowSize()
  const isMobile = width < BP.md
  const isTablet = width >= BP.md && width < BP.lg

  const [activeTab,       setActiveTab]       = useState('dashboard')
  const [conducteurs,     setConducteurs]     = useState([])
  const [vehicules,       setVehicules]       = useState([])
  const [profil,          setProfil]          = useState(null)
  const [selected,        setSelected]        = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [alerteCond,      setAlerteCond]      = useState(null)
  const [searchTerm,      setSearchTerm]      = useState('')
  const [sidebarOpen,     setSidebarOpen]     = useState(false)
  const [showFormCond,    setShowFormCond]    = useState(false)
  const [showFormVeh,     setShowFormVeh]     = useState(false)
  const [editCond,        setEditCond]        = useState(null)
  const [erreurForm,      setErreurForm]      = useState('')
  const [successForm,     setSuccessForm]     = useState('')
  const [confirmDelete,   setConfirmDelete]   = useState(null)
  const [deletingLoading, setDeletingLoading] = useState(false)
  const [tabMounted,      setTabMounted]      = useState(true)

  const charger = useCallback(async () => {
    try {
      const [c, v, p] = await Promise.allSettled([
        gestionnaireAPI.getMesConducteurs(),
        gestionnaireAPI.getMesVehicules(),
        gestionnaireAPI.getProfil(),
      ])

      let listeConducteurs = []
      if (c.status === 'fulfilled') listeConducteurs = c.value.data || []
      if (v.status === 'fulfilled') setVehicules(v.value.data || [])
      if (p.status === 'fulfilled') setProfil(p.value.data)

      // ── Enrichissement scores réels depuis scores_risque ─────────────
      // scoreJournalier dans la table conducteurs peut être obsolète.
      // On récupère le score actuel pour chaque conducteur via l'API.
      if (listeConducteurs.length > 0) {
        const scoresResults = await Promise.allSettled(
          listeConducteurs.map(cond => scoreAPI.getActuel(cond.id))
        )
        listeConducteurs = listeConducteurs.map((cond, i) => {
          const res = scoresResults[i]
          if (res.status === 'fulfilled' && res.value?.data) {
            const s = res.value.data
            // scoreValeur est le champ retourné par ScoreDTO de Spring Boot
            const valeur = parseFloat(s.scoreValeur ?? s.score_valeur ?? s.scoreJournalier ?? cond.scoreJournalier) || 0
            return { ...cond, scoreJournalier: valeur }
          }
          // Fallback: garder la valeur existante
          return cond
        })
      }

      setConducteurs(listeConducteurs)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    charger()
    const iv = setInterval(charger, 30000)
    return () => clearInterval(iv)
  }, [charger])

  useEffect(() => {
    if (isMobile || isTablet) setSidebarOpen(false)
    setTabMounted(false)
    const t = setTimeout(() => setTabMounted(true), 10)
    return () => clearTimeout(t)
  }, [activeTab, isMobile, isTablet])

  const scoreMoyen = conducteurs.length
    ? conducteurs.reduce((a, c) => a + (parseFloat(c.scoreJournalier) || 0), 0) / conducteurs.length
    : 0
  const nbCritiques = conducteurs.filter(c => (parseFloat(c.scoreJournalier) || 0) >= 0.75).length
  const nbEleves    = conducteurs.filter(c => { const s = parseFloat(c.scoreJournalier) || 0; return s >= 0.5 && s < 0.75 }).length

  const condFiltres = conducteurs.filter(c =>
    `${c.nom} ${c.prenom} ${c.id}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveCond = async (formData) => {
    setErreurForm('')
    try {
      if (editCond) await gestionnaireAPI.modifierConducteur(editCond.id, formData)
      else await gestionnaireAPI.creerConducteur(formData)
      setShowFormCond(false); setEditCond(null)
      setSuccessForm('Conducteur sauvegardé avec succès !')
      charger()
      setTimeout(() => setSuccessForm(''), 3000)
    } catch (err) {
      setErreurForm(err.response?.data?.erreur || JSON.stringify(err.response?.data?.details || 'Erreur'))
    }
  }

  const demanderSuppressionCond = useCallback((conducteur) => {
    setConfirmDelete(conducteur)
  }, [])

  const confirmerSuppressionCond = useCallback(async () => {
    if (!confirmDelete) return
    setDeletingLoading(true)
    try {
      await gestionnaireAPI.supprimerConducteur(confirmDelete.id)
      setConfirmDelete(null)
      setSuccessForm(`Conducteur ${confirmDelete.id} supprimé définitivement !`)
      setTimeout(() => setSuccessForm(''), 3000)
      charger()
    } catch (err) {
      const msg = err.response?.data?.erreur || err.message || 'Erreur serveur'
      setConfirmDelete(null)
      alert(`Erreur : ${msg}`)
    } finally { setDeletingLoading(false) }
  }, [confirmDelete, charger])

  const sideItems = [
    { id: 'dashboard',   label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'conducteurs', label: 'Conducteurs',      icon: Users, badge: nbCritiques > 0 ? nbCritiques : null },
    { id: 'vehicules',   label: 'Véhicules',        icon: Car },
    { id: 'messages',    label: 'Messages',         icon: MessageSquare },
    { id: 'profil',      label: 'Mon Compte',       icon: Shield },
  ]

  if (loading) return <LoadingSpinner full />

  const isNarrow = isMobile || isTablet

  return (
    <div style={{ minHeight: '100vh', background: T.bg, position: 'relative' }}>
      {/* Background mesh */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 40% at 10% 20%, ${T.green}06, transparent),
          radial-gradient(ellipse 50% 50% at 90% 80%, ${T.cyan}05, transparent),
          radial-gradient(ellipse 40% 30% at 50% 50%, ${T.purple}04, transparent)
        `,
      }} />

      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hamburger */}
      {isNarrow && (
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            position: 'fixed', top: 16, left: 14, zIndex: 60,
            width: 38, height: 38,
            background: sidebarOpen ? `${T.green}22` : T.card2,
            border: `1px solid ${sidebarOpen ? `${T.green}44` : T.border}`,
            borderRadius: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: sidebarOpen ? T.green : T.text,
            transition: 'all 0.25s cubic-bezier(.16,1,.3,1)',
            boxShadow: sidebarOpen ? `0 0 20px ${T.green}22` : '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ transition: 'transform 0.25s', transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(0)' }}>
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </div>
        </button>
      )}

      {/* Overlay */}
      {isNarrow && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 35,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      {/* Drawer */}
      {isNarrow && (
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 272, zIndex: 40,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(.16,1,.3,1)',
          background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg2} 100%)`,
          borderRight: `1px solid ${T.border}`,
          padding: '76px 0.875rem 5rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
          overflowY: 'auto',
          boxShadow: sidebarOpen ? '4px 0 40px rgba(0,0,0,0.5)' : 'none',
        }}>
          <Sidebar
            items={sideItems} active={activeTab} onSelect={setActiveTab}
            profil={profil} scoreMoyen={scoreMoyen} nbCritiques={nbCritiques}
            nbConducteurs={conducteurs.length} nbVehicules={vehicules.length}
          />
        </div>
      )}

      {/* Mobile bottom nav */}
      {isMobile && (
        <MobileBottomBar items={sideItems} active={activeTab} onSelect={setActiveTab} />
      )}

      {/* Layout */}
      <div style={{
        display: 'flex', maxWidth: 1440, margin: '0 auto', position: 'relative', zIndex: 1,
        padding: isMobile
          ? '68px 0.75rem 5.5rem'
          : isTablet ? '76px 1rem 2rem' : '76px 1.5rem 2rem',
        gap: '1.5rem',
      }}>
        {!isNarrow && (
          <Sidebar
            items={sideItems} active={activeTab} onSelect={setActiveTab}
            profil={profil} scoreMoyen={scoreMoyen} nbCritiques={nbCritiques}
            nbConducteurs={conducteurs.length} nbVehicules={vehicules.length}
          />
        )}

        <main style={{ flex: 1, minWidth: 0 }}>
          {tabMounted && (
            <div className="slide-up" key={activeTab}>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  conducteurs={condFiltres} vehicules={vehicules}
                  profil={profil} scoreMoyen={scoreMoyen}
                  nbCritiques={nbCritiques} nbEleves={nbEleves}
                  searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                  onSelect={setSelected} onAlerte={setAlerteCond}
                  selected={selected} onRefresh={charger}
                  onNew={() => { setEditCond(null); setErreurForm(''); setShowFormCond(true) }}
                  isMobile={isMobile} isTablet={isTablet}
                />
              )}
              {activeTab === 'conducteurs' && (
                <ConducteursTab
                  conducteurs={conducteurs} successForm={successForm}
                  onNew={() => { setEditCond(null); setErreurForm(''); setShowFormCond(true) }}
                  onEdit={(c) => { setEditCond(c); setErreurForm(''); setShowFormCond(true) }}
                  onDelete={demanderSuppressionCond}
                  onDetail={setSelected} onAlerte={setAlerteCond}
                  isMobile={isMobile} isTablet={isTablet}
                />
              )}
              {activeTab === 'vehicules' && (
                <VehiculesTab
                  vehicules={vehicules}
                  onNew={() => setShowFormVeh(true)}
                  onDelete={async (id) => {
                    if (!window.confirm('Supprimer ce véhicule ?')) return
                    try { await gestionnaireAPI.supprimerVehicule(id); charger() }
                    catch (err) { alert(err.response?.data?.erreur || 'Erreur') }
                  }}
                  isMobile={isMobile}
                />
              )}
              {activeTab === 'messages' && (
                <MessagesTab
                  conducteurs={conducteurs} selected={selected}
                  onSelect={setSelected} isMobile={isMobile}
                />
              )}
              {activeTab === 'profil' && (
                <ProfilTab profil={profil} onUpdate={charger} isMobile={isMobile} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Portals */}
      {selected && activeTab === 'dashboard' && (
        <DetailConducteur conducteur={selected} onClose={() => setSelected(null)} />
      )}
      {alerteCond && (
        <ModalAlerte
          conducteur={alerteCond} expediteurId={user.id}
          onClose={() => setAlerteCond(null)} isMobile={isMobile}
        />
      )}
      {showFormCond && (
        <FormulaireConducteur
          conducteur={editCond} gestionnaireId={user.id}
          erreur={erreurForm} onSave={handleSaveCond}
          onClose={() => { setShowFormCond(false); setEditCond(null); setErreurForm('') }}
          isMobile={isMobile}
        />
      )}
      {showFormVeh && (
        <FormulaireVehicule
          gestionnaireId={user.id}
          onSave={async (data) => {
            await gestionnaireAPI.creerVehicule(data)
            setShowFormVeh(false); charger()
          }}
          onClose={() => setShowFormVeh(false)}
          isMobile={isMobile}
        />
      )}
      {confirmDelete && (
        <ModalConfirmDelete
          conducteur={confirmDelete}
          loading={deletingLoading}
          onConfirm={confirmerSuppressionCond}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MOBILE BOTTOM BAR
// ═══════════════════════════════════════════════════════
function MobileBottomBar({ items, active, onSelect }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: 'rgba(13,13,26,0.92)',
      borderTop: `1px solid ${T.border}`,
      backdropFilter: 'blur(20px) saturate(180%)',
      display: 'flex',
      padding: '0.35rem 0.25rem',
      paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom))',
    }}>
      {items.map(item => {
        const Icon     = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.2rem', padding: '0.3rem 0.2rem',
              border: 'none', background: 'transparent', cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: '0.625rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? `${T.green}22` : 'transparent',
              transition: 'all 0.25s cubic-bezier(.16,1,.3,1)',
              transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isActive ? `0 4px 16px ${T.green}33` : 'none',
              position: 'relative',
            }}>
              <Icon size={17} style={{
                color: isActive ? T.green : T.muted,
                transition: 'color 0.2s',
              }} />
              {item.badge && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: T.red, color: '#fff',
                  fontSize: '0.48rem', fontWeight: 700,
                  borderRadius: 999, minWidth: 14, height: 14,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '0 2px',
                  boxShadow: `0 0 8px ${T.red}66`,
                  animation: 'neonBlink 2s infinite',
                }}>
                  {item.badge}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '0.5rem', fontWeight: 600,
              color: isActive ? T.green : T.muted,
              transition: 'color 0.2s', whiteSpace: 'nowrap',
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                position: 'absolute', bottom: -1, left: '50%',
                transform: 'translateX(-50%)',
                width: 20, height: 2, borderRadius: 1,
                background: T.green,
                boxShadow: `0 0 8px ${T.green}`,
              }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════
function Sidebar({ items, active, onSelect, profil, scoreMoyen, nbCritiques, nbConducteurs, nbVehicules }) {
  const niveauMoyen = getNiveau(scoreMoyen)
  const colorMoyen  = getNiveauColor(niveauMoyen)

  return (
    <aside style={{ width: 244, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

      {/* Profile Card */}
      <div className="slide-left stagger-1" style={{
        background: `linear-gradient(145deg, ${T.card2} 0%, ${T.bg3} 100%)`,
        border: `1px solid ${T.border}`,
        borderRadius: '1.25rem', padding: '1.25rem',
        position: 'relative', overflow: 'hidden',
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}>
        {/* BG gradient */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 120, height: 120,
          background: `radial-gradient(circle, ${T.green}18, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: -30,
          width: 100, height: 100,
          background: `radial-gradient(circle, ${T.cyan}10, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        {/* Avatar */}
        <div style={{
          width: 52, height: 52, marginBottom: '0.875rem',
          background: `linear-gradient(135deg, ${T.green}, ${T.cyan})`,
          borderRadius: '1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.15rem', fontWeight: 800, color: '#fff',
          boxShadow: `0 8px 24px ${T.green}44, 0 0 0 3px ${T.green}22`,
          position: 'relative', zIndex: 1,
          animation: 'floatY 4s ease-in-out infinite',
        }}>
          {profil?.nomGestionnaire?.[0] || '?'}
        </div>

        <p style={{
          fontWeight: 800, fontSize: '0.9rem', color: T.text,
          marginBottom: 2, position: 'relative', zIndex: 1,
          letterSpacing: '-0.01em',
        }}>
          {profil?.nomGestionnaire}
        </p>
        <p style={{ fontSize: '0.68rem', color: T.muted, marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: T.green, fontSize: '0.65rem', fontWeight: 600,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', background: T.green,
              display: 'inline-block', boxShadow: `0 0 6px ${T.green}`,
            }} />
            En ligne
          </span>
          {' · '}{profil?.id}
        </p>

        {/* Stats mini */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem', position: 'relative', zIndex: 1,
        }}>
          {[
            { label: 'Conducteurs', val: nbConducteurs, color: T.green, icon: Users },
            { label: 'Véhicules',   val: nbVehicules,   color: T.cyan,  icon: Car  },
          ].map(item => (
            <div key={item.label} style={{
              background: `${item.color}10`,
              border: `1px solid ${item.color}20`,
              borderRadius: '0.75rem', padding: '0.5rem',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${item.color}18`; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = `${item.color}10`; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <p style={{ fontSize: '1.15rem', fontWeight: 800, color: item.color, lineHeight: 1 }}>
                {item.val}
              </p>
              <p style={{ fontSize: '0.58rem', color: T.muted, marginTop: 2 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="slide-left stagger-2" style={{
        background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
        border: `1px solid ${T.border}`,
        borderRadius: '1.25rem', padding: '0.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.15rem',
        boxShadow: `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}>
        {items.map((item, i) => {
          const Icon     = item.icon
          const isActive = active === item.id
          const [hov, setHov] = [useState(false), useState(false)][0]

          return (
            <NavItem
              key={item.id}
              item={item}
              isActive={isActive}
              onSelect={onSelect}
              delay={i * 50}
            />
          )
        })}
      </div>

      {/* Score flotte */}
      <div className="slide-left stagger-3" style={{
        background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
        border: `1px solid ${T.border}`,
        borderRadius: '1.25rem', padding: '1rem',
        boxShadow: `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
          <p style={{
            fontSize: '0.65rem', color: T.muted, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Score moyen flotte
          </p>
          <Activity size={12} style={{ color: T.muted }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ScoreRing score={scoreMoyen} size={64} strokeWidth={5} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontSize: '0.85rem', fontWeight: 800,
                color: getNiveauColor(getNiveau(scoreMoyen)),
              }}>
                {(scoreMoyen * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: T.text, letterSpacing: '-0.03em' }}>
              {(scoreMoyen * 100).toFixed(0)}
              <span style={{ fontSize: '0.75rem', color: T.muted, fontWeight: 500 }}>%</span>
            </p>
            <LevelBadge niveau={getNiveau(scoreMoyen)} />
          </div>
        </div>

        {nbCritiques > 0 && (
          <div style={{
            padding: '0.5rem 0.75rem',
            background: `${T.red}10`,
            border: `1px solid ${T.red}22`,
            borderRadius: '0.625rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <AlertTriangle size={12} style={{ color: T.red, flexShrink: 0 }} />
            <span style={{ fontSize: '0.68rem', color: T.red, fontWeight: 600 }}>
              {nbCritiques} conducteur{nbCritiques > 1 ? 's' : ''} critique{nbCritiques > 1 ? 's' : ''}
            </span>
            <div style={{
              marginLeft: 'auto',
              width: 6, height: 6, borderRadius: '50%',
              background: T.red, boxShadow: `0 0 8px ${T.red}`,
              animation: 'neonBlink 1.5s infinite',
            }} />
          </div>
        )}
      </div>
    </aside>
  )
}

function NavItem({ item, isActive, onSelect, delay }) {
  const Icon = item.icon
  const [hov, setHov] = useState(false)
  const [ref, ripple] = useRipple()

  return (
    <button
      ref={ref}
      className="ripple-btn"
      onClick={(e) => { ripple(e); onSelect(item.id) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.625rem 0.75rem',
        borderRadius: '0.75rem', border: 'none',
        cursor: 'pointer', width: '100%', textAlign: 'left',
        fontSize: '0.82rem', fontWeight: isActive ? 600 : 500,
        background: isActive
          ? `linear-gradient(135deg, ${T.green}20, ${T.cyan}10)`
          : hov ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: isActive ? T.text : hov ? T.text2 : T.muted,
        borderLeft: `2px solid ${isActive ? T.green : 'transparent'}`,
        transition: 'all 0.2s cubic-bezier(.16,1,.3,1)',
        boxShadow: isActive ? `inset 0 0 20px ${T.green}08` : 'none',
        position: 'relative',
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: '0.5rem', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isActive ? `${T.green}22` : 'transparent',
        transition: 'all 0.2s',
      }}>
        <Icon size={15} style={{ color: isActive ? T.green : 'inherit' }} />
      </div>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && (
        <span style={{
          background: `linear-gradient(135deg, ${T.red}, ${T.pink})`,
          color: '#fff', fontSize: '0.58rem', fontWeight: 800,
          borderRadius: 999, minWidth: 18, height: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 4px',
          boxShadow: `0 0 10px ${T.red}55`,
          animation: 'neonBlink 2s infinite',
        }}>
          {item.badge}
        </span>
      )}
      {isActive && (
        <div style={{
          position: 'absolute', right: -1, top: '20%', bottom: '20%',
          width: 2, borderRadius: 1,
          background: T.green,
          boxShadow: `0 0 8px ${T.green}`,
        }} />
      )}
    </button>
  )
}

// ═══════════════════════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════════════════════
function KpiCard({ label, value, sub, icon: Icon, color, delay = 0, pulse = false, compact = false }) {
  const [hov, setHov] = useState(false)

  return (
    <div
      className={`fade-in`}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
        border: `1px solid ${hov || pulse ? `${color}33` : T.border}`,
        borderRadius: '1.125rem',
        padding: compact ? '0.875rem' : '1.25rem',
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.35s cubic-bezier(.16,1,.3,1)',
        transform: hov ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hov
          ? `0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${color}22, 0 0 30px ${color}10`
          : pulse
            ? `0 0 20px ${color}12`
            : `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`,
        cursor: 'default',
      }}>
        {/* Top line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${color}00, ${color}CC, ${color}00)`,
          opacity: hov ? 1 : 0.5,
          transition: 'opacity 0.3s',
        }} />

        {/* Corner glow */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: compact ? 80 : 100, height: compact ? 80 : 100,
          background: `radial-gradient(circle, ${color}18, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
          opacity: hov ? 1 : 0.6,
          transition: 'opacity 0.35s',
        }} />

        {/* Icon */}
        <div style={{
          width: compact ? 34 : 40, height: compact ? 34 : 40,
          background: hov ? `${color}25` : `${color}15`,
          border: `1px solid ${color}30`,
          borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: compact ? '0.625rem' : '0.875rem',
          transition: 'all 0.3s',
          transform: hov ? 'scale(1.08)' : 'scale(1)',
          boxShadow: hov ? `0 0 20px ${color}33` : 'none',
          ...(pulse ? { animation: 'pulse 2s ease-in-out infinite' } : {}),
        }}>
          <Icon size={compact ? 15 : 18} style={{ color }} />
        </div>

        {/* Value */}
        <p style={{
          fontSize: compact ? '1.5rem' : '1.9rem',
          fontWeight: 900, color,
          marginBottom: 4, lineHeight: 1,
          letterSpacing: '-0.03em',
          textShadow: hov ? `0 0 20px ${color}66` : 'none',
          transition: 'text-shadow 0.3s',
          animation: 'countUp 0.5s ease-out both',
        }}>
          {value}
        </p>
        <p style={{
          fontSize: compact ? '0.68rem' : '0.72rem',
          color: T.text2, fontWeight: 600, marginBottom: 3,
        }}>
          {label}
        </p>
        <p style={{ fontSize: '0.62rem', color: T.muted }}>{sub}</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// TAB — DASHBOARD
// ═══════════════════════════════════════════════════════
function DashboardTab({
  conducteurs, vehicules, profil, scoreMoyen,
  nbCritiques, nbEleves, searchTerm, setSearchTerm,
  onSelect, onAlerte, selected, onRefresh, onNew,
  isMobile, isTablet,
}) {
  const distrib = {
    FAIBLE:   conducteurs.filter(c => getNiveau(c.scoreJournalier) === 'FAIBLE').length,
    MODERE:   conducteurs.filter(c => getNiveau(c.scoreJournalier) === 'MODERE').length,
    ELEVE:    conducteurs.filter(c => getNiveau(c.scoreJournalier) === 'ELEVE').length,
    CRITIQUE: conducteurs.filter(c => getNiveau(c.scoreJournalier) === 'CRITIQUE').length,
  }
  const barLabels = conducteurs.slice(0, 8).map(c => `${c.prenom?.[0]}. ${c.nom}`)
  const barScores = conducteurs.slice(0, 8).map(c =>
    +((parseFloat(c.scoreJournalier) || 0) * 100).toFixed(0)
  )

  const kpiCols   = isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'
  const chartCols = isMobile || isTablet ? '1fr' : '1fr 1.6fr'
  const listCols  = selected && !isMobile ? '1fr 360px' : '1fr'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="slide-down" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '1.25rem' : '1.75rem',
            fontWeight: 900, color: T.text,
            marginBottom: 4, letterSpacing: '-0.03em',
          }}>
            Bonjour,{' '}
            <span className="shimmer-text">
              {profil?.nomGestionnaire} 👋
            </span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: T.muted }}>
            {!isMobile && `Gestionnaire · ${profil?.id} · `}
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </p>
        </div>
        <div style={{
          display: 'flex', gap: '0.625rem',
          width: isMobile ? '100%' : 'auto',
        }}>
          <GhostBtn onClick={onRefresh} icon={RefreshCw} style={{ flex: isMobile ? 1 : 'none' }}>
            {!isMobile && 'Actualiser'}
          </GhostBtn>
          <PrimaryBtn onClick={onNew} icon={Plus} style={{ flex: isMobile ? 1 : 'none' }}>
            {isMobile ? 'Nouveau' : 'Nouveau conducteur'}
          </PrimaryBtn>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: kpiCols, gap: isMobile ? '0.75rem' : '1.125rem' }}>
        {[
          { label: isMobile ? 'Conducteurs' : 'Conducteurs actifs', value: conducteurs.length, sub: 'dans la flotte',         icon: Users,        color: T.green,  delay: 0   },
          { label: 'Véhicules',                                      value: vehicules.length,   sub: 'enregistrés',           icon: Car,          color: T.cyan,   delay: 80  },
          { label: 'Score moyen',                                    value: `${(scoreMoyen*100).toFixed(0)}%`, sub: getNiveauLabel(getNiveau(scoreMoyen)), icon: TrendingUp, color: getNiveauColor(getNiveau(scoreMoyen)), delay: 160 },
          { label: isMobile ? 'Critiques' : 'Alertes critiques',    value: nbCritiques,         sub: `+ ${nbEleves} élevés`, icon: AlertTriangle, color: nbCritiques > 0 ? T.red : T.green, delay: 240, pulse: nbCritiques > 0 },
        ].map((kpi, i) => (
          <KpiCard key={i} {...kpi} compact={isMobile} />
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: chartCols, gap: '1.125rem' }}>
        <SectionCard title="Distribution risque" subtitle="Répartition par niveau" accent={T.purple} className="fade-in stagger-1">
          <DistribDoughnut distrib={distrib} />
        </SectionCard>
        <SectionCard title="Scores conducteurs" subtitle={`Top ${Math.min(conducteurs.length, 8)} de la flotte`} accent={T.cyan} className="fade-in stagger-2">
          <BarChartScores labels={barLabels} scores={barScores} />
        </SectionCard>
      </div>

      {/* Conducteurs list */}
      <div style={{
        display: 'grid', gridTemplateColumns: listCols,
        gap: '1.125rem', transition: 'grid-template-columns 0.4s ease',
      }}>
        <SectionCard
          title="Mes conducteurs"
          subtitle={`${conducteurs.length} conducteurs · actualisation 30s`}
          accent={T.green}
          className="fade-in stagger-3"
          headerRight={
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{
                position: 'absolute', left: 8,
                top: '50%', transform: 'translateY(-50%)',
                color: T.muted, pointerEvents: 'none',
              }} />
              <input
                type="text" placeholder="Rechercher…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.4rem 0.75rem 0.4rem 1.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${T.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.72rem', color: T.text, outline: 'none',
                  width: isMobile ? 110 : 150,
                  transition: 'all 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = `${T.green}44`
                  e.target.style.boxShadow = `0 0 0 3px ${T.green}12`
                }}
                onBlur={e => {
                  e.target.style.borderColor = T.border
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          }
        >
          <ConducteursList
            conducteurs={conducteurs} selected={selected}
            onSelect={onSelect} onAlerte={onAlerte}
          />
        </SectionCard>

        {selected && !isMobile && (
          <div className="slide-right">
            <MiniDetail conducteur={selected} onClose={() => onSelect(null)} onAlerte={onAlerte} />
          </div>
        )}
      </div>

      {selected && isMobile && (
        <MiniDetailSheet conducteur={selected} onClose={() => onSelect(null)} onAlerte={onAlerte} />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// CONDUCTEURS LIST (dashboard)
// ═══════════════════════════════════════════════════════
function ConducteursList({ conducteurs, selected, onSelect, onAlerte }) {
  if (!conducteurs.length) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem', color: T.muted }}>
        <Users size={36} style={{ opacity: 0.15, margin: '0 auto 0.875rem' }} />
        <p style={{ fontSize: '0.85rem' }}>Aucun conducteur trouvé</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      {conducteurs.map((c, i) => {
        const score  = parseFloat(c.scoreJournalier) || 0
        const niveau = getNiveau(score)
        const color  = getNiveauColor(niveau)
        const isSel  = selected?.id === c.id
        const isCrit = score >= 0.75

        return (
          <div
            key={c.id}
            onClick={() => onSelect(isSel ? null : c)}
            className="fade-in"
            style={{
              animationDelay: `${i * 30}ms`,
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: '0.75rem', cursor: 'pointer',
              border: `1px solid ${isSel ? `${T.green}44` : isCrit ? `${T.red}18` : 'transparent'}`,
              background: isSel
                ? `linear-gradient(135deg, ${T.green}10, ${T.cyan}08)`
                : 'rgba(255,255,255,0.01)',
              transition: 'all 0.25s cubic-bezier(.16,1,.3,1)',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              if (!isSel) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = `${color}22`
                e.currentTarget.style.transform = 'translateX(2px)'
              }
            }}
            onMouseLeave={e => {
              if (!isSel) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.01)'
                e.currentTarget.style.borderColor = isCrit ? `${T.red}18` : 'transparent'
                e.currentTarget.style.transform = 'translateX(0)'
              }
            }}
          >
            {isSel && (
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                background: T.green, borderRadius: '0 1px 1px 0',
                boxShadow: `0 0 8px ${T.green}`,
              }} />
            )}

            <div style={{
              width: 38, height: 38, flexShrink: 0,
              background: `linear-gradient(135deg, ${color}33, ${color}18)`,
              border: `1px solid ${color}30`,
              borderRadius: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 800, color,
              boxShadow: isCrit ? `0 0 12px ${color}33` : 'none',
            }}>
              {c.prenom?.[0]}{c.nom?.[0]}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 4 }}>
                <p style={{
                  fontSize: '0.82rem', fontWeight: 600, color: T.text,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {c.prenom} {c.nom}
                </p>
                <span style={{
                  fontSize: '0.58rem', color: T.muted2,
                  background: 'rgba(255,255,255,0.05)',
                  padding: '1px 5px', borderRadius: 999, flexShrink: 0,
                  border: `1px solid ${T.border}`,
                }}>
                  {c.id}
                </span>
              </div>
              <ProgressBar value={score} color={color} height={3} animated={false} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color }}>
                {(score * 100).toFixed(0)}%
              </span>
              {isCrit && (
                <button
                  onClick={e => { e.stopPropagation(); onAlerte(c) }}
                  style={{
                    width: 26, height: 26, flexShrink: 0,
                    background: `${T.red}15`, border: `1px solid ${T.red}30`,
                    borderRadius: '0.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    animation: 'pulse 2s ease-in-out infinite',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = `${T.red}28`}
                  onMouseLeave={e => e.currentTarget.style.background = `${T.red}15`}
                >
                  <Bell size={11} style={{ color: T.red }} />
                </button>
              )}
              <ChevronRight size={12} style={{
                color: isSel ? T.green : T.muted,
                transform: isSel ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'all 0.25s',
                flexShrink: 0,
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MINI DETAIL (right panel)
// ═══════════════════════════════════════════════════════
function MiniDetail({ conducteur, onClose, onAlerte }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Utiliser le score chargé depuis l'API, pas scoreJournalier potentiellement obsolète
  const score  = data?.scoreValeur !== undefined
    ? parseFloat(data.scoreValeur)
    : parseFloat(conducteur.scoreJournalier) || 0
  const niveau = getNiveau(score)
  const color  = getNiveauColor(niveau)

  useEffect(() => {
    setLoading(true)
    Promise.allSettled([
      scoreAPI.getActuel(conducteur.id),
      conducteurAPI.getEvenements(conducteur.id),
    ]).then(([s, e]) => {
      const scoreData = s.status === 'fulfilled' ? s.value.data : null
      setData({
        score:      scoreData,
        scoreValeur: scoreData
          ? parseFloat(scoreData.scoreValeur ?? scoreData.score_valeur ?? 0)
          : parseFloat(conducteur.scoreJournalier) || 0,
        evenements: e.status === 'fulfilled' ? e.value.data || [] : [],
      })
      setLoading(false)
    })
  }, [conducteur.id])

  return (
    <div style={{
      background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
      border: `1px solid ${color}28`,
      borderRadius: '1.125rem', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', height: '100%',
      boxShadow: `0 8px 40px rgba(0,0,0,0.3), 0 0 0 1px ${color}15`,
    }}>
      {/* Animated border */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, ${color}88, ${color}FF, ${color}88)`,
        backgroundSize: '200% 100%',
        animation: 'borderFlow 3s ease infinite',
      }} />

      {/* Header */}
      <div style={{
        padding: '0.875rem 1rem',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 36, height: 36,
            background: `linear-gradient(135deg, ${color}33, ${color}18)`,
            border: `1px solid ${color}30`, borderRadius: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: 800, color,
          }}>
            {conducteur.prenom?.[0]}{conducteur.nom?.[0]}
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: T.text }}>
              {conducteur.prenom} {conducteur.nom}
            </p>
            <p style={{ fontSize: '0.65rem', color: T.muted }}>
              {conducteur.id} · {conducteur.nomVehicule}
            </p>
          </div>
        </div>
        <IconBtn icon={X} color={T.muted} onClick={onClose} size={26} iconSize={13} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `3px solid ${color}22`, borderTopColor: color,
              animation: 'spin 0.8s linear infinite',
              boxShadow: `0 0 16px ${color}33`,
            }} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Score display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', background: `${color}08`, border: `1px solid ${color}18`, borderRadius: '0.875rem' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <ScoreRing score={score} size={72} strokeWidth={5} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 900, color }}>
                    {(score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.72rem', color: T.muted, marginBottom: 4 }}>Score de risque</p>
                <LevelBadge niveau={niveau} size="md" />
              </div>
            </div>

            {/* Stats */}
            {data?.score && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { label: 'Fatigue',   val: data.score.nbFatigue   || 0, color: T.red    },
                  { label: 'Téléphone', val: data.score.nbTelephone || 0, color: T.pink   },
                  { label: 'Total',     val: data.score.nbTotal     || 0, color: T.purple },
                ].map(item => (
                  <div key={item.label} style={{
                    background: `${item.color}10`, border: `1px solid ${item.color}18`,
                    borderRadius: '0.75rem', padding: '0.625rem', textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${item.color}18`; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${item.color}10`; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <p style={{ fontSize: '1.2rem', fontWeight: 900, color: item.color }}>{item.val}</p>
                    <p style={{ fontSize: '0.58rem', color: T.muted, marginTop: 2 }}>{item.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Events */}
            <div>
              <p style={{
                fontSize: '0.65rem', color: T.muted, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: '0.625rem',
              }}>
                Derniers événements
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {(data?.evenements || []).slice(0, 5).map((evt, i) => {
                  const sevColor = { CRITIQUE: T.red, ELEVE: T.orange, MODERE: T.yellow, FAIBLE: T.green }[evt.severite] || T.muted
                  return (
                    <div key={evt.id} className="fade-in" style={{
                      animationDelay: `${i * 50}ms`,
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.4rem 0.625rem',
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${T.border}`,
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      <div style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: sevColor, flexShrink: 0,
                        boxShadow: `0 0 4px ${sevColor}`,
                      }} />
                      <span style={{ fontSize: '0.72rem', color: T.text2, flex: 1 }}>
                        {evt.typeEvenement?.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: T.muted, flexShrink: 0 }}>
                        {new Date(evt.dateHeure).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )
                })}
                {!data?.evenements?.length && (
                  <p style={{ fontSize: '0.78rem', color: T.muted, textAlign: 'center', padding: '1rem' }}>
                    Aucun événement récent
                  </p>
                )}
              </div>
            </div>

            {score >= 0.75 && (
              <PrimaryBtn
                onClick={() => onAlerte(conducteur)}
                color1={T.red} color2={T.pink}
                icon={Bell} fullWidth
              >
                Envoyer une alerte critique
              </PrimaryBtn>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MINI DETAIL SHEET — MOBILE
// ═══════════════════════════════════════════════════════
function MiniDetailSheet({ conducteur, onClose, onAlerte }) {
  const score  = parseFloat(conducteur.scoreJournalier) || 0
  const niveau = getNiveau(score)
  const color  = getNiveauColor(niveau)

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 45,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out',
      }} />
      <div style={{
        position: 'fixed', bottom: 64, left: 0, right: 0, zIndex: 46,
        background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
        borderTop: `2px solid ${color}`,
        borderRadius: '1.5rem 1.5rem 0 0',
        padding: '1rem 1rem 1.5rem',
        maxHeight: '65vh', overflowY: 'auto',
        animation: 'sheetIn 0.4s cubic-bezier(.16,1,.3,1)',
        boxShadow: `0 -16px 60px rgba(0,0,0,0.6), 0 0 40px ${color}10`,
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.15)',
          margin: '0 auto 1rem',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 44, height: 44,
              background: `linear-gradient(135deg, ${color}33, ${color}18)`,
              border: `1px solid ${color}30`, borderRadius: '0.875rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 800, color,
            }}>
              {conducteur.prenom?.[0]}{conducteur.nom?.[0]}
            </div>
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: T.text }}>
                {conducteur.prenom} {conducteur.nom}
              </p>
              <p style={{ fontSize: '0.68rem', color: T.muted }}>
                {conducteur.id} · {conducteur.nomVehicule}
              </p>
            </div>
          </div>
          <IconBtn icon={X} color={T.muted} onClick={onClose} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.875rem', background: `${color}08`, border: `1px solid ${color}18`, borderRadius: '0.875rem' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ScoreRing score={score} size={68} strokeWidth={5} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 900, color }}>
                {(score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.03em' }}>
              {(score * 100).toFixed(0)}%
            </p>
            <div style={{ marginTop: 4 }}>
              <LevelBadge niveau={niveau} />
            </div>
          </div>
        </div>

        {score >= 0.75 && (
          <PrimaryBtn onClick={() => { onAlerte(conducteur); onClose() }} color1={T.red} color2={T.pink} icon={Bell} fullWidth>
            Envoyer une alerte critique
          </PrimaryBtn>
        )}
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// TAB — CONDUCTEURS
// ═══════════════════════════════════════════════════════
function ConducteursTab({
  conducteurs, successForm,
  onNew, onEdit, onDelete, onDetail, onAlerte,
  isMobile, isTablet,
}) {
  const [search,       setSearch]       = useState('')
  const [filterNiveau, setFilterNiveau] = useState('TOUS')

  const filtered = conducteurs
    .filter(c => `${c.nom} ${c.prenom} ${c.id}`.toLowerCase().includes(search.toLowerCase()))
    .filter(c => filterNiveau === 'TOUS' || getNiveau(c.scoreJournalier) === filterNiveau)

  const gridCols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(320px, 1fr))'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between', gap: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
            Gestion des conducteurs
          </h2>
          <p style={{ fontSize: '0.75rem', color: T.muted, marginTop: 3 }}>
            {conducteurs.length} conducteurs enregistrés
          </p>
        </div>
        <PrimaryBtn onClick={onNew} icon={Plus} style={{ width: isMobile ? '100%' : 'auto' }}>
          Nouveau conducteur
        </PrimaryBtn>
      </div>

      {/* Success banner */}
      {successForm && (
        <div className="fade-in" style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.875rem 1.125rem',
          background: `${T.green}12`, border: `1px solid ${T.green}28`,
          borderRadius: '0.875rem', color: '#34D399', fontSize: '0.85rem',
          boxShadow: `0 0 20px ${T.green}10`,
        }}>
          <CheckCircle size={16} />
          {successForm}
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '0.5rem',
        flexWrap: isMobile ? 'nowrap' : 'wrap',
        overflowX: isMobile ? 'auto' : 'visible',
        paddingBottom: isMobile ? '0.25rem' : 0,
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Search size={12} style={{
            position: 'absolute', left: 8, top: '50%',
            transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none',
          }} />
          <input
            type="text" placeholder="Rechercher…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              padding: '0.5rem 0.875rem 0.5rem 1.875rem',
              background: T.card, border: `1px solid ${T.border}`,
              borderRadius: '0.75rem', fontSize: '0.78rem', color: T.text,
              outline: 'none', width: isMobile ? 170 : 230,
              transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = `${T.green}44`; e.target.style.boxShadow = `0 0 0 3px ${T.green}12` }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {['TOUS', 'CRITIQUE', 'ELEVE', 'MODERE', 'FAIBLE'].map(n => {
          const color    = { TOUS: T.muted, CRITIQUE: T.red, ELEVE: T.orange, MODERE: T.yellow, FAIBLE: T.green }[n]
          const isActive = filterNiveau === n
          return (
            <button key={n} onClick={() => setFilterNiveau(n)} style={{
              padding: '0.4rem 0.875rem', borderRadius: 999, flexShrink: 0,
              border: `1px solid ${isActive ? color : T.border}`,
              background: isActive ? `${color}18` : 'transparent',
              color: isActive ? color : T.muted,
              fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
              transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
              boxShadow: isActive ? `0 4px 12px ${color}22` : 'none',
            }}>
              {getNiveauLabel(n) === n ? n : getNiveauLabel(n)}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '1rem' }}>
        {filtered.map((c, i) => {
          const score  = parseFloat(c.scoreJournalier) || 0
          const niveau = getNiveau(score)
          const color  = getNiveauColor(niveau)
          const isCrit = score >= 0.75

          return (
            <ConducteurCard
              key={c.id}
              conducteur={c}
              score={score}
              niveau={niveau}
              color={color}
              isCrit={isCrit}
              delay={i * 40}
              onDetail={onDetail}
              onEdit={onEdit}
              onDelete={onDelete}
              onAlerte={onAlerte}
              isMobile={isMobile}
            />
          )
        })}

        {filtered.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center',
            padding: '4rem', color: T.muted,
          }}>
            <Users size={40} style={{ opacity: 0.12, margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.9rem' }}>Aucun conducteur trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// CONDUCTEUR CARD
// ═══════════════════════════════════════════════════════
function ConducteurCard({ conducteur: c, score, niveau, color, isCrit, delay, onDetail, onEdit, onDelete, onAlerte, isMobile }) {
  const [hov, setHov] = useState(false)
  const [btnHov, setBtnHov] = useState(null)

  return (
    <div
      className="fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        onClick={() => onDetail(c)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
          border: `1px solid ${hov ? `${color}44` : isCrit ? `${T.red}25` : T.border}`,
          borderRadius: '1.125rem',
          padding: isMobile ? '1rem' : '1.25rem',
          cursor: 'pointer',
          transition: 'all 0.35s cubic-bezier(.16,1,.3,1)',
          transform: hov ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hov
            ? `0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px ${color}22, 0 0 30px ${color}10`
            : isCrit
              ? `0 0 20px ${T.red}10, inset 0 0 20px ${T.red}04`
              : `0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`,
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${color}00, ${color}${hov ? 'EE' : '88'}, ${color}00)`,
          transition: 'opacity 0.35s',
        }} />

        {/* Glow bg */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 120, height: 120,
          background: `radial-gradient(circle, ${color}${hov ? '18' : '0A'}, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
          transition: 'opacity 0.35s',
        }} />

        {/* Row 1: Avatar + Name + Buttons */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem', position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: 44, height: 44, flexShrink: 0,
            background: `linear-gradient(135deg, ${color}44, ${color}22)`,
            border: `1px solid ${color}33`,
            borderRadius: '0.875rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.9rem', fontWeight: 800, color,
            boxShadow: hov ? `0 0 20px ${color}44` : isCrit ? `0 0 12px ${color}33` : 'none',
            transition: 'box-shadow 0.35s',
          }}>
            {c.prenom?.[0]}{c.nom?.[0]}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 3 }}>
              <p style={{
                fontSize: '0.9rem', fontWeight: 700, color: T.text,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                letterSpacing: '-0.01em',
              }}>
                {c.prenom} {c.nom}
              </p>
              {isCrit && <LevelBadge niveau="CRITIQUE" />}
            </div>
            <p style={{ fontSize: '0.68rem', color: T.muted }}>
              {c.id} · {c.nomVehicule}
            </p>
          </div>

          {/* Action buttons — STOP PROPAGATION GUARANTEED */}
          <div
            style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <button
              title="Modifier"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(c)
              }}
              onMouseEnter={() => setBtnHov('edit')}
              onMouseLeave={() => setBtnHov(null)}
              style={{
                width: 30, height: 30,
                background: btnHov === 'edit' ? `${T.cyan}28` : `${T.cyan}12`,
                border: `1px solid ${btnHov === 'edit' ? `${T.cyan}55` : `${T.cyan}22`}`,
                borderRadius: '0.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(.16,1,.3,1)',
                transform: btnHov === 'edit' ? 'translateY(-2px) scale(1.08)' : 'scale(1)',
                boxShadow: btnHov === 'edit' ? `0 4px 12px ${T.cyan}33` : 'none',
              }}
            >
              <Edit size={13} style={{ color: T.cyan }} />
            </button>

            {/* ✅ DELETE BUTTON — Guaranteed to work */}
            <button
              title="Supprimer définitivement"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(c)
              }}
              onMouseEnter={() => setBtnHov('del')}
              onMouseLeave={() => setBtnHov(null)}
              style={{
                width: 30, height: 30,
                background: btnHov === 'del' ? `${T.red}28` : `${T.red}12`,
                border: `1px solid ${btnHov === 'del' ? `${T.red}55` : `${T.red}22`}`,
                borderRadius: '0.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(.16,1,.3,1)',
                transform: btnHov === 'del' ? 'translateY(-2px) scale(1.08)' : 'scale(1)',
                boxShadow: btnHov === 'del' ? `0 4px 12px ${T.red}33` : 'none',
              }}
            >
              <Trash2 size={13} style={{ color: T.red }} />
            </button>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: '0.68rem', color: T.muted }}>Score de risque</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color }}>
              {(score * 100).toFixed(0)}%
            </span>
          </div>
          <ProgressBar value={score} color={color} height={6} />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '0.65rem', color: T.muted,
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', flex: 1, marginRight: 8,
          }}>
            {c.email || c.telephone || '—'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LevelBadge niveau={niveau} />
            {isCrit && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAlerte(c) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  padding: '3px 8px', flexShrink: 0,
                  background: `${T.red}18`, border: `1px solid ${T.red}30`,
                  borderRadius: 999, color: T.red,
                  fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer',
                  animation: 'pulse 2s ease-in-out infinite',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${T.red}28`}
                onMouseLeave={e => e.currentTarget.style.background = `${T.red}18`}
              >
                <Bell size={9} /> Alerter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// TAB — VÉHICULES
// ═══════════════════════════════════════════════════════
function VehiculesTab({ vehicules, onNew, onDelete, isMobile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between', gap: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
            Gestion des véhicules
          </h2>
          <p style={{ fontSize: '0.75rem', color: T.muted, marginTop: 3 }}>
            {vehicules.length} véhicule{vehicules.length !== 1 ? 's' : ''} enregistré{vehicules.length !== 1 ? 's' : ''}
          </p>
        </div>
        <PrimaryBtn onClick={onNew} icon={Plus} color1={T.cyan} color2={T.blue} style={{ width: isMobile ? '100%' : 'auto' }}>
          Nouveau véhicule
        </PrimaryBtn>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1rem',
      }}>
        {vehicules.map((v, i) => (
          <div key={v.id} className="fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div style={{
              background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
              border: `1px solid ${T.border}`,
              borderRadius: '1.125rem',
              padding: isMobile ? '1rem' : '1.25rem',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.35s cubic-bezier(.16,1,.3,1)',
              boxShadow: `0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`,
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${T.cyan}33`
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.35), 0 0 0 1px ${T.cyan}18`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = T.border
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${T.cyan}00, ${T.cyan}88, ${T.blue}88, ${T.cyan}00)`,
              }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: 48, height: 48, flexShrink: 0,
                    background: `linear-gradient(135deg, ${T.cyan}22, ${T.blue}18)`,
                    border: `1px solid ${T.cyan}28`, borderRadius: '0.875rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Car size={22} style={{ color: T.cyan }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: T.text, marginBottom: 3, letterSpacing: '-0.01em' }}>
                      {v.nomVehicule}
                    </p>
                    <p style={{ fontSize: '0.68rem', color: T.muted }}>
                      {v.immatriculation}
                      {v.marque && v.marque !== 'Inconnu' ? ` · ${v.marque} ${v.modele}` : ''}
                      {v.annee ? ` · ${v.annee}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onDelete(v.id)}
                  style={{
                    width: 34, height: 34, flexShrink: 0,
                    background: `${T.red}10`, border: `1px solid ${T.red}20`,
                    borderRadius: '0.625rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${T.red}22`
                    e.currentTarget.style.borderColor = `${T.red}44`
                    e.currentTarget.style.transform = 'translateY(-1px) scale(1.05)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = `${T.red}10`
                    e.currentTarget.style.borderColor = `${T.red}20`
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <Trash2 size={14} style={{ color: T.red }} />
                </button>
              </div>

              <div style={{
                marginTop: '0.875rem', paddingTop: '0.875rem',
                borderTop: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: v.conducteurId ? T.green : T.muted2,
                  boxShadow: v.conducteurId ? `0 0 8px ${T.green}` : 'none',
                  flexShrink: 0,
                }} />
                <span style={{ fontSize: '0.72rem', color: v.conducteurId ? T.green : T.muted }}>
                  {v.conducteurId ? `Assigné à ${v.conducteurId}` : 'Non assigné'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {vehicules.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: T.muted }}>
            <Car size={44} style={{ opacity: 0.12, margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '0.9rem' }}>Aucun véhicule enregistré</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// TAB — MESSAGES
// ═══════════════════════════════════════════════════════
function MessagesTab({ conducteurs, selected, onSelect, isMobile }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
        Messagerie
      </h2>

      {conducteurs.length === 0 ? (
        <GlassCard accent={T.purple}>
          <div style={{ textAlign: 'center', padding: '2rem', color: T.muted }}>
            <MessageSquare size={40} style={{ opacity: 0.15, margin: '0 auto 1rem' }} />
            <p>Aucun conducteur disponible</p>
          </div>
        </GlassCard>
      ) : isMobile ? (
        <div>
          {!selected ? (
            <SectionCard title="Choisir un conducteur" accent={T.green}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {conducteurs.map((c, i) => {
                  const score  = parseFloat(c.scoreJournalier) || 0
                  const niveau = getNiveau(score)
                  const color  = getNiveauColor(niveau)
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelect(c)}
                      className="fade-in"
                      style={{
                        animationDelay: `${i * 40}ms`,
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem', borderRadius: '0.75rem', border: 'none',
                        cursor: 'pointer', background: 'transparent',
                        textAlign: 'left', width: '100%',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 42, height: 42, flexShrink: 0,
                        background: `${color}22`, border: `1px solid ${color}30`,
                        borderRadius: '0.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 800, color,
                      }}>
                        {c.prenom?.[0]}{c.nom?.[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: T.text, marginBottom: 4 }}>
                          {c.prenom} {c.nom}
                        </p>
                        <LevelBadge niveau={niveau} />
                      </div>
                      <ChevronRight size={14} style={{ color: T.muted, flexShrink: 0 }} />
                    </button>
                  )
                })}
              </div>
            </SectionCard>
          ) : (
            <div>
              <GhostBtn onClick={() => onSelect(null)} icon={ChevronRight} style={{ marginBottom: '0.875rem', transform: 'none' }}>
                ← Retour
              </GhostBtn>
              <div style={{
                background: T.card, border: `1px solid ${T.border}`,
                borderRadius: '1.125rem', overflow: 'hidden',
                height: 'calc(100vh - 290px)', minHeight: 320,
              }}>
                <MessageForm
                  destinataireId={selected.id}
                  destinataireNom={`${selected.prenom} ${selected.nom}`}
                  preaRempli={
                    (parseFloat(selected.scoreJournalier) || 0) >= 0.75
                      ? `⚠️ Attention ${selected.prenom} ${selected.nom}, score critique (${((parseFloat(selected.scoreJournalier)||0)*100).toFixed(0)}%). Soyez prudent.`
                      : ''
                  }
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.125rem' }}>
          <SectionCard title="Conducteurs" accent={T.green}>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '0.25rem',
              maxHeight: 520, overflowY: 'auto',
            }}>
              {conducteurs.map((c, i) => {
                const score  = parseFloat(c.scoreJournalier) || 0
                const niveau = getNiveau(score)
                const color  = getNiveauColor(niveau)
                const isSel  = selected?.id === c.id

                return (
                  <button
                    key={c.id}
                    onClick={() => onSelect(isSel ? null : c)}
                    className="fade-in"
                    style={{
                      animationDelay: `${i * 40}ms`,
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.625rem 0.75rem', borderRadius: '0.75rem',
                      border: `1px solid ${isSel ? `${T.green}33` : 'transparent'}`,
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      background: isSel ? `linear-gradient(135deg, ${T.green}12, ${T.cyan}08)` : 'transparent',
                      transition: 'all 0.2s',
                      borderLeft: isSel ? `2px solid ${T.green}` : '2px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{
                      width: 36, height: 36, flexShrink: 0,
                      background: `${color}22`, border: `1px solid ${color}28`,
                      borderRadius: '0.625rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800, color,
                    }}>
                      {c.prenom?.[0]}{c.nom?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.prenom} {c.nom}
                      </p>
                      <div style={{ marginTop: 3 }}>
                        <LevelBadge niveau={niveau} />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </SectionCard>

          <div style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderRadius: '1.125rem', overflow: 'hidden', height: 580,
            boxShadow: `0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.03)`,
          }}>
            {selected ? (
              <MessageForm
                destinataireId={selected.id}
                destinataireNom={`${selected.prenom} ${selected.nom}`}
                preaRempli={
                  (parseFloat(selected.scoreJournalier) || 0) >= 0.75
                    ? `⚠️ Attention ${selected.prenom} ${selected.nom}, score critique. Soyez prudent.`
                    : ''
                }
              />
            ) : (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: T.muted, gap: '1rem',
              }}>
                <div style={{
                  width: 60, height: 60,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${T.border}`, borderRadius: '1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <MessageSquare size={26} style={{ opacity: 0.25 }} />
                </div>
                <p style={{ fontSize: '0.875rem' }}>Sélectionnez un conducteur</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// TAB — PROFIL
// ═══════════════════════════════════════════════════════
function ProfilTab({ profil, onUpdate, isMobile }) {
  const [email,     setEmail]     = useState(profil?.email     || '')
  const [telephone, setTelephone] = useState(profil?.telephone || '')
  const [saving,    setSaving]    = useState(false)
  const [success,   setSuccess]   = useState('')
  const [erreur,    setErreur]    = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setErreur('')
    try {
      await gestionnaireAPI.modifierProfil({ email, telephone })
      setSuccess('Profil mis à jour avec succès !')
      onUpdate()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
        Mon Compte
      </h2>

      {/* Avatar card */}
      <GlassCard accent={T.green} className="fade-in stagger-1">
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'center',
          gap: '1.25rem',
          textAlign: isMobile ? 'center' : 'left',
        }}>
          <div style={{
            width: 72, height: 72, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.green}, ${T.cyan})`,
            borderRadius: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 900, color: '#fff',
            boxShadow: `0 12px 32px ${T.green}44, 0 0 0 4px ${T.green}22`,
            animation: 'floatY 4s ease-in-out infinite',
          }}>
            {profil?.nomGestionnaire?.[0] || '?'}
          </div>
          <div>
            <p style={{ fontSize: '1.2rem', fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
              {profil?.nomGestionnaire}
            </p>
            <p style={{ fontSize: '0.78rem', color: T.muted, marginTop: 3, marginBottom: 8 }}>
              {profil?.id}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.65rem', fontWeight: 700,
              background: `${T.green}15`, border: `1px solid ${T.green}28`,
              color: T.green, padding: '4px 12px', borderRadius: 999,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <Shield size={10} />
              Gestionnaire de flotte
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Immutable fields */}
      <SectionCard
        title="🔒 Informations immuables"
        subtitle="Champs gérés par l'administrateur système"
        accent={T.muted}
        className="fade-in stagger-2"
      >
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem' }}>
          {[
            { label: 'Identifiant',      val: profil?.id },
            { label: 'Nom gestionnaire', val: profil?.nomGestionnaire },
          ].map(item => (
            <div key={item.label}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: T.muted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {item.label}
              </label>
              <div style={{
                padding: '0.625rem 0.875rem',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid rgba(255,255,255,0.04)`,
                borderRadius: '0.625rem',
                fontSize: '0.875rem', color: T.muted2,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.muted2, flexShrink: 0 }} />
                {item.val || '—'}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Editable fields */}
      <SectionCard
        title="Informations modifiables"
        subtitle="Email et téléphone peuvent être modifiés"
        accent={T.green}
        className="fade-in stagger-3"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem' }}>
            {[
              { label: 'Email',     val: email,     set: setEmail,     type: 'email', ph: 'email@alpha.tn',    icon: null },
              { label: 'Téléphone', val: telephone, set: setTelephone, type: 'tel',   ph: '+216 XX XXX XXX',   icon: null },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', fontSize: '0.68rem', color: T.muted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {f.label}
                </label>
                <StyledInput
                  type={f.type} value={f.val}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.ph} accent={T.green}
                  style={{ width: '100%' }}
                />
              </div>
            ))}
          </div>

          {erreur && (
            <div className="fade-in" style={{
              padding: '0.875rem', borderRadius: '0.75rem',
              background: `${T.red}12`, border: `1px solid ${T.red}25`,
              color: '#FCA5A5', fontSize: '0.82rem',
            }}>
              {erreur}
            </div>
          )}
          {success && (
            <div className="fade-in" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.875rem', borderRadius: '0.75rem',
              background: `${T.green}12`, border: `1px solid ${T.green}25`,
              color: '#34D399', fontSize: '0.82rem',
            }}>
              <CheckCircle size={15} /> {success}
            </div>
          )}

          <PrimaryBtn
            onClick={handleSave}
            disabled={saving}
            icon={saving ? null : CheckCircle}
          >
            {saving ? (
              <>
                <div style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }} />
                Sauvegarde…
              </>
            ) : 'Sauvegarder les modifications'}
          </PrimaryBtn>
        </form>
      </SectionCard>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// CHARTS
// ═══════════════════════════════════════════════════════
function DistribDoughnut({ distrib }) {
  const total = Object.values(distrib).reduce((a, b) => a + b, 0)

  const data = {
    labels: ['Faible', 'Modéré', 'Élevé', 'Critique'],
    datasets: [{
      data: [distrib.FAIBLE, distrib.MODERE, distrib.ELEVE, distrib.CRITIQUE],
      backgroundColor: [`${T.green}CC`, `${T.yellow}CC`, `${T.orange}CC`, `${T.red}CC`],
      borderColor: T.card, borderWidth: 3, hoverOffset: 8,
    }],
  }

  const options = {
    responsive: true, maintainAspectRatio: false, cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: T.muted, font: { size: 11, family: 'Inter' }, boxWidth: 10, padding: 12 },
      },
      tooltip: {
        backgroundColor: 'rgba(17,17,34,0.98)',
        borderColor: `${T.purple}44`, borderWidth: 1,
        titleColor: T.muted, bodyColor: T.text,
        padding: 10, cornerRadius: 8,
        callbacks: { label: ctx => ` ${ctx.label} : ${ctx.raw} conducteur${ctx.raw > 1 ? 's' : ''}` },
      },
    },
    animation: { animateRotate: true, duration: 1000 },
  }

  return (
    <div style={{ height: 210, position: 'relative' }}>
      {total === 0 ? (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: '0.85rem' }}>
          Aucune donnée
        </div>
      ) : (
        <>
          <Doughnut data={data} options={options} />
          <div style={{
            position: 'absolute', top: '40%', left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <p style={{
              fontSize: '1.75rem', fontWeight: 900,
              background: `linear-gradient(135deg, ${T.green}, ${T.cyan})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.04em',
            }}>
              {total}
            </p>
            <p style={{ fontSize: '0.62rem', color: T.muted, fontWeight: 500 }}>conducteurs</p>
          </div>
        </>
      )}
    </div>
  )
}

function BarChartScores({ labels, scores }) {
  if (!labels.length) return (
    <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, fontSize: '0.85rem' }}>
      Aucun conducteur
    </div>
  )

  const data = {
    labels,
    datasets: [{
      label: 'Score (%)', data: scores,
      backgroundColor: scores.map(s =>
        s >= 75 ? `${T.red}BB`
        : s >= 50 ? `${T.orange}BB`
        : s >= 25 ? `${T.yellow}BB`
        : `${T.green}BB`
      ),
      borderRadius: 8, borderSkipped: false,
      hoverBackgroundColor: scores.map(s =>
        s >= 75 ? T.red : s >= 50 ? T.orange : s >= 25 ? T.yellow : T.green
      ),
    }],
  }

  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17,17,34,0.98)',
        borderColor: `${T.cyan}44`, borderWidth: 1,
        titleColor: T.muted, bodyColor: T.text,
        padding: 10, cornerRadius: 8,
        callbacks: { label: ctx => ` Score : ${ctx.raw}%` },
      },
    },
    scales: {
      y: {
        min: 0, max: 100,
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: { callback: v => `${v}%`, color: T.muted, font: { size: 10, family: 'Inter' } },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: T.muted, font: { size: 10, family: 'Inter' }, maxRotation: 0 },
        border: { display: false },
      },
    },
    animation: { duration: 800 },
  }

  return <div style={{ height: 210 }}><Bar data={data} options={options} /></div>
}

// ═══════════════════════════════════════════════════════
// MODAL ALERTE
// ═══════════════════════════════════════════════════════
function ModalAlerte({ conducteur, expediteurId, onClose, isMobile }) {
  const pct = ((parseFloat(conducteur.scoreJournalier) || 0) * 100).toFixed(0)
  const [contenu, setContenu] = useState(
    `⚠️ Attention ${conducteur.prenom} ${conducteur.nom}, votre score de risque est critique (${pct}%). Soyez très prudent sur la route.`
  )
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  const envoyer = async () => {
    setSending(true)
    try {
      await messageAPI.envoyer({ expediteurId, destinatairesId: conducteur.id, contenu })
      setSent(true)
      setTimeout(onClose, 2000)
    } catch {}
    finally { setSending(false) }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex',
      alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center',
      padding: isMobile ? 0 : '1rem',
      background: 'rgba(4,4,15,0.8)',
      backdropFilter: 'blur(16px)',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div
        style={{ position: 'absolute', inset: 0 }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative', zIndex: 1,
        background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
        border: `1px solid ${T.red}33`, overflow: 'hidden',
        boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 60px ${T.red}10`,
        ...(isMobile
          ? { width: '100%', borderRadius: '1.5rem 1.5rem 0 0', maxHeight: '90vh', animation: 'sheetIn 0.4s cubic-bezier(.16,1,.3,1)' }
          : { width: '100%', maxWidth: 460, borderRadius: '1.5rem', animation: 'modalIn 0.4s cubic-bezier(.16,1,.3,1)' }),
      }}>
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${T.red}, ${T.pink}, ${T.red})`,
          backgroundSize: '200% 100%',
          animation: 'borderFlow 2s ease infinite',
        }} />

        {isMobile && (
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0.875rem auto 0' }} />
        )}

        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 48, height: 48,
                background: `${T.red}15`, border: `1px solid ${T.red}30`,
                borderRadius: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 2s ease-in-out infinite',
                boxShadow: `0 0 20px ${T.red}22`,
              }}>
                <AlertTriangle size={22} style={{ color: T.red }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: T.text, letterSpacing: '-0.02em' }}>
                  Alerte critique
                </h3>
                <p style={{ fontSize: '0.75rem', color: T.muted, marginTop: 2 }}>
                  {conducteur.prenom} {conducteur.nom} · Score {pct}%
                </p>
              </div>
            </div>
            <IconBtn icon={X} color={T.muted} onClick={onClose} />
          </div>

          <textarea
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            rows={4}
            style={{
              width: '100%', padding: '0.875rem',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${T.border}`, borderRadius: '0.875rem',
              color: T.text, fontSize: '0.875rem',
              resize: 'none', outline: 'none',
              marginBottom: '1rem', lineHeight: 1.7,
              boxSizing: 'border-box',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => {
              e.target.style.borderColor = `${T.red}44`
              e.target.style.boxShadow = `0 0 0 3px ${T.red}12`
            }}
            onBlur={e => {
              e.target.style.borderColor = T.border
              e.target.style.boxShadow = 'none'
            }}
          />

          {sent && (
            <div className="fade-in" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem', marginBottom: '1rem',
              background: `${T.green}12`, border: `1px solid ${T.green}25`,
              borderRadius: '0.75rem', color: '#34D399', fontSize: '0.85rem',
            }}>
              <CheckCircle size={15} /> Alerte envoyée avec succès !
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <GhostBtn onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Annuler
            </GhostBtn>
            <PrimaryBtn
              onClick={envoyer}
              disabled={sending || sent}
              color1={T.red} color2={T.pink}
              icon={sending ? null : MessageSquare}
              style={{ flex: 1 }}
            >
              {sending ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Envoi…
                </>
              ) : sent ? 'Envoyé ✓' : 'Envoyer alerte'}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// FORMULAIRE CONDUCTEUR
// ═══════════════════════════════════════════════════════
function FormulaireConducteur({ conducteur, gestionnaireId, erreur, onSave, onClose, isMobile }) {
  const isEdit = !!conducteur
  const [form, setForm] = useState({
    id: conducteur?.id || '', nom: conducteur?.nom || '',
    prenom: conducteur?.prenom || '', age: conducteur?.age || '',
    telephone: conducteur?.telephone || '', email: conducteur?.email || '',
    nomVehicule: conducteur?.nomVehicule || '', motDePasse: '',
  })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const data = { ...form }
    if (!data.motDePasse && isEdit) delete data.motDePasse
    if (data.age) data.age = parseInt(data.age)
    onSave(data)
  }

  const fields = isEdit ? [
    { key: 'id',          label: 'Identifiant',    locked: true },
    { key: 'nom',         label: 'Nom',            locked: true },
    { key: 'prenom',      label: 'Prénom',         locked: true },
    { key: 'nomVehicule', label: 'Véhicule',       locked: true },
    { key: 'email',       label: 'Email',          type: 'email' },
    { key: 'telephone',   label: 'Téléphone',      type: 'tel' },
    { key: 'motDePasse',  label: 'Nouveau mot de passe (optionnel)', type: 'password' },
  ] : [
    { key: 'id',          label: 'Identifiant *', placeholder: 'C15' },
    { key: 'prenom',      label: 'Prénom *' },
    { key: 'nom',         label: 'Nom *' },
    { key: 'nomVehicule', label: 'Véhicule *', placeholder: 'Peugeot 208' },
    { key: 'age',         label: 'Âge', type: 'number' },
    { key: 'telephone',   label: 'Téléphone', type: 'tel' },
    { key: 'email',       label: 'Email', type: 'email' },
    { key: 'motDePasse',  label: 'Mot de passe *', type: 'password', required: true },
  ]

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center', padding: isMobile ? 0 : '1rem',
      background: 'rgba(4,4,15,0.8)',
      backdropFilter: 'blur(16px)',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
        border: `1px solid ${T.green}33`, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 40px ${T.green}08`,
        ...(isMobile
          ? { width: '100%', borderRadius: '1.5rem 1.5rem 0 0', maxHeight: '93vh', animation: 'sheetIn 0.4s cubic-bezier(.16,1,.3,1)' }
          : { width: '100%', maxWidth: 540, borderRadius: '1.5rem', maxHeight: '90vh', animation: 'modalIn 0.4s cubic-bezier(.16,1,.3,1)' }),
      }}>
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${T.green}, ${T.cyan}, ${T.green})`,
          backgroundSize: '200% 100%',
          animation: 'borderFlow 3s ease infinite',
        }} />

        {isMobile && (
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0.875rem auto 0' }} />
        )}

        {/* Header */}
        <div style={{
          padding: '1.125rem 1.375rem',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: T.text, letterSpacing: '-0.02em' }}>
              {isEdit ? '✏️ Modifier conducteur' : '➕ Nouveau conducteur'}
            </h3>
            <p style={{ fontSize: '0.68rem', color: T.muted, marginTop: 3 }}>
              {isEdit
                ? '🔒 Seuls email, téléphone et mot de passe sont modifiables'
                : 'Format ID : C + chiffres (ex: C15, C21)'
              }
            </p>
          </div>
          <IconBtn icon={X} color={T.muted} onClick={onClose} />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.125rem 1.375rem',
            overflowY: 'auto', flex: 1,
            display: 'flex', flexDirection: 'column', gap: '0.875rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.875rem' }}>
            {fields.map(f => (
              <div
                key={f.key}
                style={{ gridColumn: (!isMobile && f.key === 'id' && !isEdit) ? '1/-1' : 'auto' }}
              >
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: '0.68rem', color: f.locked ? T.muted2 : T.muted,
                  fontWeight: 700, marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {f.locked && '🔒 '}
                  {f.label}
                </label>
                <StyledInput
                  type={f.type || 'text'}
                  value={form[f.key]}
                  onChange={set(f.key)}
                  disabled={f.locked}
                  placeholder={f.placeholder || ''}
                  accent={T.green}
                  style={{ width: '100%' }}
                  required={f.required}
                />
              </div>
            ))}
          </div>

          {erreur && (
            <div className="fade-in" style={{
              padding: '0.875rem', borderRadius: '0.75rem',
              background: `${T.red}12`, border: `1px solid ${T.red}25`,
              color: '#FCA5A5', fontSize: '0.82rem',
            }}>
              {erreur}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <GhostBtn onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Annuler
            </GhostBtn>
            <PrimaryBtn
              onClick={handleSubmit}
              icon={isEdit ? CheckCircle : Plus}
              style={{ flex: 1 }}
            >
              {isEdit ? 'Mettre à jour' : 'Créer le conducteur'}
            </PrimaryBtn>
          </div>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// FORMULAIRE VÉHICULE
// ═══════════════════════════════════════════════════════
function FormulaireVehicule({ gestionnaireId, onSave, onClose, isMobile }) {
  const [form, setForm] = useState({ nomVehicule: '', immatriculation: '', marque: '', modele: '', annee: '' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    await onSave({ ...form, annee: form.annee ? parseInt(form.annee) : null, creeParGestionnaire: gestionnaireId })
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: isMobile ? 'flex-end' : 'center',
      justifyContent: 'center', padding: isMobile ? 0 : '1rem',
      background: 'rgba(4,4,15,0.8)', backdropFilter: 'blur(16px)',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />

      <div style={{
        position: 'relative', zIndex: 1,
        background: `linear-gradient(145deg, ${T.card} 0%, ${T.card2} 100%)`,
        border: `1px solid ${T.cyan}33`, overflow: 'hidden',
        boxShadow: `0 40px 100px rgba(0,0,0,0.8), 0 0 40px ${T.cyan}08`,
        ...(isMobile
          ? { width: '100%', borderRadius: '1.5rem 1.5rem 0 0', maxHeight: '93vh', animation: 'sheetIn 0.4s cubic-bezier(.16,1,.3,1)' }
          : { width: '100%', maxWidth: 460, borderRadius: '1.5rem', animation: 'modalIn 0.4s cubic-bezier(.16,1,.3,1)' }),
      }}>
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, ${T.cyan}, ${T.blue}, ${T.cyan})`,
          backgroundSize: '200% 100%', animation: 'borderFlow 3s ease infinite',
        }} />

        {isMobile && (
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0.875rem auto 0' }} />
        )}

        <div style={{
          padding: '1.125rem 1.375rem', borderBottom: `1px solid ${T.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: T.text, letterSpacing: '-0.02em' }}>
            🚗 Nouveau véhicule
          </h3>
          <IconBtn icon={X} color={T.muted} onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.125rem 1.375rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', overflowY: 'auto' }}>
          {[
            { key: 'nomVehicule',     label: 'Nom du véhicule *', placeholder: 'Peugeot 208', required: true },
            { key: 'immatriculation', label: 'Immatriculation',   placeholder: '123TU4567' },
            { key: 'marque',          label: 'Marque',            placeholder: 'Peugeot' },
            { key: 'modele',          label: 'Modèle',            placeholder: '208' },
            { key: 'annee',           label: 'Année',             type: 'number', placeholder: '2024' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: '0.68rem', color: T.muted, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {f.label}
              </label>
              <StyledInput
                type={f.type || 'text'} value={form[f.key]}
                onChange={set(f.key)} placeholder={f.placeholder}
                accent={T.cyan} style={{ width: '100%' }}
                required={f.required}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <GhostBtn onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Annuler
            </GhostBtn>
            <PrimaryBtn
              onClick={handleSubmit}
              color1={T.cyan} color2={T.blue}
              icon={Plus} style={{ flex: 1 }}
            >
              Créer le véhicule
            </PrimaryBtn>
          </div>
        </form>
      </div>
    </div>
  )
}