// ─────────────────────────────────────────────
// feedbackService.js
// Handles feedback/support messages
// ─────────────────────────────────────────────

import {
  collection, doc, addDoc, updateDoc,
  getDocs, query, orderBy, onSnapshot,
  arrayUnion, where,
} from 'firebase/firestore'
import { db }          from './firebase'
import { getActiveUser } from './authService'

// ── SEND FEEDBACK ──────────────────────────────
export async function sendFeedback({ category, message }) {
  const user = getActiveUser()
  if (!user) return

  const ref = await addDoc(collection(db, 'feedback'), {
    userId:    user.id    || '',
    userName:  user.name  || user.displayName || 'User',
    userEmail: user.email || '',
    category,
    message,
    status:    'open',
    unread:    true,   // unread by admin
    userUnread: false, // unread by user
    createdAt: new Date().toISOString(),
    replies:   [],
  })

  return ref.id
}

// ── GET USER FEEDBACK ──────────────────────────
export async function getUserFeedback() {
  const user = getActiveUser()
  if (!user) return []

  try {
    const q    = query(
      collection(db, 'feedback'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('getUserFeedback error:', e)
    return []
  }
}

// ── GET UNREAD COUNT FOR USER ──────────────────
export async function getUserUnreadCount() {
  const user = getActiveUser()
  if (!user) return 0

  try {
    const q    = query(
      collection(db, 'feedback'),
      where('userId', '==', user.id),
      where('userUnread', '==', true)
    )
    const snap = await getDocs(q)
    return snap.size
  } catch (e) {
    return 0
  }
}

// ── MARK USER MESSAGES AS READ ─────────────────
export async function markUserFeedbackRead(feedbackId) {
  try {
    const ref = doc(db, 'feedback', feedbackId)
    await updateDoc(ref, { userUnread: false })
  } catch (e) {
    console.error('markUserFeedbackRead error:', e)
  }
}

// ── GET ALL FEEDBACK (admin) ───────────────────
export async function getAllFeedback() {
  try {
    const q    = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('getAllFeedback error:', e)
    return []
  }
}

// ── ADMIN REPLY ────────────────────────────────
export async function adminReply(feedbackId, message) {
  try {
    const ref = doc(db, 'feedback', feedbackId)
    await updateDoc(ref, {
      replies: arrayUnion({
        from:      'admin',
        message,
        createdAt: new Date().toISOString(),
      }),
      status:    'replied',
      userUnread: true,  // notify user
      unread:    false,  // admin has seen it
    })
  } catch (e) {
    console.error('adminReply error:', e)
  }
}

// ── MARK AS RESOLVED ───────────────────────────
export async function markResolved(feedbackId) {
  try {
    const ref = doc(db, 'feedback', feedbackId)
    await updateDoc(ref, { status: 'resolved' })
  } catch (e) {
    console.error('markResolved error:', e)
  }
}

// ── MARK ADMIN READ ────────────────────────────
export async function markAdminRead(feedbackId) {
  try {
    const ref = doc(db, 'feedback', feedbackId)
    await updateDoc(ref, { unread: false })
  } catch (e) {
    console.error('markAdminRead error:', e)
  }
}

// ── GET ADMIN UNREAD COUNT ─────────────────────
export async function getAdminUnreadCount() {
  try {
    const q    = query(
      collection(db, 'feedback'),
      where('unread', '==', true)
    )
    const snap = await getDocs(q)
    return snap.size
  } catch (e) {
    return 0
  }
}