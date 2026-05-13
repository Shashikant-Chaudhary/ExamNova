// ─────────────────────────────────────────────
// shiftService.js
// Handles shift papers data
// ─────────────────────────────────────────────

import {
  collection, doc, addDoc, updateDoc, getDoc,
  getDocs, query, orderBy, where, deleteDoc,
} from 'firebase/firestore'
import { db } from './firebase'

// ── SHIFT KEY FORMAT ───────────────────────────
// shifts/{exam}/{year}/{shiftId}

// ── SAVE SHIFT PAPER ──────────────────────────
export async function saveShiftPaper({
  exam, date, shift, year,
  totalQuestions, questions,
  source, uploadedBy,
}) {
  try {
    const ref = await addDoc(collection(db, 'shifts'), {
      exam,
      date,
      shift,
      year:           year || new Date().getFullYear(),
      totalQuestions: totalQuestions || questions.length,
      questions,
      source:         source     || 'Manual Upload',
      uploadedBy:     uploadedBy || 'Admin',
      status:         'active',
      analysis:       null,
      createdAt:      new Date().toISOString(),
      updatedAt:      new Date().toISOString(),
    })
    return ref.id
  } catch (e) {
    console.error('saveShiftPaper error:', e)
    throw e
  }
}

// ── GET ALL SHIFTS FOR EXAM ────────────────────
export async function getShiftsByExam(exam) {
  try {
    const q    = query(
      collection(db, 'shifts'),
      where('exam', '==', exam),
      orderBy('date', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('getShiftsByExam error:', e)
    return []
  }
}

// ── GET ALL SHIFTS ─────────────────────────────
export async function getAllShifts() {
  try {
    const q    = query(collection(db, 'shifts'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('getAllShifts error:', e)
    return []
  }
}

// ── GET SINGLE SHIFT ───────────────────────────
export async function getShiftById(shiftId) {
  try {
    const snap = await getDoc(doc(db, 'shifts', shiftId))
    if (snap.exists()) return { id: snap.id, ...snap.data() }
    return null
  } catch (e) {
    console.error('getShiftById error:', e)
    return null
  }
}

// ── ANALYSE SHIFT ──────────────────────────────
export async function analyseShift(shiftId) {
  try {
    const shift = await getShiftById(shiftId)
    if (!shift) return null

    const questions = shift.questions || []

    // topic breakdown
    const topicBreakdown = {}
    const subtopicBreakdown = {}
    const difficultyCount = { easy: 0, medium: 0, hard: 0 }
    const questionTypes   = { calculation: 0, conceptual: 0, factual: 0, analytical: 0 }

    questions.forEach(q => {
      // topic
      const topic = q.topic || 'Unknown'
      topicBreakdown[topic] = (topicBreakdown[topic] || 0) + 1

      // subtopic
      const subtopic = q.subtopic || 'General'
      subtopicBreakdown[subtopic] = (subtopicBreakdown[subtopic] || 0) + 1

      // difficulty
      const diff = q.difficulty || 5
      if (diff <= 3)      difficultyCount.easy++
      else if (diff <= 7) difficultyCount.medium++
      else                difficultyCount.hard++

      // question type
      const type = q.questionType || 'conceptual'
      if (questionTypes[type] !== undefined) questionTypes[type]++
    })

    // sort topics by frequency
    const sortedTopics = Object.entries(topicBreakdown)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({
        topic,
        count,
        percent: Math.round((count / questions.length) * 100),
      }))

    // avg difficulty
    const avgDifficulty = questions.length
      ? Math.round(questions.reduce((sum, q) => sum + (q.difficulty || 5), 0) / questions.length * 10) / 10
      : 5

    // key topics (top 3)
    const keyTopics = sortedTopics.slice(0, 3).map(t => t.topic)

    const analysis = {
      topicBreakdown:    topicBreakdown,
      sortedTopics,
      subtopicBreakdown,
      difficultyBreakdown: difficultyCount,
      questionTypes,
      avgDifficulty,
      keyTopics,
      totalAnalyzed:     questions.length,
      analyzedAt:        new Date().toISOString(),
    }

    // save analysis to Firebase
    await updateDoc(doc(db, 'shifts', shiftId), { analysis })

    return analysis
  } catch (e) {
    console.error('analyseShift error:', e)
    return null
  }
}

// ── DELETE SHIFT ───────────────────────────────
export async function deleteShift(shiftId) {
  try {
    await deleteDoc(doc(db, 'shifts', shiftId))
    return true
  } catch (e) {
    console.error('deleteShift error:', e)
    return false
  }
}

// ── GET SHIFT STATS ────────────────────────────
export async function getShiftStats() {
  try {
    const snap = await getDocs(collection(db, 'shifts'))
    const shifts = snap.docs.map(d => d.data())

    const examCounts = {}
    shifts.forEach(s => {
      examCounts[s.exam] = (examCounts[s.exam] || 0) + 1
    })

    return {
      total:      shifts.length,
      examCounts,
      latestDate: shifts[0]?.date || null,
    }
  } catch (e) {
    return { total: 0, examCounts: {}, latestDate: null }
  }
}