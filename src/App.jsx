// ─────────────────────────────────────────────
// App.jsx
// Sidebar navigation layout
// ─────────────────────────────────────────────

import { useState, useEffect, useRef, Component } from 'react'
import { onAuthChange, logout }  from './services/authService'
import AdminPanel           from './screens/AdminPanel'
import SettingsScreen       from './screens/SettingsScreen'
import FeedbackWidget       from './components/FeedbackWidget'
import { updateSessionTime, isSessionExpired, clearSession } from './services/authService'
import { markPracticedToday, getBannerConfig, markBannerShown } from './services/notificationService'

import Sidebar              from './components/Sidebar'
import LoginScreen          from './screens/LoginScreen'
import HomeScreen           from './screens/HomeScreen'
import TopicsScreen         from './screens/TopicsScreen'
import TestScreen           from './screens/TestScreen'
import DashboardScreen      from './screens/DashboardScreen'
import MockTestScreen       from './screens/MockTestScreen'
import MockHistoryScreen    from './screens/MockHistoryScreen'
import CurrentAffairsScreen from './screens/CurrentAffairsScreen'
import LeaderboardScreen    from './screens/LeaderboardScreen'
import ShiftPapersScreen    from './screens/ShiftPapersScreen'
import ExamHubScreen        from './screens/ExamHubScreen'
import ProfileScreen        from './screens/ProfileScreen'
import SavedQuestionsScreen from './screens/SavedQuestionsScreen'
import OnboardingScreen     from './screens/OnboardingScreen'
import AboutScreen          from './screens/AboutScreen'
import OfflineScreen        from './screens/OfflineScreen'

