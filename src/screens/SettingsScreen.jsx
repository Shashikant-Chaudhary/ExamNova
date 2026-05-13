import { useState } from 'react'
import {
  isSupported, isEnabled, setEnabled,
  requestPermission, getPermission,
  getReminderTime, setReminderTime,
  scheduleNextReminder, cancelNotifications,
} from '../services/notificationService'

const THEMES = [
  { id: 'dark-orange',  label: 'Dark Orange',  mode: 'dark',  color: '#f97316' },
  { id: 'dark-blue',    label: 'Dark Blue',    mode: 'dark',  color: '#3b82f6' },
  { id: 'dark-green',   label: 'Dark Green',   mode: 'dark',  color: '#22c55e' },
  { id: 'dark-purple',  label: 'Dark Purple',  mode: 'dark',  color: '#a855f7' },
  { id: 'light-orange', label: 'Light Orange', mode: 'light', color: '#f97316' },
  { id: 'light-blue',   label: 'Light Blue',   mode: 'light', color: '#3b82f6' },
  { id: 'light-green',  label: 'Light Green',  mode: 'light', color: '#22c55e' },
  { id: 'light-purple', label: 'Light Purple', mode: 'light', color: '#a855f7' },
]

const FONT_SIZES = [
  { id: 'small',  label: 'Small',  px: '13px' },
  { id: 'medium', label: 'Medium', px: '15px' },
  { id: 'large',  label: 'Large',  px: '17px' },
]

