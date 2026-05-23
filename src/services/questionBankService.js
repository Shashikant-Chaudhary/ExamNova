// ─────────────────────────────────────────────
// questionBankService.js
// Manages question bank in Firebase
// Students get questions from bank
// AI only called when bank runs low
// Auto-triggers mock paper generation when bank grows
// ─────────────────────────────────────────────

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db }          from './firebase'
import { getActiveUser } from './authService'

// ── MIN questions before refill triggers ──
const MIN_BANK_SIZE    = 50
// ── How many to generate when refilling ──
const REFILL_COUNT     = 12    // 3 batches of 4 = 12 questions, well within TPM

// ── WAIT HELPER ───────────────────────────────
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ── BACKGROUND FILL LOCK ───────────────────────
const activeSilentFills = new Set()


// ── LANGUAGE-SPECIFIC TOPICS ──────────────────
// These subjects always have the same questions regardless of
// the language filter (english/hindi). English Language questions
// are always in English, Hindi questions are always in Hindi.
// So both same+eng and same+hindi share ONE pool for these topics.
// Topic names match exactly what is defined in exams.js
const LANGUAGE_FIXED_TOPICS = [
  // English language subjects (all exams)
  'English Language',                    // SSC CGL, SSC CHSL, SSC GD, IBPS PO, IBPS Clerk, RBI Assistant, LIC AAO
  'English Language & Comprehension',    // SSC Stenographer
  'General English',                     // RRB NTPC, RRB Group D, RRB ALP, SSC MTS, SBI Clerk
  'English',                             // RBI Grade B, UPSC CDS, NDA, Delhi Police Constable
  'Verbal Ability in English',           // AFCAT
  // Hindi language subjects (all exams)
  'Hindi',                               // RRB NTPC, RRB Group D, RRB ALP, SSC MTS, SSC GD, State PSC
]

function isLanguageFixedTopic(topic = '') {
  return LANGUAGE_FIXED_TOPICS.includes(topic.toLowerCase().trim())
}


// ── GET BANK KEY ───────────────────────────────────────────────────────────
function bankKey(exam, topic, level, language = 'english', year = '') {
  // For language-specific subjects (English Language / Hindi),
  // ignore the language filter — both hindi and english combos
  // share the same question pool for that level.
  const langPart = isLanguageFixedTopic(topic) ? 'shared' : language
  const yearPart = year ? `__${year}` : ''
  return `${exam}__${topic}__${level}__${langPart}${yearPart}`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
}


// ── GET USER SEEN KEY ──────────────────────────
function seenKey(exam, topic, level, language = 'english', year = '') {
  const langPart = isLanguageFixedTopic(topic) ? 'shared' : language
  const yearPart = year ? `__${year}` : ''
  return `${exam}__${topic}__${level}__${langPart}${yearPart}`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
}


// ── LOAD BANK FROM FIREBASE ────────────────────
async function loadBank(exam, topic, level, language = 'english', year = '') {
  try {
    const key  = bankKey(exam, topic, level, language, year)
    const ref  = doc(db, 'questionBank', key)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return snap.data().questions || []
    }
    return []
  } catch (e) {
    console.error('Load bank error:', e)
    return []
  }
}


