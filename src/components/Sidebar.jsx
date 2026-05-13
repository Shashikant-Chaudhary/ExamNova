// ─────────────────────────────────────────────
// Sidebar.jsx  —  Premium redesign
// Clean ExamAI logo (no icon), professional UI
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import Logo from './Logo'




const NAV_ITEMS = [
  { id: 'home',        label: 'Home',            icon: '⌂',  desc: 'Exam Hub'            },
  { id: 'exams',       label: 'Exams',           icon: '📋', desc: 'Browse all exams'    },
  { id: 'current',     label: 'Current Affairs', icon: '◆',  desc: 'Latest news & Q'     },
  { id: 'shifts',      label: 'Shift Papers',    icon: '▤',  desc: 'Previous papers'     },
  { id: 'leaderboard', label: 'Leaderboard',     icon: '⊱',  desc: 'Top students'        },
  { id: 'dashboard',   label: 'My Progress',     icon: '⬆',  desc: 'Your stats'          },
  { id: 'saved',       label: 'Saved Questions', icon: '🔖', desc: 'Bookmarked questions' },
  { id: 'settings',    label: 'Settings',        icon: '⚙',  desc: 'Theme & language'    },
]

// Profile photo cache
const photoCache = {}

// ── Install Icon Button ──────────────────────
// Always visible in the mobile top bar.
//   canInstall  → native install dialog
//   isInstalled → green tick, no action
//   iOS/other   → tooltip with manual instructions
function InstallIconButton({ installPrompt, appInstalled, onInstallClick }) {
  const [showTip, setShowTip] = useState(false)

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isInstalled  = appInstalled || isStandalone
  const isIOS        = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const canInstall   = !!installPrompt && !isInstalled

  const handleClick = () => {
    if (canInstall)      { onInstallClick?.() }
    else if (!isInstalled) { setShowTip(t => !t) }
  }

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={handleClick}
        title={isInstalled ? 'App Installed' : 'Install ExamNova App'}
        style={{
          width: 34, height: 34, borderRadius: 9,
          border: `1px solid ${isInstalled ? 'rgba(34,197,94,.4)' : 'rgba(59,130,246,.35)'}`,
          background: isInstalled ? 'rgba(34,197,94,.1)' : 'rgba(59,130,246,.1)',
          color: isInstalled ? 'var(--green)' : '#3b82f6',
          cursor: isInstalled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, transition: 'all 0.18s',
        }}
      >
        {isInstalled ? '✓' : '⬇'}
      </button>

      {showTip && !isInstalled && (
        <>
          <div onClick={() => setShowTip(false)} style={{ position:'fixed', inset:0, zIndex:9998 }} />
          <div style={{
            position:'absolute', top:42, right:0,
            background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:12, padding:'14px 16px',
            width:220, zIndex:9999,
            boxShadow:'0 8px 32px rgba(0,0,0,.35)',
          }}>
            <div style={{ fontSize:13, fontWeight:700, marginBottom:6, color:'var(--text)' }}>
              📲 Install ExamNova
            </div>
            {isIOS ? (
              <div style={{ fontSize:12, color:'var(--muted2)', lineHeight:1.6 }}>
                Tap the <strong style={{ color:'var(--text)' }}>Share</strong> icon in Safari, then tap <strong style={{ color:'var(--text)' }}>"Add to Home Screen"</strong>.
              </div>
            ) : (
              <div style={{ fontSize:12, color:'var(--muted2)', lineHeight:1.6 }}>
                Open in <strong style={{ color:'var(--text)' }}>Chrome</strong> on Android or desktop to get the install prompt.
              </div>
            )}
            <div style={{ position:'absolute', top:-6, right:10, width:10, height:10, background:'var(--surface)', border:'1px solid var(--border)', transform:'rotate(45deg)', borderBottom:'none', borderRight:'none' }} />
          </div>
        </>
      )}
    </div>
  )
}

