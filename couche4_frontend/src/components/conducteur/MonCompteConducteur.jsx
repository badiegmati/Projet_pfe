/**
 * MonCompteConducteur — Gestion profil conducteur Pro
 * Design glassmorphism + animations + UX enrichie
 */
import React, { useState, useEffect } from 'react'
import {
  Lock, CheckCircle, AlertCircle, Eye, EyeOff,
  User, Mail, Phone, Car, Shield,
  Save, KeyRound, Sparkles
} from 'lucide-react'
import { useAuth }          from '../../hooks/useAuth'
import { conducteurAPI }    from '../../api/apiService'

/* ─── Champ verrouillé ────────────────────────────────── */
function LockedField({ label, value, icon: Icon }) {
  return (
    <div className="group">
      <label className="flex items-center gap-1.5
        text-[11px] font-semibold text-slate-500
        uppercase tracking-wider mb-1.5">
        <Lock size={10} className="text-slate-600" />
        {label}
      </label>
      <div className="flex items-center gap-2.5
        bg-white/[0.03] border border-white/5
        rounded-xl px-3.5 py-2.5
        cursor-not-allowed select-none">
        <Icon size={14} className="text-slate-600 flex-shrink-0" />
        <span className="text-slate-400 text-sm font-medium
          truncate">
          {value || '—'}
        </span>
        <Lock size={11} className="text-slate-700 ml-auto
          flex-shrink-0" />
      </div>
    </div>
  )
}

/* ─── Champ éditable ──────────────────────────────────── */
function EditField({
  label, value, onChange, type = 'text',
  placeholder, icon: Icon, error, hint,
  showToggle, onToggle, show
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5
        text-[11px] font-semibold text-slate-400
        uppercase tracking-wider mb-1.5">
        <Icon size={10} className="text-blue-400" />
        {label}
      </label>
      <div className={`
        flex items-center gap-2.5 rounded-xl
        border px-3.5 py-2.5
        transition-all duration-200
        bg-white/[0.03]
        ${error
          ? 'border-red-500/40 bg-red-500/5'
          : 'border-white/8 focus-within:border-blue-500/50'
            + ' focus-within:bg-blue-500/5'}
      `}>
        <Icon size={14} className={`
          flex-shrink-0 transition-colors duration-200
          ${error ? 'text-red-400' : 'text-slate-600'
            + ' group-focus-within:text-blue-400'}
        `} />
        <input
          type={showToggle ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-slate-200
            text-sm font-medium placeholder:text-slate-600
            outline-none min-w-0"
        />
        {showToggle && (
          <button type="button" onClick={onToggle}
            className="flex-shrink-0 text-slate-600
              hover:text-slate-400 transition-colors">
            {show
              ? <EyeOff size={14} />
              : <Eye    size={14} />}
          </button>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 mt-1.5
          text-red-400 text-[11px] font-medium
          animate-[fadeIn_0.2s_ease]">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-slate-600 mt-1 ml-1">
          {hint}
        </p>
      )}
    </div>
  )
}

/* ─── Force mot de passe ──────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null

  const checks = [
    { label: '8+ caractères', ok: password.length >= 8 },
    { label: 'Majuscule',     ok: /[A-Z]/.test(password) },
    { label: 'Chiffre',       ok: /\d/.test(password)    },
    { label: 'Symbole',       ok: /[^a-zA-Z0-9]/.test(password) },
  ]
  const score  = checks.filter(c => c.ok).length
  const colors = ['bg-red-500', 'bg-orange-500',
                  'bg-yellow-500', 'bg-emerald-500']
  const labels = ['Faible', 'Moyen', 'Bien', 'Fort']

  return (
    <div className="mt-2 space-y-2
      animate-[fadeIn_0.2s_ease]">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i}
            className={`
              flex-1 h-1 rounded-full transition-all
              duration-300
              ${i < score ? colors[score - 1] : 'bg-white/10'}
            `}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {checks.map(c => (
            <span key={c.label}
              className={`
                text-[10px] font-medium flex items-center gap-1
                transition-colors duration-200
                ${c.ok ? 'text-emerald-400' : 'text-slate-600'}
              `}>
              <span>{c.ok ? '✓' : '○'}</span>
              {c.label}
            </span>
          ))}
        </div>
        <span className={`
          text-[11px] font-bold
          ${colors[score - 1]
            ?.replace('bg-', 'text-') || 'text-slate-600'}
        `}>
          {score > 0 ? labels[score - 1] : ''}
        </span>
      </div>
    </div>
  )
}

/* ─── Toast notification ──────────────────────────────── */
function Toast({ type, message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`
      flex items-center gap-3 p-4 rounded-2xl
      border shadow-2xl backdrop-blur-sm
      animate-[slideDown_0.3s_ease_both]
      ${type === 'success'
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        : 'bg-red-500/10    border-red-500/20    text-red-400'}
    `}>
      {type === 'success'
        ? <CheckCircle size={18} className="flex-shrink-0" />
        : <AlertCircle size={18} className="flex-shrink-0" />}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose}
        className="opacity-60 hover:opacity-100
          transition-opacity text-lg leading-none">
        ×
      </button>
    </div>
  )
}

