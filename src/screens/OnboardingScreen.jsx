// ─────────────────────────────────────────────
// OnboardingScreen.jsx  —  v3
// Testbook / Adda247 style professional slide tour
// Last slide includes PWA install button
// ─────────────────────────────────────────────

import { useState, useRef } from 'react'

const SLIDES = [
  {
    id: 'welcome',
    badge: "🇮🇳 India's Smart Exam Prep",
    headline: ['Crack Your ', 'Government Exam'],
    sub: "AI-powered preparation for SSC, Railway, Banking & UPSC. Personalised. Free. Effective.",
    accent: '#f97316',
    bg: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,.12) 0%, transparent 65%)',
  },
  {
    id: 'ai',
    badge: '🤖 AI Question Engine',
    headline: ['Questions That ', 'Match Real Exams'],
    sub: 'Fresh questions every session — aligned with your exam pattern, difficulty level, and previous year trends.',
    accent: '#3b82f6',
    bg: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,.1) 0%, transparent 65%)',
  },
  {
    id: 'mock',
    badge: '📝 Full Mock Tests',
    headline: ['Test Yourself Like ', 'the Real Exam'],
    sub: 'Full-length timed mocks with section-wise scoring, negative marking, and deep performance analytics.',
    accent: '#a855f7',
    bg: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,.1) 0%, transparent 65%)',
  },
  {
    id: 'progress',
    badge: '📊 Smart Progress Tracking',
    headline: ['Know Exactly ', 'Where You Stand'],
    sub: 'Track your daily streak, spot weak topics, and watch your score improve with every session.',
    accent: '#22c55e',
    bg: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,.1) 0%, transparent 65%)',
  },
  {
    id: 'go',
    badge: "🚀 You're all set!",
    headline: ['Start Your ', 'Journey Today'],
    sub: 'Thousands of students use ExamNova daily to crack their dream government jobs. Your turn starts now.',
    accent: '#eab308',
    bg: 'radial-gradient(ellipse at 50% 0%, rgba(234,179,8,.1) 0%, transparent 65%)',
  },
]

// ── Slide visuals ────────────────────────────

