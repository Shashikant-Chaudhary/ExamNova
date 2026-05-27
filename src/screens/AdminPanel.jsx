// ─────────────────────────────────────────────
// AdminPanel.jsx
// Protected admin panel for managing question bank
// Only accessible by admin email
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import {
  getAllFeedback,
  adminReply,
  markResolved,
  markAdminRead,
  getAdminUnreadCount,
} from '../services/feedbackService'

import { doc, setDoc, getDoc, updateDoc,
         collection, getDocs, query,
         orderBy, limit }                     from 'firebase/firestore'
import { db }                                 from '../services/firebase'
import { getUserStats, getLatestUsers }       from '../services/storageService'
import { generateForBank, generateCurrentAffairsQuestions } from '../services/aiService'
import { getAllReports, updateQuestionInBank, updateReportStatus, getOpenReportsCount } from '../services/reportService'
import ShiftUploader from '../components/ShiftUploader'
import { loadCABank, saveCABank } from '../services/caService'


const EXAMS = [
  'SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD',
  'RRB NTPC', 'RRB Group D', 'RRB ALP',
  'IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk',
  'UPSC Prelims', 'UPSC CDS', 'State PSC',
  'SSC JE', 'SSC Stenographer',
  'RBI Grade B', 'RBI Assistant', 'LIC AAO',
  'NDA', 'AFCAT',
  'Delhi Police Constable',
]

