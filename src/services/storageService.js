// ─────────────────────────────────────────────
// storageService.js
// All data saved to Firebase Firestore
// Each user has completely private data
// Mock results now store only answers + mockPaperId
// (questions loaded from shared mockPapers collection)
// ─────────────────────────────────────────────

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
} from 'firebase/firestore'
import { db }          from './firebase'
import { getActiveUser } from './authService'



// ── GET CURRENT USER ID ────────────────────────
function uid() {
  const user = getActiveUser()
  return user ? user.id : null
}


// ── SAVE ONE TEST RESULT ───────────────────────
export async function saveTestResult(result) {
  const userId = uid()
  if (!userId) return

  const newResult = {
    exam:      result.exam,
    topic:     result.topic,
    subtopic:  result.subtopic || null,
    level:     result.level,
    score:     result.score,
    total:     result.total,
    percent:   Math.round((result.score / result.total) * 100),
    timeTaken: result.timeTaken,
    date:      new Date().toISOString(),
  }

  await addDoc(collection(db, 'history', userId, 'tests'), newResult)
  await updateStreak(userId)
  return newResult
}


// ── LOAD ALL TEST HISTORY ──────────────────────
export async function loadHistory() {
  const userId = uid()
  if (!userId) return []

  try {
    const q        = query(
      collection(db, 'history', userId, 'tests'),
      orderBy('date', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    return []
  }
}


// ── CLEAR ALL HISTORY ──────────────────────────
export async function clearHistory() {
  const userId = uid()
  if (!userId) return

  const snapshot = await getDocs(collection(db, 'history', userId, 'tests'))
  const deletes  = snapshot.docs.map(d => deleteDoc(d.ref))
  await Promise.all(deletes)
}


// ── GET SUMMARY STATS ──────────────────────────
export async function getStats() {
  const history = await loadHistory()

  if (history.length === 0) {
    return {
      totalTests:  0,
      avgScore:    0,
      bestScore:   0,
      totalTopics: 0,
      streak:      await getStreak(),
    }
  }

  const percents     = history.map(h => h.percent)
  const avgScore     = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
  const bestScore    = Math.max(...percents)
  const uniqueTopics = [...new Set(history.map(h => h.topic))].length

  return {
    totalTests:  history.length,
    avgScore:    avgScore,
    bestScore:   bestScore,
    totalTopics: uniqueTopics,
    streak:      await getStreak(),
  }
}


// ── GET WEAK TOPICS ────────────────────────────
export async function getWeakTopics() {
  const history = await loadHistory()
  if (history.length === 0) return []

  const topicMap = {}
  history.forEach(h => {
    if (!topicMap[h.topic]) topicMap[h.topic] = []
    topicMap[h.topic].push(h.percent)
  })

  const weak = []
  Object.entries(topicMap).forEach(([topic, scores]) => {
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    if (avg < 60) weak.push({ topic, avg })
  })

  return weak.sort((a, b) => a.avg - b.avg)
}


// ── GET TOPIC SCORES ───────────────────────────
export async function getTopicScores() {
  const history = await loadHistory()
  if (history.length === 0) return []

  const topicMap = {}
  history.forEach(h => {
    if (!topicMap[h.topic]) topicMap[h.topic] = []
    topicMap[h.topic].push(h.percent)
  })

  return Object.entries(topicMap).map(([topic, scores]) => ({
    topic,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }))
}


// ── STREAK TRACKING ────────────────────────────
async function updateStreak(userId) {
  const ref        = doc(db, 'streaks', userId)
  const snap       = await getDoc(ref)
  const streakData = snap.exists() ? snap.data() : { count: 0, lastDate: null }

  const today     = new Date().toDateString()
  const todayKey  = new Date().toISOString().split('T')[0] // YYYY-MM-DD for heatmap

  // Update heatmap activity — always increment today's count
  const activity = streakData.activity || {}
  activity[todayKey] = (activity[todayKey] || 0) + 1
  streakData.activity = activity

  if (streakData.lastDate === today) {
    // Same day — just update activity count
    await setDoc(ref, streakData)
    return
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (streakData.lastDate === yesterday.toDateString()) {
    streakData.count += 1
  } else {
    streakData.count = 1
  }

  streakData.lastDate = today
  await setDoc(ref, streakData)
}

export async function getStreak() {
  const userId = uid()
  if (!userId) return 0

  const snap = await getDoc(doc(db, 'streaks', userId))
  return snap.exists() ? snap.data().count : 0
}


// ── SAVE ASKED QUESTIONS ───────────────────────
export async function saveAskedQuestions(exam, topic, questions) {
  const userId = uid()
  if (!userId) return

  const key  = `${exam}_${topic}`.replace(/\s+/g, '_')
  const ref  = doc(db, 'askedQuestions', userId, 'topics', key)
  const snap = await getDoc(ref)

  const existing = snap.exists() ? snap.data().questions : []
  const combined = [...existing, ...questions.map(q => q.question).filter(Boolean)]
  const trimmed  = combined.slice(-200)

  await setDoc(ref, { questions: trimmed })
}


// ── GET ASKED QUESTIONS ────────────────────────
export async function getAskedQuestions(exam, topic) {
  const userId = uid()
  if (!userId) return []

  const key  = `${exam}_${topic}`.replace(/\s+/g, '_')
  const ref  = doc(db, 'askedQuestions', userId, 'topics', key)
  const snap = await getDoc(ref)

  return snap.exists() ? snap.data().questions : []
}


// ── CLEAR ASKED QUESTIONS ──────────────────────
export async function clearAskedQuestions() {
  const userId = uid()
  if (!userId) return

  const snapshot = await getDocs(collection(db, 'askedQuestions', userId, 'topics'))
  const deletes  = snapshot.docs.map(d => deleteDoc(d.ref))
  await Promise.all(deletes)
}


// ── SAVE MOCK RESULT ─────────────────────────
// Stores only answers + stats — questions come from shared mockPapers
// answers format: { "sectionIndex_qIndex": optionIndex }
// Storage: ~2KB per result vs ~100KB before
export async function saveMockResult({
  exam,
  level,
  category,
  mockPaperId,
  answers,
  score,
  maxScore,
  percent,
  correct,
  wrong,
  skipped,
  timeTaken,
  sections,
}) {
  try {
    const user = getActiveUser()
    if (!user) return

    const testId = `mock_${Date.now()}`
    const ref    = doc(db, 'mockHistory', user.id, 'tests', testId)

    await setDoc(ref, {
      exam,
      level,
      category,
      mockPaperId,  // reference to shared paper
      answers,      // { "sectionIndex_qIndex": optionIndex } — no question text
      score,
      maxScore,
      percent,
      correct,
      wrong,
      skipped,
      timeTaken,
      sections,     // section-wise scores only (no questions)
      date:         new Date().toISOString(),
      createdAt:    new Date().toISOString(),
    })

    // If random mix — keep only latest 2 attempts, delete oldest
if (mockPaperId?.includes('__mix')) {
  try {
    const allMix = await getDocs(
      query(
        collection(db, 'mockHistory', user.id, 'tests'),
        orderBy('createdAt', 'asc')
      )
    )
    const mixResults = allMix.docs.filter(d => d.data().mockPaperId?.includes('__mix'))
    if (mixResults.length > 2) {
      // delete oldest beyond 2
      const toDelete = mixResults.slice(0, mixResults.length - 2)
      await Promise.all(toDelete.map(d => deleteDoc(d.ref)))
    }
  } catch(e) { /* silent */ }
}

    console.log(`✅ Mock result saved: ${testId} (paper: ${mockPaperId})`)
    return testId

  } catch (e) {
    console.error('Save mock result error:', e)
  }
}


// ── GET ALL MOCK RESULTS FOR USER (lightweight) ──
// Returns result metadata + section scores — NO questions
// Call getMockResultWithQuestions() when user opens a result for review
export async function getMockHistory(exam = null) {
  try {
    const user = getActiveUser()
    if (!user) return []

    const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
    const ref  = collection(db, 'mockHistory', user.id, 'tests')
    const snap = await getDocs(query(ref, orderBy('createdAt', 'desc')))

    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }))

    if (exam) return results.filter(r => r.exam === exam)
    return results

  } catch (e) {
    console.error('Get mock history error:', e)
    return []
  }
}


