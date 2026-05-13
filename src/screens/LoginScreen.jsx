// ─────────────────────────────────────────────
// LoginScreen.jsx — Email + Password Auth
// Students: Login / Signup with email + password
// Admin:    email + password (separate tab)
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { login, signup, resetPassword }       from '../services/authService'
import Logo from '../components/Logo'

// const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

const FEATURES = [
  { icon: '🎯', text: 'AI Question Prediction' },
  { icon: '📊', text: 'Progress Tracking'      },
  { icon: '📰', text: 'Current Affairs'         },
  { icon: '🏆', text: 'Mock Tests'              },
  { icon: '🌐', text: 'Hindi & English'         },
  { icon: '⚡', text: 'Instant Results'          },
]

const EXAM_TAGS = ['SSC CGL', 'SSC CHSL', 'RRB NTPC', 'IBPS PO', 'UPSC', 'SBI PO']

export default function LoginScreen({ onLogin, onAdminLogin }) {

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [mode,     setMode]     = useState('student')   // 'student' | 'admin'
  const [isSignup, setIsSignup] = useState(false)       // login vs signup toggle
  const [isForgot, setIsForgot] = useState(false)       // forgot password mode

  // ── Student state ──
  const [name,         setName]         = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmPass,  setConfirmPass]  = useState('')
  const [selectedExam, setSelectedExam] = useState('SSC CGL')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [forgotEmail,  setForgotEmail]  = useState('')

  // ── Admin state ──
  const [adminEmail,    setAdminEmail]    = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPass, setShowAdminPass] = useState(false)

  // ── Shared ──
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  // ── Student Login ──
  const handleLogin = async () => {
    setError('')
    if (!email.trim())    return setError('Please enter your email address')
    if (!password.trim()) return setError('Please enter your password')
    setLoading(true)
    const result = await login({ email: email.trim(), password })
    setLoading(false)
    if (!result.success) return setError(result.error)
    onLogin(result.user)
  }

  // ── Student Signup ──
  const handleSignup = async () => {
    setError('')
    if (!name.trim())               return setError('Please enter your full name')
    if (!email.trim())              return setError('Please enter your email address')
    if (password.length < 6)        return setError('Password must be at least 6 characters')
    if (password !== confirmPass)   return setError('Passwords do not match')
    setLoading(true)
    const result = await signup({ name: name.trim(), email: email.trim(), password, exam: selectedExam })
    setLoading(false)
    if (!result.success) return setError(result.error)
    onLogin(result.user)
  }

  


  const handleAdminLogin = async () => {
  setError('')
  if (!adminEmail.trim())    return setError('Please enter admin email')
  if (!adminPassword.trim()) return setError('Please enter admin password')

  // ← DELETE the ADMIN_EMAIL check — let Firebase verify instead
  setLoading(true)
  const result = await login({ email: adminEmail.trim(), password: adminPassword })
  setLoading(false)
  if (!result.success) return setError(result.error)
  onAdminLogin(result.user)
}

  // ── Forgot Password ──
  const handleForgotPassword = async () => {
    setError('')
    if (!forgotEmail.trim()) return setError('Please enter your email address')
    setLoading(true)
    const result = await resetPassword(forgotEmail)
    setLoading(false)
    if (!result.success) return setError(result.error)
    setError('') // Clear any error
    // Show success message
    alert('✅ ' + result.message)
    setIsForgot(false)
    setForgotEmail('')
  }

  // ── Reset form on mode/tab switch ──
  const switchMode = (newMode) => {
    setMode(newMode)
    setError('')
    setEmail(''); setPassword(''); setName(''); setConfirmPass('')
    setAdminEmail(''); setAdminPassword('')
  }

  const switchTab = (signup) => {
    setIsSignup(signup)
    setIsForgot(false)
    setError('')
    setEmail(''); setPassword(''); setName(''); setConfirmPass(''); setForgotEmail('')
  }

  // ── Shared styles ──
  const s = {
    label:     { fontSize: '12px', fontWeight: '600', color: 'var(--muted2)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
    inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '12px', fontSize: '16px', pointerEvents: 'none' },
    input:     { width: '100%', padding: '11px 14px 11px 38px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
    eyeBtn:    { position: 'absolute', right: '12px', fontSize: '16px', cursor: 'pointer', userSelect: 'none' },
    error:     { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#f87171', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' },
    btn:       { width: '100%', padding: isMobile ? '12px' : '14px', background: 'linear-gradient(135deg, var(--accent), #f97316)', border: 'none', borderRadius: '10px', color: 'white', fontSize: isMobile ? '14px' : '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '16px', boxShadow: '0 4px 12px rgba(249,115,22,0.3)' },
    ghost:     { background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', width: '100%', padding: '8px' },
    link:      { color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' },
    mb14:      { marginBottom: '14px' },
    mb20:      { marginBottom: '20px' },
  }

  // ── Spinner helper ──
  const Spinner = ({ label }) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'white' }} />
      {label}
    </span>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>

      {/* ── LEFT — Branding (desktop only) ── */}
      {!isMobile && (
        <div style={{ width: '480px', flexShrink: 0, background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)', borderRight: '1px solid var(--border)', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>

          {/* Background decorations */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div>
            {/* Logo */}
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'6px' }}>
                <Logo size={40} />
                <div style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px' }}>
                  Exam<span style={{ color: 'var(--accent)' }}>Nova</span>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', letterSpacing: '0.5px' }}>SMART EXAM PREPARATION</div>
            </div>

            <h1 style={{ fontSize: '42px', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-1px', marginBottom: '20px' }}>
              Crack Your<br />Dream Exam<br />
              <span style={{ background: 'linear-gradient(90deg, var(--accent), #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>with AI</span>
            </h1>

            <p style={{ fontSize: '15px', color: 'var(--muted2)', lineHeight: '1.7', marginBottom: '32px', maxWidth: '340px' }}>
              AI-powered question prediction, mock tests and current affairs for all major government exams.
            </p>

            {/* Features grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
              {FEATURES.map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{f.icon}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted2)', fontWeight: '500' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom exam tags */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Supported Exams</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EXAM_TAGS.map(e => (
                <span key={e} style={{ padding: '5px 12px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '20px', fontSize: '12px', color: 'var(--accent)', fontWeight: '500' }}>{e}</span>
              ))}
              <span style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', fontSize: '12px', color: 'var(--muted)' }}>+14 more</span>
            </div>
            <div style={{ marginTop: '24px', padding: '14px 18px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '10px', fontSize: '13px', color: 'var(--muted2)', fontStyle: 'italic' }}>
              "Practiced by thousands of aspirants across India" 🇮🇳
            </div>
          </div>
        </div>
      )}

      {/* ── RIGHT — Auth Form ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '20px 16px' : '48px 40px', background: 'var(--bg)', overflowY: 'auto' }}>

        {/* Mobile logo */}
        {isMobile && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:'6px' }}>
              <Logo size={36} />
              <div style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-1px' }}>
                Exam<span style={{ color: 'var(--accent)' }}>Nova</span>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Smart Exam Preparation</div>
          </div>
        )}

        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* ── MODE SELECTOR: Student / Admin ── */}
          <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '4px', marginBottom: '24px' }}>
            {[
              { id: 'student', label: '🎓 Student', sub: 'Practice & Tests' },
              { id: 'admin',   label: '🛠️ Admin',   sub: 'Manage Content'  },
            ].map(m => (
              <button key={m.id}
                style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: mode === m.id ? 'linear-gradient(135deg, var(--accent), #f97316)' : 'transparent', color: mode === m.id ? 'white' : 'var(--muted)' }}
                onClick={() => switchMode(m.id)}>
                <div style={{ fontSize: '13px', fontWeight: '700' }}>{m.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '1px' }}>{m.sub}</div>
              </button>
            ))}
          </div>

          {/* ── CARD ── */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: isMobile ? '20px 16px' : '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>

            {/* ════════════════════════════
                STUDENT MODE
            ════════════════════════════ */}
            {mode === 'student' && (
              <>
                {/* Login / Signup tab toggle */}
                <div style={{ display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '3px', marginBottom: '24px' }}>
                  {[
                    { val: false, label: 'Login'    },
                    { val: true,  label: 'Sign Up'  },
                  ].map(t => (
                    <button key={String(t.val)}
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.15s', background: isSignup === t.val ? 'var(--surface)' : 'transparent', color: isSignup === t.val ? 'var(--accent)' : 'var(--muted)', boxShadow: isSignup === t.val ? '0 1px 4px rgba(0,0,0,0.15)' : 'none' }}
                      onClick={() => switchTab(t.val)}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Header */}
                <div style={{ marginBottom: '22px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: 'var(--text)' }}>
                    {isForgot ? '🔑 Reset Password' : (isSignup ? 'Create Account 🚀' : 'Welcome Back 👋')}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                    {isForgot
                      ? 'Enter your registered email to receive a password reset link'
                      : isSignup
                      ? 'Sign up and start your exam preparation today'
                      : 'Login to continue your preparation'}
                  </p>
                </div>

                {/* ── FORGOT PASSWORD FORM ── */}
                {isForgot ? (
                  <>
                    <div style={s.mb14}>
                      <label style={s.label}>Registered Email</label>
                      <div style={s.inputWrap}>
                        <span style={s.inputIcon}>📧</span>
                        <input style={s.input} type="email" placeholder="Enter your registered email"
                          value={forgotEmail}
                          onChange={e => { setForgotEmail(e.target.value); setError('') }}
                          onKeyDown={e => e.key === 'Enter' && handleForgotPassword()}
                          autoFocus />
                      </div>
                    </div>

                    {error && <div style={s.error}>⚠️ {error}</div>}

                    <button style={s.btn}
                      onClick={handleForgotPassword}
                      disabled={loading}>
                      {loading
                        ? <Spinner label="Sending reset link..." />
                        : 'Send Reset Link →'
                      }
                    </button>

                    {/* Back to login link */}
                    <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
                      <span style={s.link} onClick={() => { setIsForgot(false); setForgotEmail(''); setError('') }}>← Back to Login</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* ── LOGIN/SIGNUP FORM ── */}

                    {/* ── SIGNUP ONLY fields ── */}
                    {isSignup && (
                      <div style={s.mb14}>
                        <label style={s.label}>Full Name</label>
                        <div style={s.inputWrap}>
                          <span style={s.inputIcon}>👤</span>
                          <input style={s.input} type="text" placeholder="e.g. Shashikant"
                            value={name} maxLength={30} autoFocus={isSignup}
                            onChange={e => { setName(e.target.value); setError('') }}
                            onKeyDown={e => e.key === 'Enter' && handleSignup()} />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div style={s.mb14}>
                      <label style={s.label}>Email Address</label>
                      <div style={s.inputWrap}>
                        <span style={s.inputIcon}>📧</span>
                        <input style={s.input} type="email" placeholder="your@email.com"
                          value={email} autoFocus={!isSignup}
                          onChange={e => { setEmail(e.target.value); setError('') }}
                          onKeyDown={e => e.key === 'Enter' && (isSignup ? handleSignup() : handleLogin())} />
                      </div>
                    </div>

                    {/* Password */}
                    <div style={s.mb14}>
                      <label style={s.label}>Password</label>
                      <div style={s.inputWrap}>
                        <span style={s.inputIcon}>🔒</span>
                        <input style={s.input}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={isSignup ? 'Min 6 characters' : 'Your password'}
                          value={password}
                          onChange={e => { setPassword(e.target.value); setError('') }}
                          onKeyDown={e => e.key === 'Enter' && (isSignup ? handleSignup() : handleLogin())} />
                        <span style={s.eyeBtn} onClick={() => setShowPassword(p => !p)}>
                          {showPassword ? '🙈' : '👁️'}
                        </span>
                      </div>
                    </div>

                    {/* ── SIGNUP ONLY: Confirm password + Exam ── */}
                    {isSignup && (
                      <>
                        <div style={s.mb14}>
                          <label style={s.label}>Confirm Password</label>
                          <div style={s.inputWrap}>
                            <span style={s.inputIcon}>🔒</span>
                            <input style={s.input}
                              type={showConfirm ? 'text' : 'password'}
                              placeholder="Re-enter password"
                              value={confirmPass}
                              onChange={e => { setConfirmPass(e.target.value); setError('') }}
                              onKeyDown={e => e.key === 'Enter' && handleSignup()} />
                            <span style={s.eyeBtn} onClick={() => setShowConfirm(p => !p)}>
                              {showConfirm ? '🙈' : '👁️'}
                            </span>
                          </div>
                        </div>

                        
                      </>
                    )}

                    {error && <div style={s.error}>⚠️ {error}</div>}

                    <button style={s.btn}
                      onClick={isSignup ? handleSignup : handleLogin}
                      disabled={loading}>
                      {loading
                        ? <Spinner label={isSignup ? 'Creating account...' : 'Logging in...'} />
                        : isSignup ? 'Create Account 🚀' : 'Login →'
                      }
                    </button>

                    {/* Switch tab link */}
                    <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted)', marginBottom: '12px' }}>
                      {isSignup ? (
                        <>Already have an account?{' '}
                          <span style={s.link} onClick={() => switchTab(false)}>Login here</span>
                        </>
                      ) : (
                        <>
                          New to ExamNova?{' '}
                          <span style={s.link} onClick={() => switchTab(true)}>Create account</span>
                        </>
                      )}
                    </div>

                    {/* Forgot Password Link - only on login tab */}
                    {!isSignup && (
                      <div style={{ textAlign: 'center', fontSize: '13px' }}>
                        <span style={s.link} onClick={() => setIsForgot(true)}>🔑 Forgot Password?</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ════════════════════════════
                ADMIN MODE
            ════════════════════════════ */}
            {mode === 'admin' && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px', color: 'var(--text)' }}>Admin Access 🛠️</h2>
                  <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Restricted to authorized personnel only</p>
                </div>

                <div style={s.mb14}>
                  <label style={s.label}>Admin Email</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}>📧</span>
                    <input style={s.input} type="email" placeholder="Admin email address"
                      value={adminEmail} autoFocus
                      onChange={e => { setAdminEmail(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
                  </div>
                </div>

                <div style={s.mb20}>
                  <label style={s.label}>Password</label>
                  <div style={s.inputWrap}>
                    <span style={s.inputIcon}>🔒</span>
                    <input style={s.input}
                      type={showAdminPass ? 'text' : 'password'}
                      placeholder="Admin password"
                      value={adminPassword}
                      onChange={e => { setAdminPassword(e.target.value); setError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
                    <span style={s.eyeBtn} onClick={() => setShowAdminPass(p => !p)}>
                      {showAdminPass ? '🙈' : '👁️'}
                    </span>
                  </div>
                </div>

                {error && <div style={s.error}>⚠️ {error}</div>}

                <button style={s.btn} onClick={handleAdminLogin} disabled={loading}>
                  {loading ? <Spinner label="Verifying..." /> : 'Login as Admin →'}
                </button>

                <div style={{ padding: '12px 16px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: '10px', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
                  🔒 Unauthorized access is strictly prohibited
                </div>
              </>
            )}

            {/* Footer */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              🔐 Your data is encrypted and stored securely
            </div>
          </div>

          {/* Mobile exam tags */}
          {isMobile && (
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Supported Exams</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {EXAM_TAGS.map(e => (
                  <span key={e} style={{ padding: '4px 10px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '20px', fontSize: '11px', color: 'var(--accent)' }}>{e}</span>
                ))}
                <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', fontSize: '11px', color: 'var(--muted)' }}>+14 more</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}