const TOPICS = {
  'SSC CGL':      ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English Language', 'General Awareness'],
  'SSC CHSL':     ['Quantitative Aptitude', 'General Intelligence', 'English Language', 'General Awareness', 'Hindi'],
  'SSC MTS':      ['Numerical & Mathematical Ability', 'Reasoning Ability & Problem Solving', 'General English', 'General Awareness', 'Hindi'],
  'SSC GD':       ['Elementary Mathematics', 'General Intelligence & Reasoning', 'English Language', 'General Knowledge & Awareness', 'Hindi'],
  'RRB NTPC':     ['Mathematics', 'General Intelligence & Reasoning', 'General Awareness', 'General English', 'Hindi'],
  'RRB Group D':  ['Mathematics', 'General Intelligence & Reasoning', 'General Science', 'General Awareness & Current Affairs', 'General English', 'Hindi'],
  'RRB ALP':      ['Mathematics', 'General Intelligence & Reasoning', 'Basic Science & Engineering', 'General Awareness', 'General English', 'Hindi'],
  'IBPS PO':      ['Reasoning Ability', 'Quantitative Aptitude', 'English Language'],
  'IBPS Clerk':   ['Reasoning Ability', 'Quantitative Aptitude', 'English Language'],
  'SBI PO':       ['Reasoning & Computer Aptitude', 'Data Analysis & Interpretation', 'English Language'],
  'SBI Clerk':    ['Reasoning Ability & Computer Aptitude', 'Quantitative Aptitude', 'General English'],
  'UPSC Prelims': ['Indian History', 'Indian & World Geography', 'Indian Polity & Governance', 'Indian Economy', 'General Science & Technology', 'Current Affairs'],
  'UPSC CDS':     ['English', 'General Knowledge', 'Elementary Mathematics'],
  'State PSC':    ['History & Culture', 'Geography', 'Polity & Governance', 'Economy', 'General Science', 'Current Affairs', 'Hindi'],
   'SSC JE':                ['General Intelligence & Reasoning', 'General Awareness', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering'],
  'SSC Stenographer':      ['General Intelligence & Reasoning', 'General Awareness', 'English Language & Comprehension'],
  'RBI Grade B':           ['Reasoning', 'Quantitative Aptitude', 'English', 'General Awareness', 'Finance & Management'],
  'RBI Assistant':         ['Reasoning Ability', 'Numerical Ability', 'English Language', 'General Awareness'],
  'LIC AAO':               ['Reasoning Ability', 'Quantitative Aptitude', 'English Language', 'General Knowledge & Current Affairs'],
  'NDA':                   ['Mathematics', 'English', 'Physics', 'Chemistry', 'History, Freedom Movement & Geography'],
  'AFCAT':                 ['General Awareness', 'Verbal Ability in English', 'Numerical Ability', 'Reasoning & Military Aptitude'],
  'Delhi Police Constable':['General Intelligence & Reasoning', 'General Knowledge', 'Numerical Ability', 'English'],
}

// ── AUTO-DETECT LANGUAGE FROM TOPIC ─────────────
// Hindi topic → always hindi, English topic → always english
// Other topics → let user choose
function getTopicLanguage(topic) {
  const t = (topic || '').toLowerCase()
  if (t === 'hindi') return 'hindi'
  if (t.includes('english')) return 'english'
  return null  // user chooses
}

function bankKey(exam, topic, level, language = 'english') {
  return `${exam}__${topic}__${level}__${language}`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
}

export default function AdminPanel({ user, onLogout }) {

const [selectedExam,  setSelectedExam]  = useState('SSC CGL')
const [selectedTopic, setSelectedTopic] = useState('Quantitative Aptitude')
const [selectedLevel,    setSelectedLevel]    = useState('same')
const [selectedLanguage, setSelectedLanguage] = useState('english')
const [bankSize,      setBankSize]      = useState(null)
const [generating,    setGenerating]    = useState(false)
const [genStatus,     setGenStatus]     = useState('')
const [activeTab,     setActiveTab]     = useState('generate')
const [allBankSizes,  setAllBankSizes]  = useState({})
const [loadingBanks,  setLoadingBanks]  = useState(false)
const [overviewLevel,  setOverviewLevel]  = useState('same')
const [overviewLang,   setOverviewLang]   = useState('english')
const [activeSection,  setActiveSection]  = useState('bank')
const [userStats,      setUserStats]      = useState({ totalUsers: 0, activeUsers: 0 })
const [latestUsers,    setLatestUsers]    = useState([])
const [loadingUsers,   setLoadingUsers]   = useState(false)
const [healthData,     setHealthData]     = useState({})
const [loadingHealth,  setLoadingHealth]  = useState(false)
const [feedbacks,      setFeedbacks]      = useState([])
const [loadingFeedback,setLoadingFeedback]= useState(false)

// ── Mobile sidebar state ──
const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768)
const [sidebarOpen,  setSidebarOpen]  = useState(false)

useEffect(() => {
  const handle = () => {
    setIsMobile(window.innerWidth < 768)
    if (window.innerWidth >= 768) setSidebarOpen(false)
  }
  window.addEventListener('resize', handle)
  return () => window.removeEventListener('resize', handle)
}, [])
const [activeFeedback, setActiveFeedback] = useState(null)
const [replyText,      setReplyText]      = useState('')
const [sendingReply,   setSendingReply]   = useState(false)
const [adminUnread,    setAdminUnread]    = useState(0)
const [reports,        setReports]        = useState([])
const [loadingReports, setLoadingReports] = useState(false)
const [activeReport,   setActiveReport]   = useState(null)
const [editMode,       setEditMode]       = useState(false)
const [editQ,          setEditQ]          = useState(null)
const [savingEdit,     setSavingEdit]     = useState(false)
const [reportFilter,   setReportFilter]   = useState('open')
const [openReports,    setOpenReports]    = useState(0)

  // Manual form
  const [manualQ, setManualQ] = useState({
    question: '', optionA: '', optionB: '', optionC: '', optionD: '',
    correct: '0', explanation: '',
  })
  const [manualStatus, setManualStatus] = useState('')
  const [savedCount,   setSavedCount]   = useState(0)

  // JSON paste
  const [jsonText,   setJsonText]   = useState('')
  const [jsonStatus, setJsonStatus] = useState('')

  useEffect(() => { loadBankSize() }, [selectedExam, selectedTopic, selectedLevel, selectedLanguage])
  useEffect(() => { loadAllBankSizes() }, [])

  useEffect(() => {
    if (activeSection === 'students') loadUserStats()
    if (activeSection === 'feedback') loadFeedback()
    if (activeSection === 'reports')  loadReports()
  }, [activeSection])

  useEffect(() => {
    if (activeSection === 'reports') loadReports()
  }, [reportFilter])

  useEffect(() => {
    if (activeSection === 'health') loadBankHealth()
  }, [activeSection, overviewLevel, overviewLang])


  const loadBankSize = async () => {
    const key = bankKey(selectedExam, selectedTopic, selectedLevel, selectedLanguage)
    try {
      const ref  = doc(db, 'questionBank', key)
      const snap = await getDoc(ref)
      setBankSize(snap.exists() ? (snap.data().count || 0) : 0)
    } catch (e) { setBankSize(0) }
  }

  const loadAllBankSizes = async () => {
    setLoadingBanks(true)
    const sizes = {}
    for (const exam of EXAMS) {
      sizes[exam] = {}
      for (const topic of (TOPICS[exam] || [])) {
        try {
          const keyEnSame = bankKey(exam, topic, 'same', 'english')
          const keyHiSame = bankKey(exam, topic, 'same', 'hindi')
          const keyEnHard = bankKey(exam, topic, 'hard', 'english')
          const keyHiHard = bankKey(exam, topic, 'hard', 'hindi')

          const [snapEnSame, snapHiSame, snapEnHard, snapHiHard] = await Promise.all([
            getDoc(doc(db, 'questionBank', keyEnSame)),
            getDoc(doc(db, 'questionBank', keyHiSame)),
            getDoc(doc(db, 'questionBank', keyEnHard)),
            getDoc(doc(db, 'questionBank', keyHiHard)),
          ])

          sizes[exam][topic] = {
            enSame: snapEnSame.exists() ? (snapEnSame.data().count || 0) : 0,
            hiSame: snapHiSame.exists() ? (snapHiSame.data().count || 0) : 0,
            enHard: snapEnHard.exists() ? (snapEnHard.data().count || 0) : 0,
            hiHard: snapHiHard.exists() ? (snapHiHard.data().count || 0) : 0,
          }
        } catch (e) {
          sizes[exam][topic] = { enSame: 0, hiSame: 0, enHard: 0, hiHard: 0 }
        }
      }
    }
    setAllBankSizes(sizes)
    setLoadingBanks(false)
  }

  const loadUserStats = async () => {
    setLoadingUsers(true)
    try {
      const stats = await getUserStats()
      setUserStats(stats)
      const users = await getLatestUsers()
      setLatestUsers(users)
    } catch (e) {
      console.error('loadUserStats error:', e)
    }
    setLoadingUsers(false)
  }

  const loadFeedback = async () => {
    setLoadingFeedback(true)
    const data = await getAllFeedback()
    setFeedbacks(data)
    const unread = await getAdminUnreadCount()
    setAdminUnread(unread)
    setLoadingFeedback(false)
  }

  const loadReports = async () => {
    setLoadingReports(true)
    const data  = await getAllReports(reportFilter === 'all' ? null : reportFilter)
    const count = await getOpenReportsCount()
    setReports(data)
    setOpenReports(count)
    setLoadingReports(false)
  }

  const loadBankHealth = async () => {
    setLoadingHealth(true)
    try {
      const health = {}
      for (const exam of EXAMS) {
        health[exam] = {}
        for (const topic of (TOPICS[exam] || [])) {
          const key  = bankKey(exam, topic, overviewLevel, overviewLang)
          const ref  = doc(db, 'questionBank', key)
          const snap = await getDoc(ref)

          if (!snap.exists()) {
            health[exam][topic] = { bankSize: 0, maxSeen: 0, unseen: 0, status: 'empty' }
            continue
          }

          const bankQuestions = snap.data().questions || []
          const bankSize      = bankQuestions.length
          let maxSeen = 0
          try {
            const usersSnap = await getDocs(collection(db, 'users'))
            for (const userDoc of usersSnap.docs) {
              try {
                const topicRef  = doc(db, 'seenQuestions', userDoc.id, 'topics', key)
                const topicSnap = await getDoc(topicRef)
                if (topicSnap.exists()) {
                  const seenCount = (topicSnap.data().seen || []).length
                  if (seenCount > maxSeen) maxSeen = seenCount
                }
              } catch (e) {}
            }
          } catch (e) {
            console.log('Could not read seen questions:', e.message)
          }

          const unseen = Math.max(0, bankSize - maxSeen)
          const status = unseen === 0 ? 'critical' : unseen <= 30 ? 'low' : 'good'
          health[exam][topic] = { bankSize, maxSeen, unseen, status }
        }
      }
      setHealthData(health)
    } catch (e) {
      console.error('loadBankHealth error:', e)
    }
    setLoadingHealth(false)
  }

  const saveToBank = async (questions) => {
    const key  = bankKey(selectedExam, selectedTopic, selectedLevel, selectedLanguage)
    const ref  = doc(db, 'questionBank', key)
    const snap = await getDoc(ref)

    const existing      = snap.exists() ? (snap.data().questions || []) : []
    const existingTexts = existing.map(q => q.question.trim().toLowerCase())

    const duplicates = []
    const newUnique  = questions.filter(q => {
      const text = q.question.trim().toLowerCase()
      if (existingTexts.includes(text)) {
        duplicates.push(q.question.substring(0, 50))
        return false
      }
      return true
    })

    if (newUnique.length === 0) {
      throw new Error(`All ${questions.length} questions already exist in bank!`)
    }

    const combined = [...existing, ...newUnique]

    if (snap.exists()) {
      await updateDoc(ref, {
        questions: combined,
        count:     combined.length,
        updatedAt: new Date().toISOString(),
      })
    } else {
      await setDoc(ref, {
        exam:      selectedExam,
        topic:     selectedTopic,
        level:     selectedLevel,
        language:  selectedLanguage,
        questions: combined,
        count:     combined.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    return { total: combined.length, added: newUnique.length, duplicates: duplicates.length }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenStatus('🤖 Generating questions with AI...')
    try {
      const questions = await generateForBank({
        exam: selectedExam, topic: selectedTopic,
        subtopics: [], level: selectedLevel, language: selectedLanguage, count: 26,
      })
      const result = await saveToBank(questions)
      setGenStatus(`✅ Added ${result.added} questions! Bank now has ${result.total} questions.${result.duplicates > 0 ? ` (${result.duplicates} duplicates skipped)` : ''}`)
      await loadBankSize()
      await loadAllBankSizes()
    } catch (e) {
      setGenStatus(`❌ Failed: ${e.message}`)
    }
    setGenerating(false)
  }

  const handleManualAdd = async () => {
    if (!manualQ.question || !manualQ.optionA || !manualQ.optionB || !manualQ.optionC || !manualQ.optionD || !manualQ.explanation) {
      setManualStatus('❌ Please fill all fields')
      return
    }
    try {
      setManualStatus('💾 Saving...')
      const question = {
        question:    manualQ.question.trim(),
        subtopic:    selectedTopic,
        options:     [manualQ.optionA.trim(), manualQ.optionB.trim(), manualQ.optionC.trim(), manualQ.optionD.trim()],
        correct:     parseInt(manualQ.correct),
        explanation: manualQ.explanation.trim(),
      }
      try {
        const result = await saveToBank([question])
        setSavedCount(c => c + 1)
        setManualStatus(`✅ Question saved! Add another.`)
      } catch (e) {
        if (e.message.includes('already exist')) {
          setManualStatus('⚠️ This question already exists in bank!')
        } else {
          throw e
        }
        return
      }
      setManualQ({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: '0', explanation: '', subtopic: '' })
      await loadBankSize()
    } catch (e) {
      setManualStatus(`❌ Failed: ${e.message}`)
    }
  }

  const handleJsonUpload = async () => {
  try {
    setJsonStatus('🔍 Parsing JSON...')
    let parsed = JSON.parse(jsonText)

    // ── Auto-detect and unwrap shift paper wrapper formats ──

    // Format 1: [{shiftId, questions:[...]}, ...] — array of shift objects
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.questions) {
      parsed = parsed.flatMap(shift => shift.questions || [])
    }
    // Format 2: {shiftId, questions:[...]} — single shift object
    else if (!Array.isArray(parsed) && parsed?.questions) {
      parsed = parsed.questions
    }
    // Format 3: already a flat array — do nothing

    const questions = parsed

    if (!Array.isArray(questions)) {
      setJsonStatus('❌ JSON must be an array of questions')
      return
    }

    const valid = questions.filter(q =>
      q.question &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correct === 'number' &&
      q.explanation
    )

    const invalid = questions.length - valid.length

    if (valid.length === 0) {
      setJsonStatus(`❌ No valid questions found. Check that each question has: question, options[4], correct(0-3), explanation`)
      return
    }

    setJsonStatus(`💾 Saving ${valid.length} questions${invalid > 0 ? ` (${invalid} skipped — missing fields)` : ''}...`)
    const result = await saveToBank(valid)
    setJsonStatus(
      `✅ Added ${result.added} of ${valid.length} questions! Bank now has ${result.total} questions.` +
      `${result.duplicates > 0 ? ` (${result.duplicates} duplicates skipped)` : ''}` +
      `${invalid > 0 ? ` (${invalid} had missing fields)` : ''}`
    )
    setJsonText('')
    await loadBankSize()
    await loadAllBankSizes()
  } catch (e) {
    setJsonStatus(`❌ JSON error: ${e.message}`)
  }
}

  const bankColor = (size) => {
    if (size >= 50) return 'var(--green)'
    if (size >= 20) return 'var(--accent)'
    if (size > 0)   return '#f59e0b'
    return 'var(--red)'
  }

  const statusStyle = (status) => ({
    marginTop: '12px',
    padding: '10px 14px',
    background: status.startsWith('✅') ? 'rgba(34,197,94,.08)' : status.startsWith('❌') ? 'rgba(239,68,68,.08)' : 'var(--surface2)',
    border: `1px solid ${status.startsWith('✅') ? 'var(--green)' : status.startsWith('❌') ? 'var(--red)' : 'var(--border)'}`,
    borderRadius: '8px',
    fontSize: '13px',
    color: 'var(--text)',
  })

  // ── NAV items ──
  const NAV = [
    { id: 'bank',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>, label: 'Question Bank' },
    { id: 'health',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, label: 'Bank Health' },
    { id: 'ca',       icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a4 4 0 01-4-4V6"/><path d="M2 6a2 2 0 012-2h2"/><line x1="12" y1="11" x2="16" y2="11"/><line x1="12" y1="7" x2="16" y2="7"/><line x1="8" y1="15" x2="16" y2="15"/></svg>, label: 'CA Bank' },
    { id: 'students', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, label: 'Students' },
    { id: 'feedback', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, label: 'Feedback', badge: adminUnread > 0 ? adminUnread : null },
    { id: 'reports',  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>, label: 'Reports', badge: openReports > 0 ? openReports : null },
    { id: 'shifts',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label: 'Shift Papers' },
  ]

  // ── Navigate and close sidebar on mobile ──
  const handleNav = (id) => {
    setActiveSection(id)
    if (isMobile) setSidebarOpen(false)
  }

  // ── Sidebar inner content ──
  const SidebarContent = () => (
    <>
      {/* Logo area */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>ExamNova</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Admin Panel</div>
          </div>
          {/* Close button on mobile */}
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)}
              style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
              ✕
            </button>
          )}
        </div>
        {/* Admin info */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.map(item => {
          const isActive = activeSection === item.id
          return (
            <button key={item.id}
              className="adm-nav-btn"
              onClick={() => handleNav(item.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: isActive ? 'rgba(249,115,22,.1)' : 'transparent', color: isActive ? 'var(--accent)' : 'var(--muted2)', cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 700 : 500, marginBottom: 2, textAlign: 'left', position: 'relative' }}>
              <span style={{ color: isActive ? 'var(--accent)' : 'var(--muted)', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: 'var(--red)', color: 'white', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{item.badge}</span>
              )}
              {isActive && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 2px 2px 0', background: 'var(--accent)' }} />}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={onLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,.4)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,.06)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <style>{`
        @keyframes adm-fade    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes adm-slide-in{ from{transform:translateX(-100%)} to{transform:translateX(0)} }
        .adm-nav-btn  { transition: all 0.15s ease !important; }
        .adm-nav-btn:hover { background: rgba(255,255,255,.05) !important; }
        .adm-card     { transition: box-shadow 0.15s ease; }
        .adm-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.12) !important; }
        .adm-input    { transition: border-color 0.15s; outline: none; }
        .adm-input:focus { border-color: var(--accent) !important; }
      `}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <div style={{ width: 220, flexShrink: 0, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
          <SidebarContent />
        </div>
      )}

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {isMobile && sidebarOpen && (
        <>
          {/* Backdrop */}
          <div onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
          {/* Drawer */}
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 260, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', zIndex: 300, animation: 'adm-slide-in 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
            <SidebarContent />
          </div>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 14px 40px' : '28px 28px 40px', minWidth: 0 }}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px' }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
              ☰
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {NAV.find(n => n.id === activeSection)?.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>ExamNova Admin</div>
            </div>
            {/* Unread badges in mobile header */}
            {(adminUnread > 0 || openReports > 0) && (
              <div style={{ display: 'flex', gap: 6 }}>
                {adminUnread > 0 && <span style={{ background: 'var(--red)', color: 'white', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>{adminUnread}</span>}
                {openReports > 0 && <span style={{ background: '#f59e0b', color: 'white', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 700 }}>{openReports}</span>}
              </div>
            )}
          </div>
        )}

        {/* Page header — desktop only */}
        {!isMobile && (
          <div style={{ marginBottom: 24, animation: 'adm-fade 0.3s ease' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
              {NAV.find(n => n.id === activeSection)?.label}
            </h1>
            <div style={{ height: 3, width: 40, background: 'linear-gradient(90deg, var(--accent), #ea580c)', borderRadius: 2 }} />
          </div>
        )}

      {/* ── BANK SECTION ── */}
      {activeSection === 'bank' && (
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', animation: 'adm-fade 0.3s ease' }}>
        {/* LEFT — Bank overview */}
        <div style={{ width: '260px', flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px', maxHeight: '82vh', overflowY: 'auto', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 3, height: 14, background: 'var(--accent)', borderRadius: 2 }} />
            Bank Overview
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            {['same', 'hard'].map(l => (
              <button key={l}
                style={{ flex: 1, padding: '4px', borderRadius: '6px', border: '1px solid', borderColor: overviewLevel === l ? 'var(--accent)' : 'var(--border)', background: overviewLevel === l ? 'rgba(249,115,22,.1)' : 'transparent', color: overviewLevel === l ? 'var(--accent)' : 'var(--muted)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => setOverviewLevel(l)}>
                {l === 'same' ? 'Same' : 'Hard'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {['english', 'hindi'].map(l => (
              <button key={l}
                style={{ flex: 1, padding: '4px', borderRadius: '6px', border: '1px solid', borderColor: overviewLang === l ? 'var(--blue)' : 'var(--border)', background: overviewLang === l ? 'rgba(59,130,246,.1)' : 'transparent', color: overviewLang === l ? 'var(--blue)' : 'var(--muted)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => setOverviewLang(l)}>
                {l === 'english' ? 'EN' : 'हि'}
              </button>
            ))}
          </div>

          {loadingBanks ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
              <p style={{ color: 'var(--muted)', marginTop: '8px', fontSize: '12px' }}>Loading...</p>
            </div>
          ) : (
            EXAMS.map(exam => (
              <div key={exam} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', padding: '4px 0', borderBottom: '1px solid var(--border)', marginBottom: '4px', cursor: 'pointer' }}
                  onClick={() => { setSelectedExam(exam); setSelectedTopic(TOPICS[exam]?.[0] || '') }}>
                  {exam}
                </div>
                {(TOPICS[exam] || []).map(topic => {
                  const sizes   = allBankSizes[exam]?.[topic] ?? { enSame: 0, hiSame: 0, enHard: 0, hiHard: 0 }
                  const sizeKey = `${overviewLang === 'english' ? 'en' : 'hi'}${overviewLevel === 'same' ? 'Same' : 'Hard'}`
                  const count   = sizes[sizeKey] ?? 0

                  return (
                    <div key={topic}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', background: selectedExam === exam && selectedTopic === topic ? 'rgba(249,115,22,.08)' : 'transparent' }}
                      onClick={() => { setSelectedExam(exam); setSelectedTopic(topic) }}>
                      <span style={{ fontSize: '11px', color: 'var(--muted2)' }}>{topic}</span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: bankColor(count), background: 'var(--surface2)', padding: '1px 6px', borderRadius: '4px' }}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            ))
          )}

          <button className="btn btn-ghost" style={{ width: '100%', marginTop: '12px', fontSize: '12px' }} onClick={loadAllBankSizes}>
            🔄 Refresh
          </button>
        </div>

        {/* RIGHT — Add questions */}
        <div style={{ flex: 1, minWidth: '300px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Exam',     value: selectedExam,     onChange: (v) => { setSelectedExam(v); setSelectedTopic(TOPICS[v]?.[0] || '') }, options: EXAMS },
              { label: 'Topic', value: selectedTopic, onChange: (v) => {
                  setSelectedTopic(v)
                  const autoLang = getTopicLanguage(v)
                  if (autoLang) setSelectedLanguage(autoLang)
                }, options: TOPICS[selectedExam] || [] },
              { label: 'Level', value: selectedLevel, onChange: (v) => setSelectedLevel(v), options: ['same', 'hard'] },
              // Language selector only shows when topic is NOT hindi/english (those are auto-detected)
              ...(!getTopicLanguage(selectedTopic) ? [{ label: 'Language', value: selectedLanguage, onChange: (v) => setSelectedLanguage(v), options: ['english', 'hindi'] }] : []),
            ].map(s => (
              <div key={s.label} style={{ flex: 1, minWidth: '130px' }}>
                <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', display: 'block' }}>{s.label}</label>
                <select style={{ width: '100%', padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px' }}
                  value={s.value} onChange={e => s.onChange(e.target.value)}>
                  {s.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {selectedLanguage === 'hindi' ? 'हिंदी' : 'English'} bank size:
            </span>
            <span style={{ fontSize: '20px', fontWeight: '800', color: bankColor(bankSize || 0) }}>{bankSize ?? '...'}</span>
            <span style={{ fontSize: '12px', color: bankSize >= 50 ? 'var(--green)' : bankSize >= 20 ? 'var(--accent)' : 'var(--red)' }}>
              {bankSize >= 50 ? '✅ Good' : bankSize >= 20 ? '⚠️ Low' : '❌ Empty'}
            </span>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px' }}>
            {[{ id: 'generate', label: '🤖 AI Generate' }, { id: 'manual', label: '✍️ Manual' }, { id: 'json', label: '📋 JSON' }].map(t => (
              <button key={t.id}
                style={{ padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === t.id ? 'var(--accent)' : 'var(--muted)', fontWeight: activeTab === t.id ? '700' : '400' }}
                onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'generate' && (
            <div>
              <p style={{ color: 'var(--muted2)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                AI will generate <strong>26 questions</strong> for <strong>{selectedExam} — {selectedTopic}</strong> at <strong>{selectedLevel}</strong> level.
              </p>
              <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '15px', opacity: generating ? 0.7 : 1 }}
                onClick={handleGenerate} disabled={generating}>
                {generating
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="spinner" style={{ width: '16px', height: '16px' }} />Generating...</span>
                  : '🤖 Generate 26 Questions'}
              </button>
              {genStatus && <div style={statusStyle(genStatus)}>{genStatus}</div>}
            </div>
          )}

          {activeTab === 'manual' && (
            <div>
              {savedCount > 0 && (
                <div style={{ background: 'rgba(34,197,94,.08)', border: '1px solid var(--green)', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: 'var(--green)', marginBottom: '14px' }}>
                  ✅ {savedCount} questions saved this session
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {[
                  { key: 'question',    label: 'Question *',    type: 'textarea', placeholder: 'Enter question text...' },
                  { key: 'optionA',     label: 'Option A *',    type: 'input',    placeholder: 'Option A' },
                  { key: 'optionB',     label: 'Option B *',    type: 'input',    placeholder: 'Option B' },
                  { key: 'optionC',     label: 'Option C *',    type: 'input',    placeholder: 'Option C' },
                  { key: 'optionD',     label: 'Option D *',    type: 'input',    placeholder: 'Option D' },
                  { key: 'explanation', label: 'Explanation *', type: 'textarea', placeholder: 'Step by step explanation...' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600', marginBottom: '4px', display: 'block' }}>{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea style={{ width: '100%', padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', height: '72px', resize: 'vertical', boxSizing: 'border-box' }}
                        placeholder={field.placeholder} value={manualQ[field.key]}
                        onChange={e => setManualQ(p => ({ ...p, [field.key]: e.target.value }))} />
                    ) : (
                      <input style={{ width: '100%', padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', boxSizing: 'border-box' }}
                        placeholder={field.placeholder} value={manualQ[field.key]}
                        onChange={e => setManualQ(p => ({ ...p, [field.key]: e.target.value }))} />
                    )}
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600', marginBottom: '4px', display: 'block' }}>Correct Answer *</label>
                  <select style={{ width: '100%', padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px' }}
                    value={manualQ.correct} onChange={e => setManualQ(p => ({ ...p, correct: e.target.value }))}>
                    {['Option A', 'Option B', 'Option C', 'Option D'].map((o, i) => <option key={i} value={i}>{o}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" style={{ padding: '12px 32px' }} onClick={handleManualAdd}>💾 Save Question</button>
              {manualStatus && <div style={statusStyle(manualStatus)}>{manualStatus}</div>}
            </div>
          )}

          {activeTab === 'json' && (
            <div>
              <p style={{ color: 'var(--muted2)', fontSize: '13px', marginBottom: '10px', lineHeight: '1.6' }}>
                Paste JSON array. Each item needs: <code style={{ background: 'var(--surface2)', padding: '2px 5px', borderRadius: '4px' }}>question, options[4], correct(0-3), explanation</code>
              </p>
              <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px', marginBottom: '10px', fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }}>
                {`[{"question":"...","subtopic":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}]`}
              </div>
              <textarea
                style={{ width: '100%', padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '12px', height: '180px', resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box' }}
                placeholder="Paste JSON here..."
                value={jsonText}
                onChange={e => setJsonText(e.target.value)}
              />
              <button className="btn btn-primary" style={{ padding: '12px 32px', marginTop: '10px' }} onClick={handleJsonUpload}>📤 Upload Questions</button>
              {jsonStatus && <div style={statusStyle(jsonStatus)}>{jsonStatus}</div>}
            </div>
          )}

        </div>
      </div>
      )}

      {/* ── HEALTH SECTION ── */}
      {activeSection === 'health' && (
        <div style={{ animation: 'adm-fade 0.3s ease' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['same', 'hard'].map(l => (
                <button key={l}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid', borderColor: overviewLevel === l ? 'var(--accent)' : 'var(--border)', background: overviewLevel === l ? 'rgba(249,115,22,.1)' : 'var(--surface)', color: overviewLevel === l ? 'var(--accent)' : 'var(--muted)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  onClick={() => setOverviewLevel(l)}>
                  {l === 'same' ? 'Same Level' : 'Hard Level'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['english', 'hindi'].map(l => (
                <button key={l}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid', borderColor: overviewLang === l ? 'var(--blue)' : 'var(--border)', background: overviewLang === l ? 'rgba(59,130,246,.1)' : 'var(--surface)', color: overviewLang === l ? 'var(--blue)' : 'var(--muted)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  onClick={() => setOverviewLang(l)}>
                  {l === 'english' ? 'English' : 'हिंदी'}
                </button>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={loadBankHealth}>
              🔄 Refresh Health
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            {[
              { color: 'var(--red)',   label: '🔴 Critical (0 unseen)' },
              { color: '#f59e0b',      label: '🟠 Low (1-30 unseen)'   },
              { color: 'var(--green)', label: '🟢 Good (30+ unseen)'   },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          {loadingHealth ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
              <p style={{ color: 'var(--muted)', marginTop: '12px' }}>Analyzing bank health...</p>
            </div>
          ) : Object.keys(healthData).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              Click Refresh Health to load data
            </div>
          ) : (
            EXAMS.map(exam => (
              <div key={exam} style={{ marginBottom: '20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent)', marginBottom: '10px' }}>{exam}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(TOPICS[exam] || []).map(topic => {
                    const h      = healthData[exam]?.[topic]
                    const status = h?.status || 'empty'
                    const color  = status === 'good' ? 'var(--green)' : status === 'low' ? '#f59e0b' : 'var(--red)'
                    const bg     = status === 'good' ? 'rgba(34,197,94,.06)' : status === 'low' ? 'rgba(245,158,11,.06)' : 'rgba(239,68,68,.06)'
                    return (
                      <div key={topic} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', background: bg, border: `1px solid ${color}22` }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>{topic}</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                            Bank: {h?.bankSize || 0} · Max seen: {h?.maxSeen || 0} · Unseen: {h?.unseen || 0}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <button
                            className="btn btn-ghost"
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => { setActiveSection('bank'); setSelectedExam(exam); setSelectedTopic(topic) }}
                          >
                            Add →
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── CA BANK SECTION ── */}
      {activeSection === 'ca' && (
        <div style={{ animation: 'adm-fade 0.3s ease' }}>
          <CABankSection />
        </div>
      )}

      {/* ── STUDENTS SECTION ── */}
      {activeSection === 'students' && (
        <div style={{ animation: 'adm-fade 0.3s ease' }}>
          {loadingUsers ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div className="spinner" style={{ margin: '0 auto 14px' }} />
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Loading student data...</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {[
                  { val: userStats.totalUsers, label: 'Total Students', labelHi: 'कुल छात्र', col: 'var(--accent)', bg: 'rgba(249,115,22,.08)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
                  { val: userStats.activeUsers, label: 'Active Students', labelHi: 'सक्रिय छात्र', col: 'var(--green)', bg: 'rgba(34,197,94,.08)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
                  { val: `${userStats.totalUsers > 0 ? Math.round((userStats.activeUsers / userStats.totalUsers) * 100) : 0}%`, label: 'Activity Rate', labelHi: 'गतिविधि दर', col: '#3b82f6', bg: 'rgba(59,130,246,.08)', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
                ].map(s => (
                  <div key={s.label} className="adm-card" style={{ background: s.bg, border: `1px solid ${s.col}25`, borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{ color: s.col, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: s.col, lineHeight: 1, marginBottom: 6 }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: 2 }}>{s.labelHi}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 3, height: 16, background: 'var(--accent)', borderRadius: 2 }} />
                    <h2 style={{ fontSize: '14px', fontWeight: '800', margin: 0 }}>Latest Visitors</h2>
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={loadUserStats}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{marginRight:4}}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                    Refresh
                  </button>
                </div>
                {latestUsers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: 13 }}>No user visit data yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {latestUsers.map((u, i) => (
                      <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: 'var(--surface2)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `hsl(${(i * 47) % 360},60%,50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>{u.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{u.email}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '2px' }}>{u.testCount} tests</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {u.lastVisit ? new Date(u.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── FEEDBACK SECTION ── */}
      {activeSection === 'feedback' && (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', animation: 'adm-fade 0.3s ease' }}>
          <div style={{ width: '300px', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '700' }}>
                All Feedback
                {adminUnread > 0 && (
                  <span style={{ marginLeft: '8px', background: 'var(--red)', color: 'white', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>
                    {adminUnread} new
                  </span>
                )}
              </h2>
              <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={loadFeedback}>🔄</button>
            </div>

            {loadingFeedback ? (
              <div style={{ textAlign: 'center', padding: '20px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            ) : feedbacks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>No feedback yet</div>
            ) : (
              feedbacks.map(fb => {
                const catColors = { bug: '#ef4444', question: '#f97316', suggestion: '#22c55e', other: '#3b82f6' }
                const color = catColors[fb.category] || '#3b82f6'
                return (
                  <div key={fb.id}
                    style={{ padding: '12px', background: activeFeedback?.id === fb.id ? 'rgba(249,115,22,.08)' : 'var(--surface)', border: `1px solid ${activeFeedback?.id === fb.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '10px', marginBottom: '8px', cursor: 'pointer' }}
                    onClick={async () => {
                      setActiveFeedback(fb)
                      setReplyText('')
                      if (fb.unread) { await markAdminRead(fb.id); await loadFeedback() }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color, background: `${color}15`, padding: '2px 6px', borderRadius: '4px' }}>{fb.category}</span>
                      <span style={{ fontSize: '11px', color: fb.status === 'resolved' ? 'var(--green)' : fb.status === 'replied' ? 'var(--accent)' : 'var(--muted)' }}>{fb.status}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fb.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{fb.userName}</span>
                      {fb.unread && <span style={{ color: 'var(--red)', fontWeight: '700' }}>● new</span>}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div style={{ flex: 1, minWidth: '300px' }}>
            {!activeFeedback ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                Select a message to reply
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{activeFeedback.userName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{activeFeedback.userEmail}</div>
                  </div>
                  {activeFeedback.status !== 'resolved' && (
                    <button className="btn btn-ghost" style={{ fontSize: '12px', color: 'var(--green)' }}
                      onClick={async () => { await markResolved(activeFeedback.id); await loadFeedback(); setActiveFeedback(prev => ({ ...prev, status: 'resolved' })) }}>
                      ✅ Mark Resolved
                    </button>
                  )}
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ maxWidth: '80%', background: 'rgba(249,115,22,.1)', border: '1px solid rgba(249,115,22,.2)', borderRadius: '12px 12px 2px 12px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '700', marginBottom: '4px' }}>{activeFeedback.category}</div>
                      <div style={{ fontSize: '13px', lineHeight: '1.5' }}>{activeFeedback.message}</div>
                      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', textAlign: 'right' }}>
                        {new Date(activeFeedback.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  {activeFeedback.replies?.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: r.from === 'admin' ? 'flex-start' : 'flex-end' }}>
                      <div style={{ maxWidth: '80%', background: r.from === 'admin' ? 'var(--surface2)' : 'rgba(249,115,22,.1)', border: '1px solid var(--border)', borderRadius: r.from === 'admin' ? '12px 12px 12px 2px' : '12px 12px 2px 12px', padding: '10px 12px' }}>
                        {r.from === 'admin' && <div style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: '700', marginBottom: '4px' }}>Admin Reply</div>}
                        <div style={{ fontSize: '13px', lineHeight: '1.5' }}>{r.message}</div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px', textAlign: 'right' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {activeFeedback.status !== 'resolved' && (
                  <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                    <input
                      style={{ flex: 1, padding: '9px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={async e => {
                        if (e.key === 'Enter' && replyText.trim()) {
                          setSendingReply(true)
                          await adminReply(activeFeedback.id, replyText.trim())
                          setReplyText('')
                          await loadFeedback()
                          const updated = feedbacks.find(f => f.id === activeFeedback.id)
                          if (updated) setActiveFeedback(updated)
                          setSendingReply(false)
                        }
                      }}
                    />
                    <button className="btn btn-primary" style={{ padding: '9px 16px', fontSize: '13px' }}
                      disabled={!replyText.trim() || sendingReply}
                      onClick={async () => {
                        if (!replyText.trim()) return
                        setSendingReply(true)
                        await adminReply(activeFeedback.id, replyText.trim())
                        setReplyText('')
                        await loadFeedback()
                        setSendingReply(false)
                      }}>
                      {sendingReply ? '...' : 'Send'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REPORTS SECTION ── */}
      {activeSection === 'reports' && (
        <div style={{ animation: 'adm-fade 0.3s ease' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' }}>
            {['open', 'fixed', 'dismissed', 'all'].map(f => (
              <button key={f}
                style={{ padding: '6px 14px', borderRadius: '7px', border: '1px solid', borderColor: reportFilter === f ? 'var(--accent)' : 'var(--border)', background: reportFilter === f ? 'rgba(249,115,22,.1)' : 'var(--surface)', color: reportFilter === f ? 'var(--accent)' : 'var(--muted)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                onClick={() => setReportFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'open' && openReports > 0 && (
                  <span style={{ marginLeft: '6px', background: 'var(--red)', color: 'white', borderRadius: '8px', padding: '1px 5px', fontSize: '10px' }}>{openReports}</span>
                )}
              </button>
            ))}
            <button className="btn btn-ghost" style={{ fontSize: '12px', marginLeft: 'auto' }} onClick={loadReports}>🔄 Refresh</button>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: '300px', flexShrink: 0, maxHeight: '70vh', overflowY: 'auto' }}>
              {loadingReports ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              ) : reports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '13px' }}>No {reportFilter} reports</div>
              ) : (
                reports.map(r => (
                  <div key={r.id}
                    style={{ padding: '12px', marginBottom: '8px', cursor: 'pointer', background: activeReport?.id === r.id ? 'rgba(249,115,22,.08)' : 'var(--surface)', border: `1px solid ${activeReport?.id === r.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '10px' }}
                    onClick={() => { setActiveReport(r); setEditMode(false); setEditQ(null) }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: r.status === 'open' ? 'var(--red)' : r.status === 'fixed' ? 'var(--green)' : 'var(--muted)' }}>{r.status}</span>
                      <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.question}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.reason}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ flex: 1, minWidth: '300px' }}>
              {!activeReport ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚩</div>
                  Select a report to review
                </div>
              ) : (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reported by</div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{activeReport.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{activeReport.userEmail}</div>
                    </div>
                    {activeReport.status === 'open' && (
                      <button className="btn btn-ghost" style={{ fontSize: '12px', color: 'var(--muted)' }}
                        onClick={async () => { await updateReportStatus(activeReport.id, 'dismissed', 'Dismissed by admin'); await loadReports(); setActiveReport(null) }}>
                        Dismiss
                      </button>
                    )}
                  </div>

                  <div style={{ marginBottom: '12px', padding: '10px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--red)', marginBottom: '4px' }}>Report Reason</div>
                    <div style={{ fontSize: '13px' }}>{activeReport.reason}</div>
                    {activeReport.comment && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{activeReport.comment}</div>}
                  </div>

                  {!editMode ? (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Question</div>
                        <div style={{ fontSize: '14px', lineHeight: '1.6', fontWeight: '500' }}>{activeReport.question}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                        {activeReport.options?.map((opt, i) => (
                          <div key={i} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12px', color: i === activeReport.correct ? 'var(--green)' : 'var(--text)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontWeight: '700', flexShrink: 0 }}>{['A','B','C','D'][i]}.</span>
                            {opt}
                            {i === activeReport.correct && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '700' }}>✓ Correct</span>}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Explanation</div>
                        <div style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text)', background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.15)', padding: '10px 12px', borderRadius: '8px', whiteSpace: 'pre-line' }}>
                          {activeReport.explanation}
                        </div>
                      </div>
                      {activeReport.status === 'open' && (
                        <button className="btn btn-primary" style={{ fontSize: '13px' }}
                          onClick={() => { setEditMode(true); setEditQ({ question: activeReport.question, optionA: activeReport.options?.[0] || '', optionB: activeReport.options?.[1] || '', optionC: activeReport.options?.[2] || '', optionD: activeReport.options?.[3] || '', correct: String(activeReport.correct ?? 0), explanation: activeReport.explanation }) }}>
                          ✏️ Edit Question
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Question</label>
                          <textarea style={{ width: '100%', padding: '9px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '12px', height: '80px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                            value={editQ.question} onChange={e => setEditQ(p => ({ ...p, question: e.target.value }))} />
                        </div>
                        {['A','B','C','D'].map((opt, i) => (
                          <div key={opt}>
                            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Option {opt}</label>
                            <input style={{ width: '100%', padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '12px', boxSizing: 'border-box', outline: 'none' }}
                              value={editQ[`option${opt}`]} onChange={e => setEditQ(p => ({ ...p, [`option${opt}`]: e.target.value }))} />
                          </div>
                        ))}
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Correct Answer</label>
                          <select style={{ width: '100%', padding: '8px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '12px' }}
                            value={editQ.correct} onChange={e => setEditQ(p => ({ ...p, correct: e.target.value }))}>
                            {['Option A','Option B','Option C','Option D'].map((o,i) => <option key={i} value={i}>{o}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>Explanation</label>
                          <textarea style={{ width: '100%', padding: '9px 10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '12px', height: '100px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                            value={editQ.explanation} onChange={e => setEditQ(p => ({ ...p, explanation: e.target.value }))} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '13px', opacity: savingEdit ? 0.7 : 1 }} disabled={savingEdit}
                          onClick={async () => {
                            setSavingEdit(true)
                            const updated = { question: editQ.question, options: [editQ.optionA, editQ.optionB, editQ.optionC, editQ.optionD], correct: parseInt(editQ.correct), explanation: editQ.explanation }
                            const success = await updateQuestionInBank({ bankKey: activeReport.bankKey, originalQuestion: activeReport.question, updatedQuestion: updated })
                            if (success) {
                              await updateReportStatus(activeReport.id, 'fixed', 'Question edited and fixed by admin')
                              await loadReports()
                              setActiveReport(null); setEditMode(false); setEditQ(null)
                            } else {
                              alert('Failed to update question in bank. Check bank key.')
                            }
                            setSavingEdit(false)
                          }}>
                          {savingEdit ? 'Saving...' : '💾 Save & Mark Fixed'}
                        </button>
                        <button className="btn btn-ghost" style={{ fontSize: '13px' }} onClick={() => { setEditMode(false); setEditQ(null) }}>Cancel</button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SHIFTS SECTION ── */}
      {activeSection === 'shifts' && (
        <div style={{ animation: 'adm-fade 0.3s ease' }}>
          <ShiftUploader />
        </div>
      )}

      </div>{/* end main content */}
    </div>
  )
}


// ── CA BANK SECTION COMPONENT ─────────────────
function CABankSection() {
  const CA_TOPICS = [
    'Government Schemes & Policies',
    'Sports & Games',
    'Awards & Honours',
    'Science & Space',
    'Economy & Banking',
    'International Relations',
    'Environment & Climate',
    'Appointments & Elections',
    'Defence & Security',
    'Art & Culture',
  ]
  const CA_YEARS = ['2025 2026', '2024 2025', '2023 2024', '2022 2023']
  const [language, setLanguage] = useState('english')
  const [topic,    setTopic]    = useState(CA_TOPICS[0])
  const [year,     setYear]     = useState(CA_YEARS[0])
  const [status,   setStatus]   = useState('')
  const [count,    setCount]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [checking, setChecking] = useState(false)

  const checkBank = async () => {
    setChecking(true)
    try {
      const cached = await loadCABank(null, topic, year, language)
      setCount(cached.length)
    } catch (e) {
      setCount(0)
    }
    setChecking(false)
  }

  useEffect(() => {
    setCount(null)
    setStatus('')
    checkBank()
  }, [topic, year, language])

  const handleGenerate = async () => {
    setLoading(true)
    setStatus('🤖 Generating CA questions...')
    try {
      const qs = await generateCurrentAffairsQuestions({
        topic, year, count: 15, language,
      })
      await saveCABank(null, topic, year, qs, language)
      setStatus(`✅ Saved ${qs.length} questions to cache`)
      setCount(qs.length)
    } catch (e) {
      setStatus(`❌ Failed: ${e.message}`)
    }
    setLoading(false)
  }

  const countColor = count === null ? 'var(--muted)' : count >= 10 ? 'var(--green)' : count > 0 ? '#f59e0b' : 'var(--red)'
  const countLabel = count === null ? 'Checking...' : count >= 10 ? `${count} questions cached ✅` : count > 0 ? `${count} questions (low — regenerate)` : 'Empty — first student will auto-generate'

  return (
    <div style={{ maxWidth: '640px' }}>

      {/* Info box */}
      <div style={{ background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.2)', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--blue)', marginBottom: '4px' }}>📰 How CA Caching Works</div>
        <div style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: '1.6' }}>
          Pre-generate questions here so students never wait. Cache lasts 30 days then auto-refreshes on next student visit.
          If empty, the first student triggers generation — everyone after gets instant questions from cache.
        </div>
      </div>

      {/* Selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', display: 'block' }}>Topic</label>
          <select style={{ width: '100%', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px' }}
            value={topic} onChange={e => setTopic(e.target.value)}>
            {CA_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', display: 'block' }}>Year</label>
          <select style={{ width: '100%', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px' }}
            value={year} onChange={e => setYear(e.target.value)}>
            {CA_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
  <label style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px', display: 'block' }}>Language</label>
  <div style={{ display: 'flex', gap: '8px' }}>
    {['english', 'hindi'].map(l => (
      <button key={l}
        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid', borderColor: language === l ? 'var(--accent)' : 'var(--border)', background: language === l ? 'rgba(249,115,22,.1)' : 'var(--surface2)', color: language === l ? 'var(--accent)' : 'var(--muted)', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        onClick={() => setLanguage(l)}>
        {l === 'english' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
      </button>
    ))}
  </div>
</div>
      </div>

      {/* Cache status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Cache Status</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: countColor }}>
            {checking ? 'Checking...' : countLabel}
          </div>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={checkBank} disabled={checking}>
          🔄 Refresh
        </button>
      </div>

      {/* Generate button */}
      <button
        className="btn btn-primary"
        style={{ padding: '12px 28px', fontSize: '14px', opacity: loading ? 0.7 : 1 }}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading
          ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div className="spinner" style={{ width: '16px', height: '16px' }} />Generating...</span>
          : `⚡ Generate & Cache`
        }
      </button>

      {status && (
        <div style={{
          marginTop: '14px', padding: '10px 14px',
          background: status.startsWith('✅') ? 'rgba(34,197,94,.08)' : status.startsWith('❌') ? 'rgba(239,68,68,.08)' : 'var(--surface2)',
          border: `1px solid ${status.startsWith('✅') ? 'var(--green)' : status.startsWith('❌') ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: '8px', fontSize: '13px', color: 'var(--text)',
        }}>
          {status}
        </div>
      )}

      {/* Tip */}
      <div style={{ marginTop: '24px', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted2)', marginBottom: '6px' }}>💡 Pro Tip — Bulk Pre-fill</div>
        <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6' }}>
          Pre-fill top 5 exams × top 3 topics × current year for best results. That covers 80% of student traffic.
          Run this once a month to keep CA fresh.
        </div>
      </div>

    </div>
  )
}