// ── SAVE QUESTIONS TO BANK ─────────────────────
async function saveToBank(exam, topic, level, newQuestions, language = 'english', year = '') {
  try {
    const key = bankKey(exam, topic, level, language, year)
    const ref = doc(db, 'questionBank', key)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      const existing = snap.data().questions || []
      const combined = [...existing, ...newQuestions]
      await updateDoc(ref, {
        questions: combined,
        count:     combined.length,
        updatedAt: new Date().toISOString(),
      })
    } else {
      await setDoc(ref, {
        exam,
        topic,
        level,
        language,
        year,
        questions: newQuestions,
        count:     newQuestions.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    console.log(`✅ Bank saved: ${newQuestions.length} questions for ${exam} ${topic} ${level}`)

    // ── AUTO-TRIGGER MOCK PAPER CHECK ──
    // For english questions OR language-fixed topics (English Language / Hindi)
    // Runs silently in background — never blocks the student
    if ((language === 'english' || isLanguageFixedTopic(topic)) && !year) {
      import('./MockPaperService.js').then(({ checkAndGenerateMockPaper }) => {
        checkAndGenerateMockPaper(exam, level).catch(() => {})
      }).catch(() => {})
    }

  } catch (e) {
    console.error('❌ Save bank FAILED:', e.message, e.code)
  }
}


// ── GET SEEN QUESTIONS FOR USER ────────────────
async function getSeenQuestions(exam, topic, level, language = 'english', year = '') {
  try {
    const user = getActiveUser()
    if (!user) return []
    const key  = seenKey(exam, topic, level, language, year)
    const ref  = doc(db, 'seenQuestions', user.id, 'topics', key)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      return snap.data().seen || []
    }
    return []
  } catch (e) {
    return []
  }
}


// ── MARK QUESTIONS AS SEEN ─────────────────────
async function markAsSeen(exam, topic, level, questions, language = 'english', year = '') {
  try {
    const user = getActiveUser()
    if (!user) return
    const key  = seenKey(exam, topic, level, language, year)
    const ref  = doc(db, 'seenQuestions', user.id, 'topics', key)
    const snap = await getDoc(ref)

    const newSeen = questions.map(q => q.question.substring(0, 50))

    if (snap.exists()) {
      const existing = snap.data().seen || []
      const combined = [...new Set([...existing, ...newSeen])]
      await updateDoc(ref, { seen: combined.slice(-500) })
    } else {
      await setDoc(ref, { seen: newSeen })
    }
  } catch (e) {
    console.error('Mark seen error:', e)
  }
}


// ── GET UNSEEN QUESTIONS FROM BANK ─────────────
function getUnseenQuestions(bankQuestions, seenList, count) {
  const unseen = bankQuestions.filter(q =>
    !seenList.some(s => q.question.substring(0, 50) === s)
  )
  const shuffled = unseen.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}


// ── MAIN FUNCTION — Get questions for test ─────
export async function getQuestionsForTest({
  exam,
  topic,
  subtopics,
  level,
  language  = 'english',
  year      = '',
  count     = 10,
  generateFn,
}) {
  try {
    console.log(`Getting questions for ${exam} ${topic} ${level} ${language}`)

    const bank = await loadBank(exam, topic, level, language, year)
    console.log(`Bank has ${bank.length} questions`)

    const seen = await getSeenQuestions(exam, topic, level, language, year)
    console.log(`User has seen ${seen.length} questions`)

    let questions = getUnseenQuestions(bank, seen, count)
    console.log(`Found ${questions.length} unseen questions`)

    if (questions.length < count) {
      console.log(`Need more questions — trying AI...`)

      try {
        const newQuestions = await generateFn({
          exam, topic, subtopics, level, language,
          count: REFILL_COUNT,
        })

        await saveToBank(exam, topic, level, newQuestions, language, year)

        const updatedBank = await loadBank(exam, topic, level, language, year)
        questions = getUnseenQuestions(updatedBank, seen, count)
        console.log(`After AI: ${questions.length} unseen questions`)

      } catch (aiError) {
        console.log('AI failed — using fallback recycling')

        if (questions.length >= 5) {
          const selectedTexts = questions.map(q => q.question)
          const recycled = bank
            .filter(q => !selectedTexts.includes(q.question))
            .sort(() => Math.random() - 0.5)
            .slice(0, count - questions.length)
          questions = [...questions, ...recycled]
        } else if (bank.length >= count) {
          questions = bank.sort(() => Math.random() - 0.5).slice(0, count)
        } else if (bank.length > 0) {
          questions = bank.sort(() => Math.random() - 0.5)
        } else {
          throw aiError
        }
      }
    }

    await markAsSeen(exam, topic, level, questions, language, year)
    return questions.slice(0, count)

  } catch (error) {
    console.error('Question bank error:', error)
    throw error
  }
}


// ── SILENT BACKGROUND BANK CHECK ──────────────
export async function loadBankSilently({ exam, topic, level, language = 'english' }) {
  const fillKey = `${exam}__${topic}__${level}__${language}`

  if (activeSilentFills.has(fillKey)) {
    console.log(`Background fill already running for ${fillKey} — skipping`)
    return
  }

  try {
    const bank = await loadBank(exam, topic, level, language, '')
    console.log(`Background check: ${exam} ${topic} has ${bank.length} questions`)

    const user = getActiveUser()
    let unseenCount = bank.length
    if (user) {
      const seen   = await getSeenQuestions(exam, topic, level, language, '')
      const unseen = getUnseenQuestions(bank, seen, bank.length)
      unseenCount  = unseen.length
    }

    if (unseenCount < MIN_BANK_SIZE) {
      console.log(`Background: only ${unseenCount} unseen — scheduling refill...`)

      const jitterMs = 5000 + Math.random() * 10000
      console.log(`Background fill for ${exam} ${topic} delayed ${Math.round(jitterMs / 1000)}s`)
      await wait(jitterMs)

      activeSilentFills.add(fillKey)

      const { generateForBank } = await import('./aiService.js')

      const newQuestions = await generateForBank({
        exam,
        topic,
        subtopics: [],
        level,
        language,
        count: REFILL_COUNT,
      })

      await saveToBank(exam, topic, level, newQuestions, language, '')
      console.log(`✅ Background bank filled: ${newQuestions.length} questions added`)
    }
  } catch (e) {
    console.log(`Background bank check failed silently for ${exam} ${topic}`)
  } finally {
    activeSilentFills.delete(fillKey)
  }
}


// ── GET BANK STATS (for admin/debug) ──────────
export async function getBankStats(exam, topic, level) {
  const bank = await loadBank(exam, topic, level)
  const user = getActiveUser()
  const seen = user ? await getSeenQuestions(exam, topic, level) : []

  return {
    total:   bank.length,
    seen:    seen.length,
    unseen:  bank.length - seen.length,
  }
}