/* ─── Avatar conducteur ───────────────────────────────── */
function Avatar({ profil }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6
      border-b border-white/5">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl
          bg-gradient-to-br from-blue-500 to-blue-700
          flex items-center justify-center
          text-3xl font-black text-white
          shadow-xl shadow-blue-500/30
          ring-2 ring-blue-500/20">
          {profil?.prenom?.[0]}{profil?.nom?.[0]}
        </div>
        <div className="absolute -bottom-1.5 -right-1.5
          w-7 h-7 rounded-xl
          bg-gradient-to-br from-emerald-400 to-teal-500
          flex items-center justify-center
          shadow-lg shadow-emerald-500/30
          border-2 border-slate-900">
          <Shield size={13} className="text-white" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="font-bold text-slate-200 text-lg">
          {profil?.prenom} {profil?.nom}
        </h3>
        <p className="text-slate-500 text-sm font-mono mt-0.5">
          {profil?.id}
        </p>
      </div>
    </div>
  )
}

/* ─── Section card ────────────────────────────────────── */
function Section({ title, icon: Icon, accent, children, delay = 0 }) {
  return (
    <div
      className="rounded-2xl border border-white/5
        bg-white/[0.02] overflow-hidden
        animate-[fadeSlideUp_0.4s_ease_both]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header section */}
      <div className={`
        flex items-center gap-2.5 px-5 py-3.5
        border-b border-white/5
        ${accent || 'bg-white/[0.02]'}
      `}>
        <div className="w-7 h-7 rounded-lg bg-white/8
          flex items-center justify-center">
          <Icon size={14} className="text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-300 text-sm">
          {title}
        </h3>
      </div>

      <div className="p-5">{children}</div>
    </div>
  )
}

