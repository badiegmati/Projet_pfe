/**
 * MessageForm — Formulaire envoi + conversation messagerie
 * Style professionnel dark néon — Alpha Technology
 */
import React, { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare, User, CheckCheck, Wifi, WifiOff } from 'lucide-react'
import { messageAPI } from '../../api/apiService'
import { useAuth }    from '../../hooks/useAuth'

export default function MessageForm({
  destinataireId,
  destinataireNom,
  preaRempli = ''
}) {
  const { user }        = useAuth()
  const [messages, setMessages] = useState([])
  const [contenu,  setContenu]  = useState(preaRempli)
  const [loading,  setLoading]  = useState(true)
  const [sending,  setSending]  = useState(false)
  const [connected, setConnected] = useState(true)
  const [newMsgIds, setNewMsgIds] = useState(new Set())
  const bottomRef  = useRef(null)
  const textareaRef = useRef(null)
  const prevMsgCount = useRef(0)

  /* ── Chargement conversation ── */
  const charger = () => {
    if (!destinataireId) return
    messageAPI.getConversation(user.id, destinataireId)
      .then(r => {
        const data = r.data || []
        // Repère les nouveaux messages arrivés
        if (data.length > prevMsgCount.current) {
          const ids = new Set(data.slice(prevMsgCount.current).map(m => m.id))
          setNewMsgIds(ids)
          setTimeout(() => setNewMsgIds(new Set()), 1200)
        }
        prevMsgCount.current = data.length
        setMessages(data)
        setConnected(true)
      })
      .catch(() => setConnected(false))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(true)
    charger()
    const iv = setInterval(charger, 15000)
    return () => clearInterval(iv)
  }, [destinataireId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (preaRempli) {
      setContenu(preaRempli)
      textareaRef.current?.focus()
    }
  }, [preaRempli])

  /* ── Envoi ── */
  const envoyer = async (e) => {
    e.preventDefault()
    if (!contenu.trim() || sending) return
    setSending(true)
    try {
      await messageAPI.envoyer({
        expediteurId:    user.id,
        destinatairesId: destinataireId,
        contenu:         contenu.trim(),
      })
      setContenu('')
      charger()
    } catch {
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  /* ── Helpers ── */
  const formatDate = (d) =>
    new Date(d).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })

  const groupByDate = (msgs) => {
    const groups = {}
    msgs.forEach(m => {
      const key = new Date(m.dateEnvoi).toLocaleDateString('fr-FR')
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    })
    return groups
  }

  const grouped = groupByDate(messages)

  /* ────────────────────────────── RENDER ────────────────────────── */
  return (
    <>
      {/* ── Keyframes injectés une seule fois ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1;   transform: scale(1);   }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        @keyframes glow-send {
          0%, 100% { box-shadow: 0 0 8px  rgba(59,130,246,.4); }
          50%       { box-shadow: 0 0 20px rgba(59,130,246,.8); }
        }
        @keyframes msgPop {
          0%   { opacity: 0; transform: scale(0.88) translateY(8px); }
          70%  { transform: scale(1.03) translateY(-2px); }
          100% { opacity: 1; transform: scale(1)    translateY(0);   }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); opacity: .3; }
          40%            { transform: scale(1); opacity: 1;  }
        }
        .msg-mine  { animation: msgPop .35s cubic-bezier(.34,1.56,.64,1) both; }
        .msg-other { animation: fadeSlideUp .3s ease both; }
        .msg-new   { animation: msgPop .45s cubic-bezier(.34,1.56,.64,1) both; }
        .skeleton  {
          background: linear-gradient(90deg,
            rgba(255,255,255,.04) 25%,
            rgba(255,255,255,.10) 50%,
            rgba(255,255,255,.04) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .send-btn-active { animation: glow-send 2s ease-in-out infinite; }
        .dot1 { animation: typing .9s  .0s infinite; }
        .dot2 { animation: typing .9s  .2s infinite; }
        .dot3 { animation: typing .9s  .4s infinite; }
      `}</style>

      <div
        className="flex flex-col h-full rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0f0f1e 0%, #12121f 100%)',
          border: '1px solid rgba(99,102,241,.25)',
          boxShadow: '0 0 40px rgba(99,102,241,.08), 0 20px 60px rgba(0,0,0,.5)',
        }}
      >

        {/* ═══════════════ EN-TÊTE ═══════════════ */}
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(99,102,241,.15) 0%, rgba(6,182,212,.08) 100%)',
            borderBottom: '1px solid rgba(99,102,241,.2)',
            animation: 'fadeSlideDown .4s ease both',
          }}
          className="flex items-center justify-between gap-3 px-5 py-4"
        >
          {/* Avatar + nom */}
          <div className="flex items-center gap-3">
            <div
              className="relative w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                boxShadow: '0 0 16px rgba(99,102,241,.5)',
              }}
            >
              <User size={20} className="text-white" />
              {/* Pastille online */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{
                  background: connected ? '#10b981' : '#ef4444',
                  borderColor: '#12121f',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }}
              />
            </div>
            <div>
              <p className="font-semibold text-white text-sm leading-tight">
                {destinataireNom || destinataireId}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {connected
                  ? <Wifi size={11} className="text-emerald-400" />
                  : <WifiOff size={11} className="text-red-400" />}
                <p className="text-xs" style={{ color: connected ? '#10b981' : '#ef4444' }}>
                  {connected ? 'Connecté · actualisation 15s' : 'Hors ligne'}
                </p>
              </div>
            </div>
          </div>

          {/* Compteur */}
          {messages.length > 0 && (
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{
                background: 'rgba(99,102,241,.15)',
                border: '1px solid rgba(99,102,241,.3)',
                color: '#a5b4fc',
              }}
            >
              {messages.length} message{messages.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ═══════════════ ZONE MESSAGES ═══════════════ */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 space-y-1"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(99,102,241,.3) transparent',
          }}
        >

          {/* Skeleton chargement */}
          {loading && (
            <div className="space-y-4 py-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="skeleton h-12 rounded-2xl"
                    style={{ width: `${45 + i * 12}%` }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Vide */}
          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(99,102,241,.08)',
                  border: '1px dashed rgba(99,102,241,.3)',
                }}
              >
                <MessageSquare size={32} style={{ color: 'rgba(99,102,241,.4)' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,.35)' }}>
                Aucun message — démarrez la conversation
              </p>
            </div>
          )}

          {/* Messages groupés par date */}
          {!loading && Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              {/* Séparateur date */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,.06)' }} />
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,.05)',
                    color: 'rgba(255,255,255,.3)',
                    border: '1px solid rgba(255,255,255,.07)',
                  }}
                >
                  {date}
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,.06)' }} />
              </div>

              <div className="space-y-2">
                {msgs.map((msg, idx) => {
                  const isMine  = msg.expediteurId === user.id
                  const isNew   = newMsgIds.has(msg.id)
                  const prevMsg = msgs[idx - 1]
                  const sameSender = prevMsg && prevMsg.expediteurId === msg.expediteurId
                  const delay = Math.min(idx * 0.04, 0.3)

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}
                        ${sameSender ? 'mt-1' : 'mt-3'}
                        ${isNew ? 'msg-new' : isMine ? 'msg-mine' : 'msg-other'}`}
                      style={{ animationDelay: isNew ? '0s' : `${delay}s` }}
                    >
                      {/* Avatar (autres) */}
                      {!isMine && !sameSender && (
                        <div
                          className="w-7 h-7 rounded-full flex-shrink-0 mr-2 self-end
                            flex items-center justify-center text-xs font-bold"
                          style={{
                            background: 'linear-gradient(135deg,#6366f1,#06b6d4)',
                            boxShadow: '0 0 10px rgba(99,102,241,.4)',
                          }}
                        >
                          {(destinataireNom || destinataireId)[0]?.toUpperCase()}
                        </div>
                      )}
                      {!isMine && sameSender && <div className="w-7 mr-2 flex-shrink-0" />}

                      {/* Bulle */}
                      <div
                        className="relative max-w-[72%] group"
                        style={{
                          ...(isMine ? {
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            borderRadius: '18px 18px 4px 18px',
                            boxShadow: isNew
                              ? '0 0 20px rgba(99,102,241,.7), 0 4px 20px rgba(0,0,0,.4)'
                              : '0 0 12px rgba(99,102,241,.3), 0 4px 16px rgba(0,0,0,.3)',
                          } : {
                            background: 'rgba(255,255,255,.06)',
                            border: '1px solid rgba(255,255,255,.1)',
                            borderRadius: '18px 18px 18px 4px',
                            boxShadow: '0 4px 16px rgba(0,0,0,.2)',
                          }),
                          transition: 'box-shadow .3s ease',
                        }}
                      >
                        <div className="px-4 py-2.5">
                          <p
                            className="text-sm leading-relaxed break-words"
                            style={{ color: isMine ? '#fff' : 'rgba(255,255,255,.88)' }}
                          >
                            {msg.contenu}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <p
                              className="text-xs"
                              style={{ color: isMine ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.3)' }}
                            >
                              {formatDate(msg.dateEnvoi)}
                            </p>
                            {isMine && (
                              <CheckCheck
                                size={12}
                                style={{ color: 'rgba(255,255,255,.5)' }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Reflet brillant sur bulle "mine" */}
                        {isMine && (
                          <div
                            className="absolute inset-0 pointer-events-none rounded-[inherit]"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,.12) 0%, transparent 60%)',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* ═══════════════ FORMULAIRE ENVOI ═══════════════ */}
        <form
          onSubmit={envoyer}
          style={{
            borderTop: '1px solid rgba(99,102,241,.15)',
            background: 'rgba(15,15,30,.95)',
            backdropFilter: 'blur(12px)',
          }}
          className="px-4 py-3"
        >
          <div className="flex items-end gap-3">

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={contenu}
                onChange={e => setContenu(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); envoyer(e)
                  }
                }}
                placeholder="Écrivez votre message… (↵ pour envoyer)"
                rows={2}
                className="w-full resize-none text-sm outline-none transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,.05)',
                  border: contenu.trim()
                    ? '1px solid rgba(99,102,241,.5)'
                    : '1px solid rgba(255,255,255,.08)',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  color: 'rgba(255,255,255,.9)',
                  lineHeight: '1.5',
                  boxShadow: contenu.trim()
                    ? '0 0 0 3px rgba(99,102,241,.12), inset 0 1px 3px rgba(0,0,0,.2)'
                    : 'inset 0 1px 3px rgba(0,0,0,.2)',
                  scrollbarWidth: 'none',
                }}
              />
              {/* Compteur caractères */}
              {contenu.length > 0 && (
                <span
                  className="absolute bottom-2 right-2 text-xs pointer-events-none"
                  style={{ color: 'rgba(255,255,255,.2)' }}
                >
                  {contenu.length}
                </span>
              )}
            </div>

            {/* Bouton envoyer */}
            <button
              type="submit"
              disabled={!contenu.trim() || sending}
              className={`
                flex-shrink-0 flex items-center justify-center gap-2
                text-sm font-semibold rounded-2xl px-5 py-3
                transition-all duration-300
                ${contenu.trim() && !sending ? 'send-btn-active' : ''}
              `}
              style={{
                background: contenu.trim() && !sending
                  ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #06b6d4 100%)'
                  : 'rgba(255,255,255,.06)',
                color: contenu.trim() && !sending ? '#fff' : 'rgba(255,255,255,.25)',
                border: contenu.trim() && !sending
                  ? '1px solid rgba(99,102,241,.4)'
                  : '1px solid rgba(255,255,255,.06)',
                cursor: !contenu.trim() || sending ? 'not-allowed' : 'pointer',
                transform: contenu.trim() && !sending ? 'translateY(0)' : 'translateY(0)',
                minWidth: '100px',
                height: '48px',
              }}
              onMouseEnter={e => {
                if (contenu.trim() && !sending)
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
              }}
            >
              {sending ? (
                <>
                  <span className="flex gap-1 items-center">
                    <span className="dot1 w-1.5 h-1.5 rounded-full bg-white inline-block" />
                    <span className="dot2 w-1.5 h-1.5 rounded-full bg-white inline-block" />
                    <span className="dot3 w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  </span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  Envoyer
                </>
              )}
            </button>

          </div>

          {/* Hint raccourci clavier */}
          <p
            className="text-xs mt-2 text-center"
            style={{ color: 'rgba(255,255,255,.15)' }}
          >
            ↵ Envoyer &nbsp;·&nbsp; ⇧↵ Nouvelle ligne
          </p>
        </form>

      </div>
    </>
  )
}