export default function Sidebar({
  user, currentScreen, activeNav, navigate, onLogout,
  language, onLanguageChange, selectedExam,
  isCollapsed, onCollapse, theme, onThemeChange,
  // PWA install
  installPrompt, appInstalled, onInstallClick,
}) {
  const [isOpen,    setIsOpen]    = useState(false)
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768)
  const [tooltip,   setTooltip]   = useState(null)
  const [userPhoto, setUserPhoto] = useState(null)

  useEffect(() => {
    // Load profile photo
    const userId = user?.id || user?.uid
    if (!userId) return
    if (photoCache[userId]) { setUserPhoto(photoCache[userId]); return }
    import('../services/profileService').then(({ getProfilePhoto }) => {
      getProfilePhoto(userId).then(photo => {
        if (photo) { photoCache[userId] = photo; setUserPhoto(photo) }
      })
    })
  }, [user?.id, user?.uid])

  const setIsCollapsed = (val) => onCollapse?.(typeof val === 'function' ? val(isCollapsed) : val)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setIsOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) setIsOpen(false)
  }, [currentScreen])

  const handleNavigate = (screen) => {
    navigate(screen)
    if (isMobile) setIsOpen(false)
  }

  const firstName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1).split(' ')[0]
    : 'User'

  const collapsed = isCollapsed && !isMobile

  // Show install button: only if prompt available and not yet installed
  const showInstall = !!installPrompt && !appInstalled

  return (
    <>
      <style>{`
        @keyframes sbFadeIn  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes sbPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
        @keyframes sbTooltip { from{opacity:0;transform:translateY(-50%) translateX(-4px)} to{opacity:1;transform:translateY(-50%) translateX(0)} }
        @keyframes sbInstall { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
        .sb-nav-btn { transition: all 0.18s ease !important; }
        .sb-nav-btn:hover { background: rgba(255,255,255,0.06) !important; color: var(--text) !important; }
        .sb-nav-btn:active { transform: scale(0.97) !important; }
        .sb-collapse:hover { background: rgba(255,255,255,0.1) !important; color: var(--text) !important; border-color: var(--border2) !important; }
        .sb-logout:hover { background: rgba(239,68,68,0.1) !important; border-color: rgba(239,68,68,0.35) !important; color: #f87171 !important; }
        .sb-install:hover { background: rgba(59,130,246,0.18) !important; border-color: rgba(59,130,246,0.5) !important; transform: translateY(-1px) !important; box-shadow: 0 4px 12px rgba(59,130,246,0.25) !important; }
        .sb-install:active { transform: scale(0.97) !important; }
      `}</style>

      {/* ── MOBILE TOP BAR ── */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 56,
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', zIndex: 150,
        }}>
          <button onClick={() => setIsOpen(o => !o)} style={{
            width: 38, height: 38, borderRadius: 10,
            border: `1px solid ${isOpen ? 'rgba(249,115,22,0.35)' : 'var(--border)'}`,
            background: isOpen ? 'rgba(249,115,22,0.1)' : 'var(--surface)',
            color: isOpen ? 'var(--accent)' : 'var(--text)',
            fontSize: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>{isOpen ? '✕' : '☰'}</button>

          <div onClick={() => { navigate('about'); setIsOpen(false) }} style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5, cursor:'pointer' }}>
            Exam<span style={{ color: 'var(--accent)' }}>Nova</span>
          </div>

          {/* Right side: Download → Language → Share */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* ── Download / Install icon — always visible ── */}
            <InstallIconButton
              installPrompt={installPrompt}
              appInstalled={appInstalled}
              onInstallClick={onInstallClick}
            />

            {/* ── Language toggle ── */}
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {[['english','EN'],['hindi','हि']].map(([l, lbl]) => (
                <button key={l} onClick={() => onLanguageChange?.(l)} style={{
                  padding: '5px 10px', border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, transition: 'all 0.15s',
                  background: language === l ? 'var(--accent)' : 'transparent',
                  color: language === l ? 'white' : 'var(--muted)',
                }}>{lbl}</button>
              ))}
            </div>

            {/* ── Share icon (replaces profile) ── */}
            <button
              onClick={() => {
                const shareData = {
                  title: 'ExamNova — Government Exam Prep',
                  text: 'Prepare for SSC, Railway, Banking & UPSC with AI-powered questions, mock tests and current affairs — 100% Free!',
                  url: 'https://examnova.co.in',
                }
                if (navigator.share) {
                  navigator.share(shareData).catch(() => {})
                } else {
                  // Fallback — copy link to clipboard
                  navigator.clipboard?.writeText(shareData.url).then(() => {
                    alert('Link copied to clipboard!')
                  }).catch(() => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`, '_blank')
                  })
                }
              }}
              title="Share ExamNova"
              style={{
                width: 34, height: 34, borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
                cursor: 'pointer', padding: 0, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)' }}
            >
              {/* Share SVG icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── MOBILE OVERLAY ── */}
      {isMobile && isOpen && (
        <div onClick={() => setIsOpen(false)} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 190,
        }} />
      )}

      {/* ── SIDEBAR ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: isMobile ? 200 : 100,
        width: isMobile ? 248 : collapsed ? 64 : 248,
        transform: isMobile
          ? isOpen ? 'translateX(0)' : 'translateX(-100%)'
          : 'translateX(0)',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        overflowY: 'auto', overflowX: 'hidden',
      }}
        onWheel={e => e.stopPropagation()}
      >

        {/* ── LOGO ROW ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '20px 0' : '20px 16px',
          borderBottom: '1px solid var(--border)',
          minHeight: 64, flexShrink: 0,
        }}>
          {/* Expanded — N-mark + ExamNova text */}
          {!collapsed && (
            <div
              onClick={() => handleNavigate('about')}
              title="About ExamNova"
              style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', transition:'opacity .15s', userSelect:'none' }}
              onMouseEnter={e=>e.currentTarget.style.opacity='.7'}
              onMouseLeave={e=>e.currentTarget.style.opacity='1'}
            >
              <Logo size={30} />
              <span style={{ fontSize:20, fontWeight:800, letterSpacing:-0.5, lineHeight:1 }}>
                Exam<span style={{ color:'var(--accent)' }}>Nova</span>
              </span>
            </div>
          )}

          {/* Collapsed — N-mark icon — clickable */}
          {collapsed && (
            <div
              onClick={() => handleNavigate('about')}
              title="About ExamNova"
              style={{ cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.08)' }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none' }}
            >
              <Logo size={34} />
            </div>
          )}

          {/* Collapse toggle */}
          {!isMobile && (
            <button className="sb-collapse" onClick={() => setIsCollapsed(c => !c)} style={{
              width: 26, height: 26, borderRadius: 7, flexShrink: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, transition: 'all 0.18s',
            }}>{collapsed ? '›' : '‹'}</button>
          )}
        </div>

        {/* ── USER PROFILE CARD (top) ── */}
        {!collapsed && (
          <div
            onClick={() => handleNavigate('profile')}
            style={{
              margin: '10px 10px 4px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: 12, padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer', transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.06)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              overflow: 'hidden', background: 'linear-gradient(135deg, var(--accent), #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 800, color: '#fff',
              boxShadow: '0 3px 10px rgba(249,115,22,0.3)',
            }}>
              {userPhoto
                ? <img src={userPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user?.name?.charAt(0)?.toUpperCase()
              }
            </div>
            {/* Name + email */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {firstName}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                {user?.email}
              </div>
            </div>
            {/* Profile arrow */}
            <div style={{ fontSize: 10, color: 'var(--muted)', flexShrink: 0 }}>›</div>
          </div>
        )}

        {/* Collapsed — avatar only with tooltip (top) */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}
            onMouseEnter={() => setTooltip('__user_top')}
            onMouseLeave={() => setTooltip(null)}
          >
            <div style={{ position: 'relative' }}>
              <div onClick={() => handleNavigate('profile')} style={{
                width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--accent), #ea580c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#fff',
                boxShadow: '0 3px 10px rgba(249,115,22,0.3)', cursor: 'pointer',
              }}>
                {userPhoto
                  ? <img src={userPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user?.name?.charAt(0)?.toUpperCase()
                }
              </div>
              {tooltip === '__user_top' && (
                <div style={{
                  position: 'absolute', left: 'calc(100% + 10px)', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--surface)', border: '1px solid var(--border2)',
                  borderRadius: 9, padding: '7px 12px',
                  fontSize: 12, whiteSpace: 'nowrap',
                  zIndex: 9999, boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                  pointerEvents: 'none', animation: 'sbTooltip 0.15s ease',
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{firstName}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>{user?.email}</div>
                  <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '5px solid var(--border2)' }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EXAM BADGE ── */}
        {selectedExam && !collapsed && (
          <div style={{
            margin: '10px 10px 4px',
            background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.04))',
            border: '1px solid rgba(249,115,22,0.22)',
            borderRadius: 12, padding: '8px 11px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: 'var(--accent)',
              boxShadow: '0 0 6px var(--accent)',
              animation: 'sbPulse 2.5s infinite',
            }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 1 }}>
                Practicing
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedExam}
              </div>
            </div>
          </div>
        )}

        {/* Collapsed exam dot */}
        {selectedExam && collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px' }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)',
              animation: 'sbPulse 2.5s infinite',
            }} />
          </div>
        )}

        {/* ── NAV ITEMS ── */}
        <nav style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((item, idx) => {
            // activeNav tracks last clicked item exactly
            // 'home' item: active when activeNav==='home' OR on examhub (exam detail)
            // 'exams' item: active ONLY when activeNav==='exams'
            // all others: active when activeNav matches
            const active = activeNav
              ? (item.id === 'home'
                  ? (activeNav === 'home' || (activeNav !== 'exams' && currentScreen === 'examhub'))
                  : activeNav === item.id)
              : currentScreen === item.id
            return (
              <button key={item.id}
                className="sb-nav-btn"
                onClick={() => handleNavigate(item.id)}
                onMouseEnter={() => collapsed && setTooltip(item.id)}
                onMouseLeave={() => setTooltip(null)}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '10px 0' : '9px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 12, border: 'none', cursor: 'pointer',
                  width: '100%', textAlign: 'left',
                  background: active
                    ? 'linear-gradient(135deg, rgba(249,115,22,0.16), rgba(249,115,22,0.06))'
                    : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--muted2)',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(249,115,22,0.2)' : 'none',
                  animation: `sbFadeIn 0.3s ${idx * 0.035}s both`,
                }}
              >
                {/* Active left pill */}
                {active && (
                  <div style={{
                    position: 'absolute', left: 0, top: '18%', bottom: '18%',
                    width: 3, borderRadius: '0 4px 4px 0',
                    background: 'linear-gradient(180deg, var(--accent), #ea580c)',
                    boxShadow: '2px 0 10px rgba(249,115,22,0.5)',
                  }} />
                )}

                {/* Icon box */}
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16,
                  background: active
                    ? 'rgba(249,115,22,0.18)'
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${active
                    ? 'rgba(249,115,22,0.28)'
                    : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: active ? '0 2px 8px rgba(249,115,22,0.2)' : 'none',
                  transition: 'all 0.18s',
                }}>
                  {item.icon}
                </div>

                {/* Label + desc */}
                {!collapsed && (
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{
                      fontSize: 13, lineHeight: 1.25,
                      fontWeight: active ? 700 : 500,
                      color: active ? 'var(--accent)' : 'var(--text)',
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: 10, marginTop: 1,
                      color: active ? 'rgba(249,115,22,0.55)' : 'var(--muted)',
                    }}>
                      {item.desc}
                    </div>
                  </div>
                )}

                {/* Active dot (collapsed) */}
                {active && collapsed && (
                  <div style={{
                    position: 'absolute', right: 5, top: '50%', transform: 'translateY(-50%)',
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)',
                  }} />
                )}

                {/* Tooltip (collapsed) */}
                {tooltip === item.id && collapsed && (
                  <div style={{
                    position: 'absolute', left: 'calc(100% + 12px)', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'var(--surface)', border: '1px solid var(--border2)',
                    borderRadius: 9, padding: '7px 12px',
                    pointerEvents: 'none', whiteSpace: 'nowrap',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                    zIndex: 9999, animation: 'sbTooltip 0.15s ease',
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: active ? 'var(--accent)' : 'var(--text)' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                      {item.desc}
                    </div>
                    {/* Arrow */}
                    <div style={{
                      position: 'absolute', right: '100%', top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0, height: 0,
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderRight: '5px solid var(--border2)',
                    }} />
                  </div>
                )}
              </button>
            )
          })}

          {/* ── DARK / LIGHT TOGGLE — after Settings ── */}
          {!collapsed && (
            <div style={{ display:'flex', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', margin:'6px 0 2px' }}>
              {[{id:'dark',icon:'🌙',label:'Dark'},{id:'light',icon:'☀️',label:'Light'}].map(m => {
                const isActive = theme?.startsWith(m.id)
                return (
                  <button key={m.id}
                    onClick={() => { const accent = theme?.split('-')[1]||'orange'; onThemeChange?.(`${m.id}-${accent}`) }}
                    style={{ flex:1, padding:'7px 0', border:'none', background:isActive?'var(--surface)':'transparent', color:isActive?'var(--accent)':'var(--muted)', fontSize:11, fontWeight:isActive?700:500, cursor:'pointer', transition:'all .15s', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
                    {m.icon} {m.label}
                  </button>
                )
              })}
            </div>
          )}
          {collapsed && (
            <div style={{ display:'flex', justifyContent:'center', marginTop:4, marginBottom:2 }}>
              <button
                onClick={() => { const accent=theme?.split('-')[1]||'orange'; const next=theme?.startsWith('dark')?'light':'dark'; onThemeChange?.(`${next}-${accent}`) }}
                title={theme?.startsWith('dark')?'Switch to Light':'Switch to Dark'}
                style={{ width:36, height:36, borderRadius:9, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--muted2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, transition:'all .15s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--muted2)' }}
              >
                {theme?.startsWith('dark') ? '☀️' : '🌙'}
              </button>
            </div>
          )}

        </nav>

        {/* ── BOTTOM ── */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: collapsed ? '10px 8px' : '10px',
          flexShrink: 0,
        }}>

          {!collapsed ? (
            <>
              {/* ── Install App button (expanded) ── */}
              {showInstall && (
                <button
                  className="sb-install"
                  onClick={onInstallClick}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 10, marginBottom: 8,
                    background: 'rgba(59,130,246,.08)',
                    border: '1px solid rgba(59,130,246,.28)',
                    color: '#3b82f6', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 9,
                    transition: 'all 0.18s', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(59,130,246,.15)',
                    border: '1px solid rgba(59,130,246,.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, animation: 'sbInstall 2s ease-in-out infinite',
                  }}>⬇</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6' }}>Install App</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>Add to home screen</div>
                  </div>
                </button>
              )}

            </>
          ) : (
            <>
              {/* ── Install App button (collapsed icon) ── */}
              {showInstall && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}
                  onMouseEnter={() => setTooltip('__install')}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div style={{ position: 'relative' }}>
                    <button
                      className="sb-install"
                      onClick={onInstallClick}
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'rgba(59,130,246,.1)',
                        border: '1px solid rgba(59,130,246,.28)',
                        color: '#3b82f6', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, transition: 'all 0.18s',
                        animation: 'sbInstall 2s ease-in-out infinite',
                      }}
                    >⬇</button>
                    {tooltip === '__install' && (
                      <div style={{
                        position: 'absolute', left: 'calc(100% + 10px)', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'var(--surface)', border: '1px solid var(--border2)',
                        borderRadius: 9, padding: '7px 12px',
                        fontSize: 12, whiteSpace: 'nowrap', zIndex: 9999,
                        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                        pointerEvents: 'none', animation: 'sbTooltip 0.15s ease',
                      }}>
                        <div style={{ fontWeight: 700, color: '#3b82f6' }}>Install App</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>Add to home screen</div>
                        <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '5px solid var(--border2)' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Collapsed logout with tooltip */}
              <div style={{ display: 'flex', justifyContent: 'center' }}
                onMouseEnter={() => setTooltip('__logout')}
                onMouseLeave={() => setTooltip(null)}
              >
                <div style={{ position: 'relative' }}>
                  <button className="sb-logout" onClick={onLogout} style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    color: 'var(--muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, transition: 'all 0.18s',
                  }}>🚪</button>
                  {tooltip === '__logout' && (
                    <div style={{
                      position: 'absolute', left: 'calc(100% + 10px)', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--surface)', border: '1px solid var(--border2)',
                      borderRadius: 9, padding: '7px 12px',
                      fontSize: 12, fontWeight: 600, color: 'var(--text)',
                      whiteSpace: 'nowrap', zIndex: 9999,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                      pointerEvents: 'none', animation: 'sbTooltip 0.15s ease',
                    }}>
                      Logout
                      <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '5px solid var(--border2)' }} />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </>
  )
}