/* ─── Composant principal ─────────────────────────────── */
export default function MonCompteConducteur({ profil, onUpdate }) {
  const { user } = useAuth()

  /* Champs */
  const [email,     setEmail]     = useState(profil?.email     || '')
  const [telephone, setTelephone] = useState(profil?.telephone || '')
  const [mdp,       setMdp]       = useState('')
  const [mdpConf,   setMdpConf]   = useState('')

  /* UI */
  const [showMdp,   setShowMdp]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState(null)
  const [errors,    setErrors]    = useState({})

  /* Validation */
  const validate = () => {
    const e = {}
    if (email && !/^\S+@\S+\.\S+$/.test(email))
      e.email = 'Email invalide'
    if (telephone && !/^[\d\s\+\-\(\)]{6,20}$/.test(telephone))
      e.telephone = 'Numéro invalide'
    if (mdp && mdp.length < 8)
      e.mdp = 'Minimum 8 caractères'
    if (mdp && mdp !== mdpConf)
      e.mdpConf = 'Les mots de passe ne correspondent pas'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const data = {}
      if (email     !== profil?.email)     data.email     = email
      if (telephone !== profil?.telephone) data.telephone = telephone
      if (mdp)                             data.motDePasse = mdp

      if (Object.keys(data).length > 0) {
        await conducteurAPI.modifierProfil(user.id, data)
        setMdp('')
        setMdpConf('')
        if (onUpdate) onUpdate()
        setToast({ type: 'success',
          message: 'Profil mis à jour avec succès !' })
      } else {
        setToast({ type: 'success',
          message: 'Aucune modification à enregistrer' })
      }
    } catch (err) {
      setToast({
        type: 'error',
        message: err.response?.data?.erreur
          || 'Erreur lors de la mise à jour'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4
      animate-[fadeIn_0.3s_ease]">

      {/* ── Toast ── */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Header page ── */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl
          bg-blue-500/15 border border-blue-500/20
          flex items-center justify-center">
          <User size={18} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-200">
            Mon Compte
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gérez vos informations personnelles
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5
          bg-emerald-500/10 border border-emerald-500/20
          px-3 py-1.5 rounded-xl">
          <Sparkles size={12} className="text-emerald-400" />
          <span className="text-[11px] font-semibold
            text-emerald-400">
            Profil actif
          </span>
        </div>
      </div>

      {/* ── Avatar ── */}
      <div className="rounded-2xl border border-white/5
        bg-white/[0.02] overflow-hidden
        animate-[fadeSlideUp_0.3s_ease_both]">
        <Avatar profil={profil} />
        <div className="grid grid-cols-3 divide-x divide-white/5">
          {[
            { label: 'Véhicule', value: profil?.nomVehicule || '—' },
            { label: 'Email',    value: email || '—'               },
            { label: 'Tél.',     value: telephone || '—'           },
          ].map(({ label, value }) => (
            <div key={label}
              className="px-4 py-3 text-center">
              <p className="text-[10px] font-semibold
                text-slate-600 uppercase tracking-wide">
                {label}
              </p>
              <p className="text-xs text-slate-400
                font-medium mt-1 truncate">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Champs verrouillés ── */}
      <Section
        title="Informations gérées par votre gestionnaire"
        icon={Lock}
        delay={80}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LockedField label="Identifiant"
            value={profil?.id}         icon={Shield} />
          <LockedField label="Nom"
            value={profil?.nom}        icon={User}   />
          <LockedField label="Prénom"
            value={profil?.prenom}     icon={User}   />
          <LockedField label="Véhicule assigné"
            value={profil?.nomVehicule} icon={Car}   />
        </div>
      </Section>

      {/* ── Champs éditables ── */}
      <form onSubmit={handleSave}>
        <Section
          title="Informations modifiables"
          icon={Mail}
          delay={160}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditField
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="exemple@email.com"
              icon={Mail}
              error={errors.email}
            />
            <EditField
              label="Téléphone"
              value={telephone}
              onChange={setTelephone}
              type="tel"
              placeholder="+216 XX XXX XXX"
              icon={Phone}
              error={errors.telephone}
            />
          </div>
        </Section>

        {/* ── Mot de passe ── */}
        <Section
          title="Changer le mot de passe"
          icon={KeyRound}
          delay={240}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <EditField
                label="Nouveau mot de passe"
                value={mdp}
                onChange={setMdp}
                placeholder="Laissez vide pour ne pas changer"
                icon={KeyRound}
                error={errors.mdp}
                showToggle
                show={showMdp}
                onToggle={() => setShowMdp(p => !p)}
              />
              <PasswordStrength password={mdp} />
            </div>
            <div className="sm:col-span-2">
              <EditField
                label="Confirmer le mot de passe"
                value={mdpConf}
                onChange={setMdpConf}
                placeholder="Répéter le nouveau mot de passe"
                icon={Shield}
                error={errors.mdpConf}
                showToggle
                show={showConf}
                onToggle={() => setShowConf(p => !p)}
              />
            </div>
          </div>
        </Section>

        {/* ── Submit ── */}
        <div className="flex justify-end mt-4
          animate-[fadeSlideUp_0.4s_0.3s_ease_both]">
          <button
            type="submit"
            disabled={saving}
            className={`
              relative flex items-center gap-2.5
              px-6 py-3 rounded-xl font-semibold
              text-sm text-white overflow-hidden
              transition-all duration-200
              ${saving
                ? 'bg-blue-600/50 cursor-wait'
                : 'bg-gradient-to-r from-blue-600 to-blue-500'
                  + ' hover:from-blue-500 hover:to-blue-400'
                  + ' hover:shadow-xl hover:shadow-blue-500/25'
                  + ' active:scale-95'}
            `}
          >
            {/* Shimmer hover */}
            <div className="absolute inset-0 bg-gradient-to-r
              from-transparent via-white/10 to-transparent
              translate-x-[-100%] hover:translate-x-[100%]
              transition-transform duration-700 pointer-events-none"
            />

            {saving ? (
              <>
                <div className="w-4 h-4 border-2
                  border-white/30 border-t-white
                  rounded-full animate-spin" />
                Sauvegarde…
              </>
            ) : (
              <>
                <Save size={16} />
                Sauvegarder les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}