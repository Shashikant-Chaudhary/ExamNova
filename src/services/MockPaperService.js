// ─────────────────────────────────────────────
// mockPaperService.js
// Shared mock papers — generated once, used by all students
// Language-aware: separate papers for english and hindi
// SSC_GD__same__1__english / SSC_GD__same__1__hindi
// ─────────────────────────────────────────────

import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs,
} from 'firebase/firestore'
import { db } from './firebase'
import MOCK_CONFIG from '../data/mockConfig'

// ── GENERATE PAPER ID (includes language) ─────
function paperId(exam, level, mockNumber, language = 'english') {
  return `${exam}__${level}__${mockNumber}__${language}`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
}

// ── BANK KEY (matches questionBankService exactly) ─
function bankKey(exam, topic, level, language = 'english') {
  return `${exam}__${topic}__${level}__${language}`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
}

// ── GET ALL PAPERS FOR EXAM + LEVEL + LANGUAGE ─
export async function getAvailableMockPapers(exam, level, language = 'english') {
  try {
    const snap = await getDocs(collection(db, 'mockPapers'))
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p =>
        p.exam === exam &&
        p.level === level &&
        (p.language || 'english') === language &&
        !p.isRandomMix
      )
      .sort((a, b) => (a.mockNumber || 0) - (b.mockNumber || 0))
  } catch (e) {
    console.error('getAvailableMockPapers error:', e)
    return []
  }
}

// ── GET ONE PAPER BY ID ───────────────────────
export async function getMockPaperById(id) {
  try {
    const snap = await getDoc(doc(db, 'mockPapers', id))
    if (snap.exists()) return { id: snap.id, ...snap.data() }
    return null
  } catch (e) {
    console.error('getMockPaperById error:', e)
    return null
  }
}

// ── INCREMENT ATTEMPT COUNT ───────────────────
export async function incrementAttemptCount(id) {
  try {
    const ref  = doc(db, 'mockPapers', id)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      await updateDoc(ref, { attemptCount: (snap.data().attemptCount || 0) + 1 })
    }
  } catch (e) { /* silent */ }
}