// ── GET RESULT WITH QUESTIONS FOR REVIEW ────────
// Loads the shared paper and merges with saved answers
// Call this only when user opens a specific result to review
export async function getMockResultWithQuestions(result) {
  try {
    if (!result.mockPaperId) {
      // Legacy result that already has questions embedded
      return result
    }

    const paperSnap = await getDoc(doc(db, 'mockPapers', result.mockPaperId))
    if (!paperSnap.exists()) return result

    const paper = paperSnap.data()

    // Build full questions array with user answers merged in
    const fullQuestions = []
    paper.sections.forEach((section, si) => {
      const qs = section.questions || []
      qs.forEach((q, qi) => {
        const key        = `${si}_${qi}`
        const userAnswer = result.answers ? result.answers[key] : undefined
        const userAns    = userAnswer !== undefined ? userAnswer : null
        fullQuestions.push({
          ...q,
          sectionName: section.name,
          userAnswer:  userAns,
          isCorrect:   userAns === q.correct,
        })
      })
    })

    return { ...result, questions: fullQuestions }

  } catch (e) {
    console.error('getMockResultWithQuestions error:', e)
    return result
  }
}


// ── GET ALL USERS COUNT ────────────────────────
export async function getUserStats() {
  try {
    const { collection, getDocs } = await import('firebase/firestore')

    const usersSnap   = await getDocs(collection(db, 'users'))
    const totalUsers  = usersSnap.size
    const seenSnap    = await getDocs(collection(db, 'seenQuestions'))
    const activeUsers = seenSnap.size

    return { totalUsers, activeUsers }

  } catch (e) {
    console.error('getUserStats error:', e)
    return { totalUsers: 0, activeUsers: 0 }
  }
}


