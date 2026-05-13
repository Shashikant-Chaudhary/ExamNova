// ─────────────────────────────────────────────
// reportService.js
// Handles question reports from students
// ─────────────────────────────────────────────

import {
  collection, doc, addDoc, updateDoc,
  getDocs, query, orderBy, where, getDoc,
} from 'firebase/firestore'
import { db }            from './firebase'
import { getActiveUser } from './authService'

// ── SUBMIT REPORT ──────────────────────────────
export async function submitReport({
  question, options, correct, explanation,
  exam, topic, level, language, bankKey,
  reason, comment,
}) {
  const user = getActiveUser()
  if (!user) return

  await addDoc(collection(db, 'reports'), {
    question,
    options:     options  || [],
    correct:     correct  ?? 0,
    explanation: explanation || '',
    exam:        exam     || '',
    topic:       topic    || '',
    level:       level    || 'same',
    language:    language || 'english',
    bankKey:     bankKey  || '',
    reason,
    comment:     comment  || '',
    userId:      user.id  || '',
    userName:    user.name || user.displayName || 'User',
    status:      'open',
    adminNote:   '',
    createdAt:   new Date().toISOString(),
  })
}

// ── GET ALL REPORTS (admin) ────────────────────
export async function getAllReports(status = null) {
  try {
    let q
    if (status) {
      q = query(
        collection(db, 'reports'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      )
    } else {
      q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
    }
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('getAllReports error:', e)
    return []
  }
}

// ── UPDATE QUESTION IN BANK ────────────────────
export async function updateQuestionInBank({
  bankKey, originalQuestion, updatedQuestion,
}) {
  try {
    const ref  = doc(db, 'questionBank', bankKey)
    const snap = await getDoc(ref)
    if (!snap.exists()) return false

    const questions = snap.data().questions || []
    const index     = questions.findIndex(
      q => q.question.substring(0, 50) === originalQuestion.substring(0, 50)
    )

    if (index === -1) return false

    questions[index] = { ...questions[index], ...updatedQuestion }
    await updateDoc(ref, { questions, updatedAt: new Date().toISOString() })
    return true
  } catch (e) {
    console.error('updateQuestionInBank error:', e)
    return false
  }
}

// ── MARK REPORT STATUS ─────────────────────────
export async function updateReportStatus(reportId, status, adminNote = '') {
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      status,
      adminNote,
      resolvedAt: new Date().toISOString(),
    })
  } catch (e) {
    console.error('updateReportStatus error:', e)
  }
}

// ── GET OPEN REPORTS COUNT ─────────────────────
export async function getOpenReportsCount() {
  try {
    const q    = query(collection(db, 'reports'), where('status', '==', 'open'))
    const snap = await getDocs(q)
    return snap.size
  } catch (e) {
    return 0
  }
}