// ─────────────────────────────────────────────
// TopicsScreen.jsx
// Uses selectedExam instead of user.exam
// So user can switch exams freely
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'
import EXAMS        from '../data/exams'
import TRANSLATIONS from '../data/translations'
import { getTopicCompletionMap } from '../services/storageService'

// Exams that have Hindi/English optional subject
const HINDI_OPTIONAL_EXAMS = [
  'SSC GD', 'SSC MTS', 'SSC CHSL',
  'RRB NTPC', 'RRB Group D', 'RRB ALP', 'State PSC'
]

export default function TopicsScreen({ user, navigate, startTest, onLogout, selectedExam, onSelectExam, language, onLanguageChange }) {
  const [openTopic, setOpenTopic] = useState(null)
const [level,     setLevel]     = useState('same')
const [localExam,      setLocalExam]      = useState(selectedExam)
const [showExamPicker, setShowExamPicker] = useState(!selectedExam)
const [langModal,     setLangModal]     = useState(null)
const [modalLang,     setModalLang]     = useState('english')

  // ── Badge / completion state ──────────────────
  const [completionMap, setCompletionMap] = useState({})
  // completionMap: { "Quantitative Aptitude": ["Number System", "Percentage", ...] }

  const activeExam = localExam || selectedExam

  // Load completion map whenever exam changes
  useEffect(() => {
    if (!activeExam) return
    getTopicCompletionMap(activeExam).then(map => setCompletionMap(map))
  }, [activeExam])

const getExamLanguage = () =>
    localStorage.getItem(`examai_lang_${activeExam?.replace(/\s/g, '_')}`) || language || 'english'

const saveExamLanguage = (lang) => {
    localStorage.setItem(`examai_lang_${activeExam?.replace(/\s/g, '_')}`, lang)
    onLanguageChange && onLanguageChange(lang)
  }

  const handleExamSelect = (exam) => {
    setLocalExam(exam)
    onSelectExam && onSelectExam(exam, false)
    setShowExamPicker(false)
  }
  // use selectedExam instead of user.exam
const examName = activeExam
const examData = EXAMS[examName]
  
  // ── Completion helpers ────────────────────────
  // Returns { done: number, total: number, isComplete: boolean, completedSet: Set }
  const getTopicProgress = (topic) => {
    const completedList = completionMap[topic.name] || []
    const completedSet  = new Set(completedList)
    const nonOptional   = topic.subtopics // all subtopics count
    const done          = nonOptional.filter(s => completedSet.has(s)).length
    const total         = nonOptional.length
    const isComplete    = total > 0 && done === total
    return { done, total, isComplete, completedSet }
  }


const toggleTopic = (topicId) => {
    setOpenTopic(openTopic === topicId ? null : topicId)
  }

  // Auto-detect language from topic — hindi topic=hindi, english topic=english
  const getTopicAutoLang = (topicName) => {
    const t = (topicName || '').toLowerCase()
    if (t === 'hindi') return 'hindi'
    if (t.includes('english')) return 'english'
    return null  // needs user to choose
  }

  const handleStartTest = (topic, subtopic = null) => {
    // Hindi/English SUBJECTS: auto-detect language from topic name
    // All OTHER topics (Maths, Reasoning, GK etc.): always use English bank
    // because Hindi banks for general topics may not exist yet
    const autoLang = getTopicAutoLang(topic.name)
    const lang = autoLang || 'english'
    confirmStartTest(topic, subtopic, lang)
  }

  const confirmStartTest = (topic, subtopic, selectedLang) => {
    saveExamLanguage(selectedLang)
    startTest(
      {
        name:      topic.name,
        id:        topic.id,
        subtopics: subtopic ? [subtopic] : topic.subtopics,
        language:  selectedLang,
        exam:      activeExam,
      },
      level
    )
    setLangModal(null)
  }
  // ── Translate text based on language ──
  // English subject topics should never be translated
  const ENGLISH_TOPICS = [
    'General English',
    'English Language',
    'English',
  ]

  const t = (text) => {
    if (language !== 'hindi') return text
    // if current topic is English subject — never translate subtopics
    if (examData?.topics?.find(tp =>
      ENGLISH_TOPICS.includes(tp.name) &&
      tp.subtopics?.includes(text)
    )) return text
    return TRANSLATIONS.topics[text]
      || TRANSLATIONS.subtopics[text]
      || text
  }

  return (
    
      <div className="page">

        {/* ── HEADER ── */}
        {/* ── HEADER ── */}
        <div style={styles.header}>
          <div style={{ width: '100%' }}>

            {/* Exam selector */}
            <div style={styles.examSelectorBox}>
              <div style={styles.examSelectorHeader}>
                <div>
                  <div style={styles.examSelectorLabel}>Exam</div>
                  {activeExam ? (
                    <div style={styles.examSelectorActive}>{activeExam}</div>
                  ) : (
                    <div style={styles.examSelectorEmpty}>Select exam to practice</div>
                  )}
                </div>
                <button
                  className="btn btn-ghost"
                  style={{ fontSize: '12px' }}
                  onClick={() => setShowExamPicker(p => !p)}
                >
                  {showExamPicker ? '▲ Hide' : '▼ Change Exam'}
                </button>
              </div>

              {showExamPicker && (
                <div style={styles.examPickerGrid}>
                  {[
                    { group: '🚂 Railway',  exams: ['RRB NTPC', 'RRB Group D', 'RRB ALP'] },
                    { group: '📋 SSC',      exams: ['SSC CGL', 'SSC CHSL', 'SSC MTS', 'SSC GD'] },
                    { group: '🏦 Banking',  exams: ['IBPS PO', 'IBPS Clerk', 'SBI PO', 'SBI Clerk'] },
                    { group: '🎯 UPSC',     exams: ['UPSC Prelims', 'UPSC CDS'] },
                    { group: '🏛️ State',    exams: ['State PSC'] },
                  ].map(group => (
                    <div key={group.group} style={{ marginBottom: '12px' }}>
                      <div style={styles.examGroupLabel}>{group.group}</div>
                      <div style={styles.examGroupBtns}>
                        {group.exams.map(exam => (
                          <button
                            key={exam}
                            style={{
                              ...styles.examPickerBtn,
                              borderColor: activeExam === exam ? 'var(--accent)' : 'var(--border)',
                              background:  activeExam === exam ? 'rgba(249,115,22,.1)' : 'var(--surface)',
                              color:       activeExam === exam ? 'var(--accent)' : 'var(--muted2)',
                            }}
                            onClick={() => handleExamSelect(exam)}
                          >
                            {exam}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Page title */}
            {activeExam && examData && (
              <>
                <h1 style={styles.pageTitle}>Practice</h1>
                <p style={styles.pageSub}>
                  {examData.fullName} · {examData.totalQuestions} Questions ·{' '}
                  {examData.duration} Minutes
                </p>
              </>
            )}
          </div>

          {examData && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>

            {/* Difficulty Block */}
            <div style={styles.levelBox}>
              <p style={styles.levelLabel}>Difficulty</p>
              <div style={styles.levelRow}>
                <button
                  style={{
                    ...styles.levelBtn,
                    ...(level === 'same' ? styles.levelBtnActiveSame : {})
                  }}
                  onClick={() => setLevel('same')}
                >
                  Same Level
                </button>
                <button
                  style={{
                    ...styles.levelBtn,
                    ...(level === 'hard' ? styles.levelBtnActiveHard : {})
                  }}
                  onClick={() => setLevel('hard')}
                >
                  Hard Level
                </button>
              </div>
              <p style={styles.levelHint}>
                {level === 'same'
                  ? 'Questions matching current exam difficulty'
                  : 'Harder questions — deeper knowledge required'}
              </p>
            </div>
          </div>
          )}
        </div>

        {/* ── TOPIC LIST ── */}
        {examData && (
        <div style={styles.topicList}>

          {/* Optional subject notice */}
          {HINDI_OPTIONAL_EXAMS.includes(activeExam) && (
            <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>ℹ️</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '2px' }}>Optional Subject</div>
                <div style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: '1.6' }}>
                  Hindi and English are optional — prepare only <strong>one</strong>. Most students choose <strong style={{ color: 'var(--red)' }}>Hindi</strong>.
                </div>
              </div>
            </div>
          )}

          {examData.topics.map((topic, index) => {
            const { done, total, isComplete, completedSet } = getTopicProgress(topic)
            const hasAnyProgress = done > 0

            return (
            <div key={topic.id} style={{
              ...styles.topicCard,
              border: isComplete
                ? '1.5px solid rgba(34,197,94,.5)'
                : topic.optional
                  ? (topic.id === 'hindi' ? '1px solid rgba(239,68,68,.25)' : '1px solid rgba(34,197,94,.25)')
                  : '1px solid var(--border)',
              background: isComplete ? 'rgba(34,197,94,.03)' : 'var(--surface)',
            }}>

              {/* Topic header */}
              <div style={styles.topicHeader} onClick={() => toggleTopic(topic.id)}>
                <div style={styles.topicLeft}>
                  <div style={{
                    ...styles.topicNum,
                    background: isComplete
                      ? 'rgba(34,197,94,.15)'
                      : topic.optional
                        ? (topic.id === 'hindi' ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)')
                        : 'var(--surface2)',
                    border: isComplete
                      ? '1px solid rgba(34,197,94,.5)'
                      : topic.optional
                        ? (topic.id === 'hindi' ? '1px solid rgba(239,68,68,.3)' : '1px solid rgba(34,197,94,.3)')
                        : '1px solid var(--border2)',
                    color: isComplete
                      ? 'var(--green)'
                      : topic.optional
                        ? (topic.id === 'hindi' ? 'var(--red)' : 'var(--green)')
                        : 'var(--accent)',
                    fontSize: isComplete ? '18px' : '14px',
                  }}>
                    {isComplete ? '🏆' : topic.optional ? (topic.id === 'hindi' ? 'अ' : 'E') : index + 1}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={styles.topicName}>{t(topic.name)}</div>
                      {topic.optional && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700', background: topic.id === 'hindi' ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)', color: topic.id === 'hindi' ? 'var(--red)' : 'var(--green)', border: `1px solid ${topic.id === 'hindi' ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)'}` }}>
                          {topic.id === 'hindi' ? '★ OPTIONAL — हिंदी' : 'OPTIONAL — English'}
                        </span>
                      )}
                      {/* Badge when topic fully completed */}
                      {isComplete && (
                        <span style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '10px', fontWeight: '800', background: 'rgba(34,197,94,.12)', color: 'var(--green)', border: '1px solid rgba(34,197,94,.35)', letterSpacing: '0.3px' }}>
                          ✓ COMPLETED
                        </span>
                      )}
                    </div>
                    <div style={styles.topicMeta}>
                      {topic.subtopics.length} {language === 'hindi' ? 'उपविषय' : 'subtopics'} ·{' '}
                      <span className={`tag ${topic.tag}`}>{topic.weightage} weightage</span>
                      {/* Inline progress text */}
                      {hasAnyProgress && !isComplete && (
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                          · {done}/{total} done
                        </span>
                      )}
                    </div>

                    {/* Subtopic progress bar — shown when there's any progress */}
                    {hasAnyProgress && (
                      <div style={{ marginTop: 6, width: '100%', maxWidth: 200 }}>
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.round((done / total) * 100)}%`,
                            background: isComplete ? 'var(--green)' : 'var(--accent)',
                            borderRadius: 2,
                            transition: 'width .6s ease',
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.topicRight}>
                  <button
                    style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', background: topic.optional && topic.id === 'hindi' ? 'var(--red)' : 'var(--accent)', color: 'white' }}
                    onClick={(e) => { e.stopPropagation(); handleStartTest(topic) }}
                  >
                    Full Topic Test
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: '13px', padding: '8px 12px' }} onClick={(e) => { e.stopPropagation(); toggleTopic(topic.id) }}>
                    {openTopic === topic.id ? '▲ Hide' : '▼ Subtopics'}
                  </button>
                </div>
              </div>

              {/* Subtopics */}
              {openTopic === topic.id && (
                <div style={styles.subtopicGrid}>
                  {topic.subtopics.map((sub) => {
                    const isDone = completedSet.has(sub)
                    return (
                      <div key={sub}
                        style={{
                          ...styles.subCard,
                          background: isDone ? 'rgba(34,197,94,.06)' : 'var(--surface2)',
                          border: isDone ? '1px solid rgba(34,197,94,.3)' : '1px solid var(--border)',
                        }}
                        onClick={() => handleStartTest(topic, sub)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                          {/* Checkmark circle */}
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                            background: isDone ? 'var(--green)' : 'var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isDone && <span style={{ fontSize: 9, color: 'white', fontWeight: 900 }}>✓</span>}
                          </div>
                          <div style={{ ...styles.subName, color: isDone ? 'var(--text)' : 'var(--text)' }}>{t(sub)}</div>
                        </div>
                        <div style={{ ...styles.subAction, color: isDone ? 'var(--green)' : 'var(--accent)' }}>
                          {isDone ? 'Redo →' : 'Practice →'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            )
          })}
        </div>
        )}
  {/* ── LANGUAGE CONFIRMATION MODAL ── */}
        {langModal && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
            onClick={() => setLangModal(null)}
          >
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                padding: '28px',
                width: '100%',
                maxWidth: '380px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌐</div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                  Select Language
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
                  {langModal.subtopic || `${langModal.topic?.name} — Full Topic`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {[
                  { id: 'english', label: 'English', flag: '🇬🇧', sub: 'English medium' },
                  { id: 'hindi',   label: 'हिंदी',   flag: '🇮🇳', sub: 'हिंदी माध्यम'  },
                ].map(l => (
                  <button
                    key={l.id}
                    style={{
                      flex: 1,
                      padding: '16px 12px',
                      borderRadius: '14px',
                      border: '2px solid',
                      borderColor: modalLang === l.id ? 'var(--accent)' : 'var(--border)',
                      background: modalLang === l.id ? 'rgba(249,115,22,.08)' : 'var(--surface2)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => setModalLang(l.id)}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>{l.flag}</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: modalLang === l.id ? 'var(--accent)' : 'var(--text)', marginBottom: '3px' }}>
                      {l.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{l.sub}</div>
                    {modalLang === l.id && (
                      <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px', fontWeight: '600' }}>✓ Selected</div>
                    )}
                  </button>
                ))}
              </div>

              <button
                style={{
                  width: '100%',
                  padding: '13px',
                  background: 'linear-gradient(135deg, var(--accent), #f97316)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                  marginBottom: '10px',
                }}
                onClick={() => confirmStartTest(langModal.topic, langModal.subtopic, modalLang)}
              >
                Start Test →
              </button>

              <button
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
                onClick={() => setLangModal(null)}
              >
                Cancel
              </button>

            </div>
          </div>
        )}


      </div>
    )
  }

// ── STYLES ────────────────────────────────────
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '24px',
    marginBottom: '32px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '6px',
  },
  pageSub: {
    fontSize: '14px',
    color: 'var(--muted2)',
  },
  levelBox: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px 20px',
    minWidth: '200px',
  },
  levelLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  levelRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  levelBtn: {
    flex: 1,
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid var(--border2)',
    background: 'var(--surface2)',
    color: 'var(--muted2)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.15s',
  },
  levelBtnActiveSame: {
    background: 'rgba(59,130,246,.12)',
    border: '1px solid var(--blue)',
    color: 'var(--blue)',
  },
  levelBtnActiveHard: {
    background: 'rgba(249,115,22,.12)',
    border: '1px solid var(--accent)',
    color: 'var(--accent)',
  },
  levelHint: {
    fontSize: '11px',
    color: 'var(--muted)',
    lineHeight: '1.4',
  },
  topicList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  topicCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  topicHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    cursor: 'pointer',
    gap: '16px',
    flexWrap: 'wrap',
  },
  topicLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  topicNum: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'var(--surface2)',
    border: '1px solid var(--border2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--accent)',
    flexShrink: 0,
  },
  topicName: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  topicMeta: {
    fontSize: '12px',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  topicRight: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexShrink: 0,
  },
  subtopicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '8px',
    padding: '16px 24px 20px',
    borderTop: '1px solid var(--border)',
  },
  subCard: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  subName: {
    fontSize: '13px',
    color: 'var(--text)',
    lineHeight: '1.4',
  },
  subAction: {
    fontSize: '12px',
    color: 'var(--accent)',
    flexShrink: 0,
    fontWeight: '500',
  },
  emptyBox: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '16px',
    padding: '80px 40px',
    textAlign: 'center',
  },
  examSelectorBox: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    width: '100%',
  },
  examSelectorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examSelectorLabel: {
    fontSize: '11px',
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  examSelectorActive: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  examSelectorEmpty: {
    fontSize: '13px',
    color: 'var(--muted)',
  },
  examPickerGrid: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid var(--border)',
  },
  examGroupLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--muted2)',
    marginBottom: '8px',
  },
  examGroupBtns: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '4px',
  },
  examPickerBtn: {
    padding: '5px 12px',
    borderRadius: '6px',
    border: '1px solid',
    background: 'var(--surface)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.15s',
  },
}