export default function SettingsScreen({ user, theme, onThemeChange, language, onLanguageChange }) {

  const [fontSize,         setFontSize]         = useState(localStorage.getItem('examai_fontsize') || 'medium')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearDone,        setClearDone]        = useState(false)

  const [notifEnabled,     setNotifEnabledState] = useState(isEnabled())
  const [notifPerm,        setNotifPerm]         = useState(getPermission())
  const [reminderTime,     setReminderTimeState] = useState(getReminderTime())
  const [permAsking,       setPermAsking]        = useState(false)
  const [testSent,         setTestSent]          = useState(false)

  const notifSupported = isSupported()
  const isDark         = theme?.startsWith('dark')
  const currentTheme   = THEMES.find(t => t.id === theme)

  const handleFontSize = (id) => {
    setFontSize(id)
    localStorage.setItem('examai_fontsize', id)
    const map = { small:'13px', medium:'15px', large:'17px' }
    document.documentElement.style.setProperty('--font-base', map[id])
  }

  const handleClearProgress = () => {
    localStorage.removeItem('examai_selected_exam')
    localStorage.removeItem('examai_language')
    localStorage.removeItem('examai_theme')
    localStorage.removeItem('examai_fontsize')
    setClearDone(true)
    setShowClearConfirm(false)
    setTimeout(() => setClearDone(false), 3000)
  }

  const handleRequestPermission = async () => {
    setPermAsking(true)
    const result = await requestPermission()
    setNotifPerm(result)
    setPermAsking(false)
    if (result === 'granted') { setEnabled(true); setNotifEnabledState(true); scheduleNextReminder() }
  }

  const handleToggleNotif = (val) => {
    if (val && notifPerm !== 'granted') { handleRequestPermission(); return }
    setEnabled(val)
    setNotifEnabledState(val)
    if (val) scheduleNextReminder()
    else     cancelNotifications()
  }

  const handleTimeChange = (time) => {
    setReminderTimeState(time)
    setReminderTime(time)
    if (notifEnabled) scheduleNextReminder()
  }

  const handleSendTest = () => {
    if (!notifSupported || notifPerm !== 'granted') return
    localStorage.removeItem('examai_notif_last_shown')
    import('../services/notificationService').then(({ showNotification }) => {
      showNotification('ExamNova — Test Notification 🧪', 'This is how your daily reminder will look! Keep practicing 🔥')
    })
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  const Toggle = ({ checked, onChange, disabled }) => (
    <div onClick={() => !disabled && onChange(!checked)}
      style={{ width:44, height:24, borderRadius:12, cursor:disabled?'not-allowed':'pointer', background:checked?'var(--accent)':'var(--border)', position:'relative', transition:'background .2s', opacity:disabled?.5:1, flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, left:checked?23:3, width:18, height:18, borderRadius:'50%', background:'white', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.3)' }} />
    </div>
  )

  const Section = ({ title, children }) => (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, marginBottom:14, overflow:'hidden' }}>
      <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'1px', padding:'10px 16px', borderBottom:'1px solid var(--border)', background:'var(--surface2)' }}>
        {title}
      </div>
      {children}
    </div>
  )

  const Row = ({ icon, title, sub, last, children }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom: last ? 'none' : '1px solid var(--border)', gap:12, flexWrap:'wrap' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ fontSize:16, width:26, textAlign:'center', flexShrink:0 }}>{icon}</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{title}</div>
          {sub && <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>{sub}</div>}
        </div>
      </div>
      <div style={{ flexShrink:0 }}>{children}</div>
    </div>
  )

  const ToggleGroup = ({ options, value, onChange }) => (
    <div style={{ display:'flex', background:'var(--surface2)', borderRadius:8, padding:3, gap:2 }}>
      {options.map(o => (
        <button key={o.id}
          onClick={() => onChange(o.id)}
          style={{ padding:'5px 12px', borderRadius:6, border:'none', background:value===o.id?'var(--surface)':'transparent', color:value===o.id?'var(--accent)':'var(--muted)', cursor:'pointer', fontSize:12, fontWeight:value===o.id?700:500, transition:'all .15s', whiteSpace:'nowrap', boxShadow:value===o.id?'0 1px 3px rgba(0,0,0,.2)':'none' }}>
          {o.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className="page" style={{ maxWidth:600 }}>
      <style>{`
        @keyframes stFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .st-color-dot { transition:all .15s ease; }
        .st-color-dot:hover { transform:scale(1.15); }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, animation:'stFadeUp .3s ease both' }}>
        <div style={{ width:42, height:42, borderRadius:12, background:'linear-gradient(135deg,var(--accent),#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 4px 14px rgba(249,115,22,.35)' }}>⚙️</div>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, marginBottom:2 }}>Settings</h1>
          <p style={{ fontSize:12, color:'var(--muted)' }}>Customize your ExamNova experience</p>
        </div>
      </div>

      {/* ── APPEARANCE ── */}
      <Section title="🎨 Appearance">
        {/* Color accent — single row, works for both dark & light */}
        <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ fontSize:16, width:26, textAlign:'center' }}>🎨</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>Color Theme</div>
              <div style={{ fontSize:11, color:'var(--muted)', marginTop:1 }}>
                {currentTheme?.label} · {isDark ? '🌙 Dark' : '☀️ Light'} — toggle dark/light in sidebar
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:14, paddingLeft:36 }}>
            {[
              { accent:'orange', color:'#f97316', label:'Orange' },
              { accent:'blue',   color:'#3b82f6', label:'Blue'   },
              { accent:'green',  color:'#22c55e', label:'Green'  },
              { accent:'purple', color:'#a855f7', label:'Purple' },
            ].map(t => {
              const isActive = theme?.split('-')[1] === t.accent
              return (
                <div key={t.accent} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer' }}
                  onClick={() => onThemeChange(`${isDark?'dark':'light'}-${t.accent}`)}>
                  <div className="st-color-dot" style={{ position:'relative', width:40, height:40 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:t.color, border:`3px solid ${isActive?t.color:'transparent'}`, outline:isActive?`3px solid ${t.color}40`:'none', outlineOffset:2, boxShadow:isActive?`0 0 14px ${t.color}70`:'0 2px 8px rgba(0,0,0,.15)', transition:'all .15s' }} />
                    {isActive && (
                      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', fontSize:16, color:'white', fontWeight:900 }}>✓</div>
                    )}
                  </div>
                  <span style={{ fontSize:10, fontWeight:isActive?700:400, color:isActive?t.color:'var(--muted)', transition:'all .15s' }}>{t.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Font size */}
        <Row icon="Aa" title="Font Size" sub="Adjust text size for comfort" last>
          <ToggleGroup
            options={FONT_SIZES.map(f => ({ id:f.id, label:f.label }))}
            value={fontSize}
            onChange={handleFontSize}
          />
        </Row>
      </Section>

      {/* ── LANGUAGE ── */}
      <Section title="🌐 Language">
        <Row icon="📝" title="Question Language" sub="Language for AI practice questions" last>
          <ToggleGroup
            options={[{ id:'english', label:'🇬🇧 English' }, { id:'hindi', label:'🇮🇳 हिंदी' }]}
            value={language}
            onChange={onLanguageChange}
          />
        </Row>
      </Section>

      {/* ── NOTIFICATIONS ── */}
      <Section title="🔔 Notifications">
        {!notifSupported ? (
          <div style={{ padding:'14px 16px', fontSize:13, color:'var(--muted)', display:'flex', alignItems:'center', gap:8 }}>
            <span>⚠️</span> Browser notifications not supported.
          </div>
        ) : notifPerm === 'denied' ? (
          <div style={{ padding:'14px 16px', fontSize:13, color:'var(--muted2)', lineHeight:1.7 }}>
            🚫 Notifications are blocked. Go to browser site settings → allow notifications for this site.
          </div>
        ) : (
          <>
            <Row icon="🔔" title="Daily Practice Reminder"
              sub={notifEnabled ? `Reminding you daily at ${reminderTime}` : '"You haven\'t practiced today 📚"'}
              last={!notifEnabled}>
              {notifPerm === 'default' && !notifEnabled ? (
                <button
                  onClick={handleRequestPermission} disabled={permAsking}
                  style={{ padding:'6px 14px', background:'var(--accent)', border:'none', borderRadius:8, color:'white', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  {permAsking ? '...' : 'Enable'}
                </button>
              ) : (
                <Toggle checked={notifEnabled} onChange={handleToggleNotif} disabled={notifPerm==='denied'}/>
              )}
            </Row>

            {notifEnabled && notifPerm === 'granted' && (
              <>
                <Row icon="⏰" title="Reminder Time" sub="What time should we remind you?">
                  <input type="time" value={reminderTime} onChange={e => handleTimeChange(e.target.value)}
                    style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 10px', color:'var(--text)', fontSize:13, fontWeight:600, cursor:'pointer' }}/>
                </Row>
                <div style={{ padding:'10px 16px' }}>
                  <button onClick={handleSendTest}
                    style={{ padding:'7px 14px', background:testSent?'rgba(34,197,94,.08)':'var(--surface2)', border:`1px solid ${testSent?'rgba(34,197,94,.3)':'var(--border)'}`, borderRadius:8, color:testSent?'var(--green)':'var(--muted2)', cursor:'pointer', fontSize:12, fontWeight:600, transition:'all .2s' }}>
                    {testSent ? '✅ Sent! Check notifications' : '🔔 Send a test notification'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </Section>

      {/* ── ACCOUNT ── */}
      <Section title="👤 Account">
        {/* User card */}
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,var(--accent),#ea580c)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'white', flexShrink:0, boxShadow:'0 4px 12px rgba(249,115,22,.3)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : ''}
            </div>
            <div style={{ fontSize:12, color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
          </div>
        </div>

        {/* Clear data */}
        <Row icon="🗑️" title="Clear Local Data" sub="Reset theme, language, font preferences" last>
          {clearDone ? (
            <span style={{ fontSize:12, color:'var(--green)', fontWeight:700 }}>✅ Cleared!</span>
          ) : showClearConfirm ? (
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={handleClearProgress} style={dangerBtn}>Confirm</button>
              <button onClick={() => setShowClearConfirm(false)} style={ghostBtn}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowClearConfirm(true)} style={dangerBtn}>Clear</button>
          )}
        </Row>
      </Section>

      {/* ── APP INFO ── */}
      <Section title="ℹ️ About">
        <Row icon="📱" title="ExamNova" sub="AI-powered Government Exam Preparation">
          <span style={{ fontSize:11, color:'var(--muted)', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'3px 9px', fontWeight:600 }}>v1.0.0</span>
        </Row>
        <Row icon="🇮🇳" title="Made for India" sub="SSC · Railway · Banking · UPSC">
          <span style={{ fontSize:11, color:'var(--green)', fontWeight:700 }}>🆓 Free</span>
        </Row>
        <Row icon="🔒" title="Privacy" sub="Your data is stored privately in Database" last>
          <span style={{ fontSize:11, color:'var(--muted)', fontWeight:600 }}>Secure ✓</span>
        </Row>
      </Section>

      <div style={{ textAlign:'center', fontSize:11, color:'var(--muted)', padding:'8px 0 32px', lineHeight:1.8 }}>
        ExamNova v1.0.0 · Made with ❤️ for Indian aspirants<br/>
        {/* <span style={{ opacity:.6 }}>Not affiliated with SSC, UPSC, RRB or any government body</span> */}
      </div>
    </div>
  )
}

const dangerBtn = { padding:'5px 12px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.3)', borderRadius:6, color:'var(--red)', cursor:'pointer', fontSize:12, fontWeight:600 }
const ghostBtn  = { padding:'5px 12px', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, color:'var(--muted2)', cursor:'pointer', fontSize:12 }