// ── GET LATEST VISITED USERS ───────────────────
export async function getLatestUsers() {
  try {
    const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore')

    const usersSnap = await getDocs(
      query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(10))
    )

    const users = []
    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data()

      let testCount = 0
      try {
        const seenRef  = collection(db, 'seenQuestions', userDoc.id, 'topics')
        const seenSnap = await getDocs(seenRef)
        testCount = seenSnap.size
      } catch (e) {}

      users.push({
        id:        userDoc.id,
        name:      data.name  || 'Unknown',
        email:     data.email || '',
        lastVisit: data.lastVisit || data.createdAt || '',
        testCount,
      })
    }

    return users

  } catch (e) {
    console.error('getLatestUsers error:', e)
    return []
  }
}


// ── UPDATE USER LAST VISIT ─────────────────────
export async function updateLastVisit() {
  try {
    const user = getActiveUser()
    if (!user) return

    const { updateDoc } = await import('firebase/firestore')
    const ref = doc(db, 'users', user.id)
    await updateDoc(ref, {
      lastVisit: new Date().toISOString(),
    })
  } catch (e) {
    console.error('updateLastVisit error:', e)
  }
}


// ── GET TOPIC COMPLETION MAP ───────────────────
// Returns which subtopics have been practiced at least once per exam
// Used by TopicsScreen to show badges + progress
//
// Returns: { "Quantitative Aptitude": ["Number System", "Percentage", ...], ... }
// A subtopic appears in the array when user has practiced it at least once
export async function getTopicCompletionMap(examName) {
  const history = await loadHistory()
  if (history.length === 0) return {}

  const examHistory = history.filter(h => h.exam === examName && h.subtopic)

  const map = {}
  examHistory.forEach(h => {
    if (!map[h.topic]) map[h.topic] = []
    if (!map[h.topic].includes(h.subtopic)) {
      map[h.topic].push(h.subtopic)
    }
  })

  return map // { topicName: [subtopic1, subtopic2, ...] }
}