// ─────────────────────────────────────────────
// ErrorBoundary — catches screen crashes

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, info) {
    // Log to console in dev — swap for Sentry/LogRocket in production
    console.error('[ErrorBoundary] Screen crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '24px 20px',
          background: 'var(--bg)',
        }}>
          <style>{`
            @keyframes eb-fade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
            @keyframes eb-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            @keyframes eb-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
          `}</style>

          <div style={{
            maxWidth: 460, width: '100%',
            animation: 'eb-fade 0.4s ease both',
          }}>

            {/* ── Card ── */}
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
            }}>

              {/* Red top strip */}
              <div style={{ height: 4, background: 'linear-gradient(90deg, #ef4444, #dc2626)' }} />

              <div style={{ padding: 'clamp(28px,5vw,40px)' }}>

                {/* Icon — SVG warning triangle, no emoji */}
                <div style={{
                  width: 64, height: 64, borderRadius: 18,
                  background: 'rgba(239,68,68,.08)',
                  border: '1.5px solid rgba(239,68,68,.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800,
                  color: 'var(--text)', textAlign: 'center',
                  marginBottom: 10, lineHeight: 1.2,
                }}>
                  Something went wrong
                </h2>
                <p style={{
                  fontSize: 13, color: 'var(--muted)', lineHeight: 1.75,
                  textAlign: 'center', marginBottom: 24, maxWidth: 320, margin: '0 auto 24px',
                }}>
                  This screen ran into an unexpected error.<br/>
                  Your progress and data are completely safe.
                </p>

                {/* Status chips */}
                <div style={{
                  display: 'flex', gap: 8, justifyContent: 'center',
                  flexWrap: 'wrap', marginBottom: 28,
                }}>
                  {[
                    { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, label: 'Data safe',     col: 'var(--green)',  bg: 'rgba(34,197,94,.08)',  border: 'rgba(34,197,94,.2)'  },
                    { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, label: 'Progress saved', col: 'var(--green)',  bg: 'rgba(34,197,94,.08)',  border: 'rgba(34,197,94,.2)'  },
                    { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, label: 'Screen error',  col: '#ef4444',       bg: 'rgba(239,68,68,.08)',   border: 'rgba(239,68,68,.2)'  },
                  ].map((c, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '5px 12px', borderRadius: 20,
                      background: c.bg, border: `1px solid ${c.border}`,
                      fontSize: 11, fontWeight: 700, color: c.col,
                    }}>
                      {c.icon} {c.label}
                    </div>
                  ))}
                </div>

                {/* Dev error box */}
                {import.meta.env.DEV && (
                  <div style={{
                    background: 'rgba(239,68,68,.04)',
                    border: '1px solid rgba(239,68,68,.15)',
                    borderLeft: '3px solid #ef4444',
                    borderRadius: 10, padding: '12px 14px', marginBottom: 24,
                    fontSize: 11, color: '#ef4444', textAlign: 'left',
                    fontFamily: 'monospace', wordBreak: 'break-word', lineHeight: 1.6,
                  }}>
                    <div style={{ fontWeight: 800, marginBottom: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Dev — Error Details
                    </div>
                    {this.state.errorMessage}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                  <button
                    onClick={() => {
                      this.setState({ hasError: false, errorMessage: '' })
                      this.props.onGoHome?.()
                    }}
                    style={{
                      width: '100%', padding: '13px',
                      borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, var(--accent), #ea580c)',
                      color: 'white', fontSize: 14, fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(249,115,22,.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    Go to Home
                  </button>
                  <button
                    onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                    style={{
                      width: '100%', padding: '12px',
                      borderRadius: 12, border: '1.5px solid var(--border)',
                      background: 'var(--surface2)', color: 'var(--text)',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                    Try Again
                  </button>
                </div>

              </div>
            </div>

            {/* Bottom note */}
            <p style={{
              textAlign: 'center', fontSize: 11, color: 'var(--muted)',
              marginTop: 16, lineHeight: 1.6,
            }}>
              If this keeps happening, try refreshing the page.<br/>
              Your account and all data remain unaffected.
            </p>

          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── About Splash — shown once before login ─────────────
function AboutSplash({ onGetStarted }) {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <style>{`
        @keyframes splashFade { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes splashChakra { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes splashPulse { 0%,100%{opacity:.6} 50%{opacity:1} }
      `}</style>

      {/* Background glow orbs */}
      <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,153,51,.1) 0%,transparent 65%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-60, left:-60, width:240, height:240, borderRadius:'50%', background:'radial-gradient(circle,rgba(19,136,8,.07) 0%,transparent 65%)', pointerEvents:'none' }} />

      {/* Tricolor top strip */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:5, display:'flex' }}>
        <div style={{ flex:1, background:'#FF9933' }} />
        <div style={{ flex:1, background:'white', opacity:.5 }} />
        <div style={{ flex:1, background:'#138808' }} />
      </div>

      {/* Main content */}
      <div style={{ maxWidth:400, width:'100%', textAlign:'center', animation:'splashFade .6s ease both' }}>

        {/* Spinning Chakra */}
        <div style={{ marginBottom:20 }}>
          <svg viewBox="0 0 120 120" width={90} height={90}
            style={{ animation:'splashChakra 16s linear infinite', transformOrigin:'center' }}>
            <circle cx="60" cy="60" r="56" fill="none" stroke="#FF9933" strokeWidth="3"/>
            <circle cx="60" cy="60" r="16" fill="none" stroke="#FF9933" strokeWidth="2"/>
            {Array.from({length:24}).map((_,i)=>{
              const a=((i*15-90)*Math.PI)/180
              return <line key={i} x1={60+18*Math.cos(a)} y1={60+18*Math.sin(a)} x2={60+53*Math.cos(a)} y2={60+53*Math.sin(a)} stroke="#FF9933" strokeWidth="1.5"/>
            })}
            <circle cx="60" cy="60" r="5" fill="#FF9933"/>
          </svg>
        </div>

        {/* Govt of India label */}
        <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,153,51,.8)', letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:8 }}>
          भारत सरकार &nbsp;|&nbsp; Government of India
        </div>

        {/* App name */}
        <h1 style={{ fontSize:48, fontWeight:900, letterSpacing:'-1.5px', marginBottom:6, lineHeight:1 }}>
          Exam<span style={{ color:'#FF9933' }}>Nova</span>
        </h1>
        <div style={{ fontSize:14, color:'rgba(255,153,51,.75)', fontWeight:600, letterSpacing:'0.5px', marginBottom:20 }}>
          परीक्षा की तैयारी · Exam Preparation
        </div>

        <p style={{ fontSize:14, color:'var(--muted2)', lineHeight:1.8, marginBottom:28, maxWidth:320, margin:'0 auto 28px' }}>
          AI-powered free exam preparation for <strong style={{ color:'var(--text)' }}>SSC, Railway, Banking & UPSC</strong> — trusted by 10,000+ Indian students
        </p>

        {/* Feature pills */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', marginBottom:32 }}>
          {['🤖 AI Questions','📝 Mock Tests','📰 Current Affairs','🆓 100% Free','🇮🇳 Hindi + English'].map(f => (
            <div key={f} style={{ fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:20, background:'var(--surface)', border:'1px solid var(--border)', color:'var(--muted2)' }}>{f}</div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={onGetStarted}
          style={{ width:'100%', padding:'15px', borderRadius:14, background:'linear-gradient(135deg,#FF9933,#f97316)', border:'none', color:'white', fontSize:16, fontWeight:800, cursor:'pointer', boxShadow:'0 6px 24px rgba(255,153,51,.4)', letterSpacing:'0.2px', marginBottom:16 }}>
          🚀 Get Started — Free
        </button>

        <div style={{ fontSize:11, color:'var(--muted)', lineHeight:1.7 }}>
          सत्यमेव जयते — Truth Alone Triumphs<br/>
          <span style={{ opacity:.6, fontSize:10 }}>Not affiliated with any government body</span>
        </div>
      </div>

      {/* Tricolor bottom strip */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:4, display:'flex' }}>
        <div style={{ flex:1, background:'#FF9933' }} />
        <div style={{ flex:1, background:'white', opacity:.5 }} />
        <div style={{ flex:1, background:'#138808' }} />
      </div>
    </div>
  )
}

export default function App() {
  const [user,             setUser]             = useState(undefined)
  const [isAdmin,          setIsAdmin]          = useState(false)
  const [screen,           setScreen]           = useState('home')
  const [topic,            setTopic]            = useState(null)
  const [level,            setLevel]            = useState('same')
  const [selectedExam,     setSelectedExam]     = useState(localStorage.getItem('examai_selected_exam') || null)
  const [isMobile,         setIsMobile]         = useState(window.innerWidth < 768)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme,            setTheme]            = useState(localStorage.getItem('examai_theme') || 'dark-orange')
  const [language,         setLanguage]         = useState(localStorage.getItem('examai_language') || 'english')
  const [showOnboarding,   setShowOnboarding]   = useState(false)
  const [isOnline,         setIsOnline]         = useState(navigator.onLine)
  // tracks which sidebar item was last explicitly clicked
  const [activeNav,        setActiveNav]        = useState('home')

  // ── In-app reminder banner ──
  const [banner,       setBanner]       = useState(null)
  const bannerTimer                     = useRef(null)

  // ── PWA install prompt ──
  const [installPrompt, setInstallPrompt] = useState(null)
  const [appInstalled,  setAppInstalled]  = useState(false)

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    localStorage.setItem('examai_language', lang)
  }

  // ── Auth listener ──
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser && isSessionExpired()) {
        clearSession()
        await logout()
        setUser(null)
      } else {
        if (firebaseUser) updateSessionTime()
        setUser(firebaseUser)
      }
      window.__hideSplash?.()
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) updateSessionTime()
  }, [screen])

  useEffect(() => {
    if (user) {
      import('./services/storageService').then(({ updateLastVisit }) => {
        updateLastVisit()
      })
    }
  }, [user])

  // ── Onboarding gate — single useEffect, no duplicate ──
  useEffect(() => {
    if (!user) return
    const onboarded = localStorage.getItem('examai_onboarded')
    if (!onboarded) setShowOnboarding(true)
  }, [user])

  // ── In-app reminder banner ──
  useEffect(() => {
    if (!user || showOnboarding) return
    if (screen !== 'home') return
    const t = setTimeout(async () => {
      let streak = 0
      try {
        const { getStreak } = await import('./services/storageService')
        streak = await getStreak()
      } catch (_) {}
      const config = getBannerConfig(streak)
      if (config.show) {
        setBanner(config)
        markBannerShown()
        if (bannerTimer.current) clearTimeout(bannerTimer.current)
        bannerTimer.current = setTimeout(() => setBanner(null), 10000)
      }
    }, 2200)
    return () => clearTimeout(t)
  }, [screen, user, showOnboarding])

// for session update on any click — keeps user logged in while actively using the app, but expires after 30 mins of inactivity 
useEffect(() => {
  const handler = () => updateSessionTime()
  window.addEventListener('click', handler)
  return () => window.removeEventListener('click', handler)
}, [])


  // ── Mark practiced when test/mock starts ──
  useEffect(() => {
    if (screen === 'test' || screen === 'mock') {
      markPracticedToday()
      setBanner(null)
    }
  }, [screen])

  // ── PWA install prompt ──
  useEffect(() => {
    const handler          = (e) => { e.preventDefault(); setInstallPrompt(e) }
    const installedHandler = ()  => setAppInstalled(true)
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    if (window.matchMedia('(display-mode: standalone)').matches) setAppInstalled(true)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setAppInstalled(true)
    setInstallPrompt(null)
  }

  // ── Theme ──
  useEffect(() => {
    if (theme === 'dark-orange') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
    localStorage.setItem('examai_theme', theme)
  }, [theme])

  // ── Resize ──
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Offline detection ──
  useEffect(() => {
    const goOnline  = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // ── Navigate ──
  const navigate = (screenName) => {
    // track which nav item was clicked for sidebar active state
    setActiveNav(screenName)
    const target = screenName === 'exams' ? 'home' : screenName
    setScreen(target)
    window.scrollTo(0, 0)
    document.getElementById('main-content')?.scrollTo(0, 0)
    if (screenName === 'exams') {
      setTimeout(() => {
        document.getElementById('category-browser')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    setScreen('about')
  }

  const handleAdminLogin = (userData) => {
    setUser(userData)
    setIsAdmin(true)
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setIsAdmin(false)
    setScreen('home')
    setTopic(null)
    setSelectedExam(null)
    setShowOnboarding(false)
    setBanner(null)
  }

  const handleSelectExam = (exam, shouldNavigate = true) => {
    setSelectedExam(exam)
    localStorage.setItem('examai_selected_exam', exam)
    const savedLang = localStorage.getItem(`examai_lang_${exam?.replace(/\s/g, '_')}`)
    if (savedLang) setLanguage(savedLang)
    if (shouldNavigate) {
      setActiveNav('home') // came from home screen, not exams sidebar
      setScreen('topics')
      window.scrollTo(0, 0)
    }
  }

  const handleStartMock = (examName) => {
    setSelectedExam(examName)
    const savedLang = localStorage.getItem(`examai_lang_${examName?.replace(/\s/g, '_')}`)
    if (savedLang) setLanguage(savedLang)
    setScreen('mock')
  }

  const startTest = (topicData, levelData) => {
    setTopic(topicData)
    setLevel(levelData)
    setScreen('test')
    window.scrollTo(0, 0)
  }

  // ── Auth loading — keep HTML splash visible, return nothing ──
  if (user === undefined) return null

  // ── Not logged in ──
  if (!user) {
    return <LoginScreen onLogin={handleLogin} onAdminLogin={handleAdminLogin} />
  }

  // ── Offline ──
  if (!isOnline) {
    return <OfflineScreen />
  }


  // ── Onboarding — first-time users only ──
  if (showOnboarding) {
    return (
      <OnboardingScreen
        user={user}
        onComplete={() => {
          localStorage.setItem('examai_onboarded', '1')
          setShowOnboarding(false)
        }}
        installPrompt={installPrompt}
        appInstalled={appInstalled}
        onInstallClick={handleInstallClick}
      />
    )
  }

  const sharedProps  = { user, navigate, onLogout: handleLogout, language, onLanguageChange: handleLanguageChange }
  const sidebarProps = { user, currentScreen: screen, activeNav, navigate, onLogout: handleLogout, language, onLanguageChange: handleLanguageChange, selectedExam }
  const hideSidebar  = screen === 'test' || screen === 'mock'

  if (isAdmin) {
    return <AdminPanel user={user} onLogout={handleLogout} />
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>

      {/* ── In-app reminder banner ── */}
      {banner && !hideSidebar && (
        <div style={{ position:'fixed', bottom:isMobile?16:24, left:isMobile?16:(sidebarCollapsed?80:256), right:16, zIndex:500, animation:'bannerIn .3s cubic-bezier(.4,0,.2,1) both' }}>
          <style>{`@keyframes bannerIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{ background:'var(--surface)', border:`1px solid ${banner.accent}40`, borderLeft:`3px solid ${banner.accent}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:`0 8px 32px rgba(0,0,0,.3)`, maxWidth:480 }}>
            <div style={{ fontSize:24, flexShrink:0 }}>{banner.icon}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{banner.message}</div>
              <div style={{ fontSize:11, color:'var(--muted2)', lineHeight:1.4 }}>{banner.sub}</div>
            </div>
            <button onClick={() => { setBanner(null); navigate('topics') }} style={{ padding:'7px 14px', borderRadius:8, flexShrink:0, background:banner.accent, border:'none', color:'white', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
              {banner.cta}
            </button>
            <button onClick={() => setBanner(null)} style={{ width:24, height:24, borderRadius:'50%', border:'none', background:'var(--border)', color:'var(--muted)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
          </div>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      {!hideSidebar && (
        <Sidebar
          {...sidebarProps}
          isCollapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          theme={theme}
          onThemeChange={setTheme}
          installPrompt={installPrompt}
          appInstalled={appInstalled}
          onInstallClick={handleInstallClick}
        />
      )}

      {/* ── MAIN CONTENT ── */}
      <div
        id="main-content"
        style={{
          flex: 1,
          marginLeft: hideSidebar ? 0 : isMobile ? 0 : sidebarCollapsed ? '60px' : '240px',
          marginTop: isMobile && !hideSidebar ? '56px' : 0,
          minHeight: '100vh',
          transition: 'margin 0.25s ease',
          overflowX: 'hidden',
          width: isMobile ? '100vw' : `calc(100vw - 240px)`,
          maxWidth: '100%',
        }}
      >
        <ErrorBoundary onGoHome={() => navigate('home')}>
          {screen === 'home'        && <HomeScreen        {...sharedProps} onSelectExam={handleSelectExam} onStartMock={handleStartMock} selectedExam={selectedExam} />}
          {screen === 'examhub'     && <ExamHubScreen     {...sharedProps} selectedExam={selectedExam} onSelectExam={handleSelectExam} onStartMock={handleStartMock} />}
          {screen === 'topics'      && <TopicsScreen      {...sharedProps} startTest={startTest} selectedExam={selectedExam} onSelectExam={handleSelectExam} />}
          {screen === 'test'        && <TestScreen        {...sharedProps} topic={topic} level={level} selectedExam={selectedExam} />}
          {screen === 'mock'        && <MockTestScreen    {...sharedProps} selectedExam={selectedExam} />}
          {screen === 'dashboard'   && <DashboardScreen   {...sharedProps} />}
          {screen === 'mockhistory' && <MockHistoryScreen {...sharedProps} />}
          {screen === 'settings'    && <SettingsScreen    {...sharedProps} theme={theme} onThemeChange={setTheme} language={language} onLanguageChange={setLanguage} />}
          {screen === 'current'     && <CurrentAffairsScreen {...sharedProps} selectedExam={selectedExam} onSelectExam={handleSelectExam} />}
          {screen === 'leaderboard' && <LeaderboardScreen {...sharedProps} />}
          {screen === 'shifts'      && <ShiftPapersScreen {...sharedProps} selectedExam={selectedExam} onSelectExam={handleSelectExam} />}
          {screen === 'profile'     && <ProfileScreen     {...sharedProps} />}
          {screen === 'saved'       && <SavedQuestionsScreen {...sharedProps} />}
          {screen === 'about'       && <AboutScreen user={user} navigate={navigate} />}
        </ErrorBoundary>

        {user && !isAdmin && ['home','current','shifts','leaderboard','settings','dashboard'].includes(screen) && (
          <FeedbackWidget user={user} />
        )}
      </div>
    </div>
  )
}