function WelcomeVisual() {
  return (
    <div style={{ position:'relative', width:200, height:200, margin:'0 auto' }}>
      <style>{`@keyframes obSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1.5px dashed rgba(249,115,22,.25)', animation:'obSpin 14s linear infinite' }} />
      <div style={{ position:'absolute', inset:18, borderRadius:'50%', border:'1.5px dashed rgba(59,130,246,.18)', animation:'obSpin 9s linear infinite reverse' }} />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, boxShadow:'0 0 36px rgba(249,115,22,.45)' }}>🎯</div>
      {[{i:'✏️',a:0},{i:'📝',a:72},{i:'📊',a:144},{i:'📰',a:216},{i:'🏆',a:288}].map(({ i, a }) => {
        const r = a * Math.PI / 180
        return (
          <div key={a} style={{ position:'absolute', width:32, height:32, borderRadius:8, background:'var(--surface)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, boxShadow:'0 3px 10px rgba(0,0,0,.25)', left:100+78*Math.cos(r)-16, top:100+78*Math.sin(r)-16 }}>
            {i}
          </div>
        )
      })}
    </div>
  )
}

function AIVisual() {
  return (
    <div style={{ width:260, margin:'0 auto', position:'relative' }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'16px', boxShadow:'0 16px 48px rgba(0,0,0,.28)' }}>
        <div style={{ fontSize:10, fontWeight:700, color:'#3b82f6', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px' }}>📋 SSC CGL · Quantitative Aptitude</div>
        <div style={{ fontSize:13, fontWeight:600, lineHeight:1.6, marginBottom:14, color:'var(--text)' }}>
          A train travels 360 km in 4 hours.<br />What is its speed in m/s?
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7 }}>
          {[['A. 25 m/s',true],['B. 30 m/s',false],['C. 22.5 m/s',false],['D. 35 m/s',false]].map(([opt,correct],i) => (
            <div key={i} style={{ padding:'8px 10px', borderRadius:8, fontSize:11, fontWeight:600, background:correct?'rgba(34,197,94,.12)':'var(--surface2)', border:`1px solid ${correct?'rgba(34,197,94,.4)':'var(--border)'}`, color:correct?'var(--green)':'var(--muted2)' }}>
              {opt} {correct?'✓':''}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position:'absolute', top:-10, right:-6, background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', borderRadius:20, padding:'4px 12px', fontSize:10, fontWeight:800, color:'white', boxShadow:'0 4px 12px rgba(59,130,246,.45)' }}>
        ⚡ AI Generated
      </div>
    </div>
  )
}

function MockVisual() {
  return (
    <div style={{ width:260, margin:'0 auto' }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'16px', boxShadow:'0 16px 48px rgba(0,0,0,.28)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:10, color:'var(--muted)', marginBottom:2 }}>Mock Test #3 · SSC CGL</div>
            <div style={{ fontSize:22, fontWeight:900 }}>142<span style={{ fontSize:12, color:'var(--muted)', fontWeight:400 }}>/200</span></div>
          </div>
          <div style={{ width:50, height:50, borderRadius:'50%', background:'rgba(168,85,247,.12)', border:'2px solid #a855f7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:'#a855f7' }}>71%</div>
        </div>
        {[{l:'Quant',p:80,c:'#3b82f6'},{l:'English',p:65,c:'#f97316'},{l:'Reasoning',p:75,c:'#a855f7'},{l:'GK',p:60,c:'#22c55e'}].map(s => (
          <div key={s.l} style={{ marginBottom:7 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:3, color:'var(--muted)' }}>
              <span>{s.l}</span><span style={{ fontWeight:700, color:s.c }}>{s.p}%</span>
            </div>
            <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
              <div style={{ height:'100%', width:`${s.p}%`, background:s.c, borderRadius:2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressVisual() {
  return (
    <div style={{ width:260, margin:'0 auto' }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'16px', boxShadow:'0 16px 48px rgba(0,0,0,.28)' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7, marginBottom:14 }}>
          {[{v:'24🔥',l:'Streak',c:'#f97316'},{v:'78%',l:'Avg Score',c:'#22c55e'},{v:'312',l:'Questions',c:'#3b82f6'}].map(st => (
            <div key={st.l} style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 6px', textAlign:'center' }}>
              <div style={{ fontSize:15, fontWeight:900, color:st.c }}>{st.v}</div>
              <div style={{ fontSize:9, color:'var(--muted)', marginTop:2 }}>{st.l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:10, color:'var(--muted)', marginBottom:6 }}>Activity — last 5 weeks</div>
        <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
          {[4,6,2,7,5,3,6,5,0,4,6,7,3,5,4,6,2,5,7,6,4,3,5,6,4,7,3,5,6,7,5,4,6,5,7].map((v,i) => (
            <div key={i} style={{ width:10, height:10, borderRadius:2, background:v===0?'var(--border)':`rgba(249,115,22,${0.15+v*0.11})` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Last slide visual — trophy + install card
function GoVisual({ installPrompt, appInstalled, onInstallClick }) {
  const [installed, setInstalled] = useState(appInstalled)
  const [installing, setInstalling] = useState(false)

  const handleInstall = async () => {
    if (!installPrompt) return
    setInstalling(true)
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      onInstallClick?.()
    }
    setInstalling(false)
  }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const alreadyInstalled = installed || appInstalled || isStandalone

  return (
    <div style={{ textAlign:'center', width:'100%', maxWidth:300, margin:'0 auto' }}>
      <div style={{ fontSize:72, lineHeight:1, marginBottom:16, filter:'drop-shadow(0 8px 24px rgba(234,179,8,.45))' }}>🏆</div>

      {/* Exam tags */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, justifyContent:'center', marginBottom:20 }}>
        {['SSC CGL','RRB NTPC','IBPS PO','SSC GD','UPSC','SBI PO','SSC CHSL','RRB Group D'].map(e => (
          <div key={e} style={{ padding:'4px 12px', background:'rgba(249,115,22,.1)', border:'1px solid rgba(249,115,22,.25)', borderRadius:20, fontSize:11, fontWeight:600, color:'var(--accent)' }}>
            {e}
          </div>
        ))}
      </div>

      {/* Install card — shown only if prompt is available */}
      {installPrompt && !alreadyInstalled && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,.1), rgba(59,130,246,.04))',
          border: '1px solid rgba(59,130,246,.3)',
          borderRadius: 14, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ fontSize:28, flexShrink:0 }}>📲</div>
          <div style={{ flex:1, textAlign:'left' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>
              Install ExamNova App
            </div>
            <div style={{ fontSize:11, color:'var(--muted2)', lineHeight:1.4 }}>
              Add to home screen — works offline, loads faster
            </div>
          </div>
          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              padding:'8px 14px', borderRadius:9, flexShrink:0,
              background:'#3b82f6', border:'none',
              color:'white', fontSize:12, fontWeight:700,
              cursor: installing ? 'wait' : 'pointer',
              opacity: installing ? 0.7 : 1,
              transition:'all .15s',
            }}
          >
            {installing ? '...' : '⬇ Install'}
          </button>
        </div>
      )}

      {/* Already installed confirmation */}
      {alreadyInstalled && (
        <div style={{ background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.3)', borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, justifyContent:'center' }}>
          <span style={{ fontSize:20 }}>✅</span>
          <span style={{ fontSize:13, fontWeight:600, color:'var(--green)' }}>App installed on your device!</span>
        </div>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────

export default function OnboardingScreen({ user, onComplete, installPrompt, appInstalled, onInstallClick }) {
  const [current,  setCurrent]  = useState(0)
  const [leaving,  setLeaving]  = useState(false)
  const [dir,      setDir]      = useState(1)
  const touchStart               = useRef(null)

  const firstName = user?.name
    ? user.name.split(' ')[0].charAt(0).toUpperCase() + user.name.split(' ')[0].slice(1)
    : 'Student'

  const isLast = current === SLIDES.length - 1

  const goTo = (idx) => {
    if (leaving || idx === current || idx < 0 || idx >= SLIDES.length) return
    setDir(idx > current ? 1 : -1)
    setLeaving(true)
    setTimeout(() => { setCurrent(idx); setLeaving(false) }, 200)
  }

  const complete = () => {
    localStorage.setItem('examai_onboarded', '1')
    onComplete()
  }

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchStart.current === null) return
    const dx = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(dx) > 48) dx > 0 ? goTo(current + 1) : goTo(current - 1)
    touchStart.current = null
  }

  const slide = SLIDES[current]

  const VISUALS = [
    <WelcomeVisual />,
    <AIVisual />,
    <MockVisual />,
    <ProgressVisual />,
    <GoVisual installPrompt={installPrompt} appInstalled={appInstalled} onInstallClick={onInstallClick} />,
  ]

  return (
    <div
      style={{ position:'fixed', inset:0, background:'var(--bg)', zIndex:9999, display:'flex', flexDirection:'column', overflow:'hidden' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <style>{`
        @keyframes obIn  { from{opacity:0;transform:translateX(${dir*36}px)} to{opacity:1;transform:translateX(0)} }
        @keyframes obOut { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(${-dir*36}px)} }
        .ob-in  { animation: obIn  .22s cubic-bezier(.4,0,.2,1) both }
        .ob-out { animation: obOut .18s cubic-bezier(.4,0,.2,1) both }
      `}</style>

      {/* Background glow */}
      <div style={{ position:'absolute', inset:0, background:slide.bg, transition:'background .5s', pointerEvents:'none', zIndex:0 }} />

      {/* Top bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', zIndex:2, flexShrink:0 }}>
        <div style={{ fontSize:20, fontWeight:800, letterSpacing:-0.5 }}>
          Exam<span style={{ color:'var(--accent)' }}>Nova</span>
        </div>
        <button onClick={complete} style={{ padding:'5px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, color:'var(--muted)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div
        key={current}
        className={leaving ? 'ob-out' : 'ob-in'}
        style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 28px 8px', textAlign:'center', zIndex:1 }}
      >
        {/* Visual */}
        <div style={{ marginBottom:28, flexShrink:0, width:'100%' }}>
          {VISUALS[current]}
        </div>

        {/* Badge */}
        <div style={{ display:'inline-flex', alignItems:'center', background:`${slide.accent}15`, border:`1px solid ${slide.accent}35`, borderRadius:20, padding:'4px 14px', fontSize:11, fontWeight:800, color:slide.accent, letterSpacing:'0.3px', marginBottom:12 }}>
          {slide.badge}
        </div>

        {/* Headline */}
        <h1 style={{ fontSize:'clamp(24px,6vw,34px)', fontWeight:900, lineHeight:1.2, marginBottom:12, letterSpacing:'-0.5px' }}>
          {slide.id === 'welcome'
            ? <>Crack Your<br /><span style={{ color:slide.accent }}>Government Exam</span></>
            : <>{slide.headline[0]}<br /><span style={{ color:slide.accent }}>{slide.headline[1]}</span></>
          }
        </h1>

        {/* Sub */}
        <p style={{ fontSize:14, color:'var(--muted2)', lineHeight:1.7, maxWidth:340, margin:'0 auto' }}>
          {slide.id === 'welcome'
            ? <>Hi <strong style={{ color:'var(--text)' }}>{firstName}</strong>! {slide.sub}</>
            : slide.sub
          }
        </p>
      </div>

      {/* Bottom controls */}
      <div style={{ padding:'12px 24px 36px', flexShrink:0, zIndex:2 }}>

        {/* Dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:20 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => goTo(i)} style={{ height:4, width:i===current?24:8, borderRadius:2, background:i===current?slide.accent:'var(--border)', transition:'all .3s', cursor:'pointer' }} />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => isLast ? complete() : goTo(current + 1)}
          style={{ width:'100%', padding:'15px', background:`linear-gradient(135deg,${slide.accent}dd,${slide.accent})`, border:'none', borderRadius:14, color:'white', fontSize:16, fontWeight:800, cursor:'pointer', boxShadow:`0 6px 20px ${slide.accent}45`, letterSpacing:'0.2px', transition:'all .2s' }}
        >
          {isLast ? '🚀 Start Practicing' : 'Next →'}
        </button>

        {current > 0 && (
          <button onClick={() => goTo(current - 1)} style={{ display:'block', margin:'10px auto 0', background:'none', border:'none', color:'var(--muted)', fontSize:12, cursor:'pointer' }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  )
}