// ── CACHE CA QUESTIONS IN PAPER ───────────────
export async function cacheCASectionInPaper(pId, sectionIndex, questions) {
  try {
    const ref  = doc(db, 'mockPapers', pId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const sections = snap.data().sections || []
    if (sections[sectionIndex]) {
      sections[sectionIndex].questions = questions
      await updateDoc(ref, { sections })
    }
  } catch (e) {
    console.error('cacheCASectionInPaper error:', e)
  }
}

// ── CHECK AND AUTO-GENERATE NEXT MOCK PAPER ──
export async function checkAndGenerateMockPaper(exam, level, language = 'english') {
  try {
    const config = MOCK_CONFIG[exam]
    if (!config) return null

    const existing   = await getAvailableMockPapers(exam, level, language)
    const nextNumber = existing.length + 1

    const questionsUsed = {}
    for (const paper of existing) {
      for (const section of (paper.sections || [])) {
        if (section.type === 'normal' && section.questions?.length > 0) {
          questionsUsed[section.topic] = (questionsUsed[section.topic] || 0) + section.questions.length
        }
      }
    }

    const normalSections = config.sections.filter(
      s => s.type === 'normal' && !s.optional && s.questions > 0
    )

    for (const section of normalSections) {
      const key       = bankKey(exam, section.topic, level, language)
      const snap      = await getDoc(doc(db, 'questionBank', key))
      const total     = snap.exists() ? (snap.data().questions || []).length : 0
      const used      = questionsUsed[section.topic] || 0
      const available = total - used

      if (available < section.questions) {
        console.log(`Mock check [${language}]: ${section.topic} needs ${section.questions}, only ${available} available`)
        return null
      }
    }

    console.log(`✅ Generating Mock Paper #${nextNumber} for ${exam} ${level} [${language}]`)
    return await _generatePaper(exam, level, nextNumber, questionsUsed, config, language)

  } catch (e) {
    console.error('checkAndGenerateMockPaper error:', e)
    return null
  }
}

// ── INTERNAL: BUILD AND SAVE A PAPER ─────────
async function _generatePaper(exam, level, mockNumber, questionsUsed, config, language = 'english') {
  const id = paperId(exam, level, mockNumber, language)

  const existing = await getDoc(doc(db, 'mockPapers', id))
  if (existing.exists()) {
    console.log(`Paper ${id} already exists — skipping`)
    return null
  }

  const paperSections = []

  for (const section of config.sections) {
    if (section.type === 'current_affairs') {
      paperSections.push({
        name: section.name, topic: section.topic,
        type: 'current_affairs', optional: section.optional || null,
        questions: [], questionCount: section.questions,
      })
      continue
    }
    if (section.questions === 0) {
      paperSections.push({
        name: section.name, topic: section.topic,
        type: 'normal', optional: section.optional || null,
        questions: [], questionCount: 0,
      })
      continue
    }

    const key    = bankKey(exam, section.topic, level, language)
    const snap   = await getDoc(doc(db, 'questionBank', key))
    const all    = snap.exists() ? (snap.data().questions || []) : []
    const used   = questionsUsed[section.topic] || 0
    const sliced = all.slice(used, used + section.questions)

    paperSections.push({
      name: section.name, topic: section.topic,
      type: 'normal', optional: section.optional || null,
      questions: sliced, questionCount: section.questions,
    })
  }

  const paper = {
    exam, level, mockNumber, language,
    sections:       paperSections,
    totalQuestions: config.totalQuestions,
    duration:       config.duration,
    marking:        config.marking,
    attemptCount:   0,
    createdAt:      new Date().toISOString(),
  }

  await setDoc(doc(db, 'mockPapers', id), paper)
  console.log(`✅ Mock paper saved: ${id}`)
  return { id, ...paper }
}

// ── GENERATE RANDOM MIX PAPER ─────────────────
export async function generateRandomMixPaper(exam, level, language = 'english') {
  try {
    const config = MOCK_CONFIG[exam]
    if (!config) return null

    const existing = await getAvailableMockPapers(exam, level, language)
    if (existing.length === 0) return null

    const mixId   = paperId(exam, level, 'mix', language)
    const mixSnap = await getDoc(doc(db, 'mockPapers', mixId))

    const paperSections = []

    for (const section of config.sections) {
      if (section.type === 'current_affairs') {
        paperSections.push({
          name: section.name, topic: section.topic,
          type: 'current_affairs', optional: section.optional || null,
          questions: [], questionCount: section.questions,
        })
        continue
      }
      if (section.questions === 0) {
        paperSections.push({
          name: section.name, topic: section.topic,
          type: 'normal', optional: section.optional || null,
          questions: [], questionCount: 0,
        })
        continue
      }

      const key      = bankKey(exam, section.topic, level, language)
      const snap     = await getDoc(doc(db, 'questionBank', key))
      const all      = snap.exists() ? (snap.data().questions || []) : []
      if (all.length < section.questions) return null

      const shuffled = [...all].sort(() => Math.random() - 0.5)
      paperSections.push({
        name: section.name, topic: section.topic,
        type: 'normal', optional: section.optional || null,
        questions: shuffled.slice(0, section.questions),
        questionCount: section.questions,
      })
    }

    const paper = {
      exam, level, language,
      mockNumber:     'mix',
      isRandomMix:    true,
      sections:       paperSections,
      totalQuestions: config.totalQuestions,
      duration:       config.duration,
      marking:        config.marking,
      attemptCount:   mixSnap.exists() ? (mixSnap.data().attemptCount || 0) : 0,
      createdAt:      mixSnap.exists() ? mixSnap.data().createdAt : new Date().toISOString(),
      refreshedAt:    new Date().toISOString(),
    }

    await setDoc(doc(db, 'mockPapers', mixId), paper)
    return { id: mixId, ...paper }

  } catch (e) {
    console.error('generateRandomMixPaper error:', e)
    return null
  }
}