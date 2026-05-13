// ─────────────────────────────────────────────
// authService.js
// Firebase Authentication — signup, login, logout
// ─────────────────────────────────────────────

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'

import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db }            from './firebase'


// ── SIGNUP ─────────────────────────────────────
export async function signup({ name, email, password, exam }) {
  try {
    // create auth account
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const user   = result.user

    // save extra info to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      exam:      exam,
      createdAt: new Date().toISOString(),
    })

    updateSessionTime()

    return {
      success: true,
      user: {
        id:    user.uid,
        name:  name.trim(),
        email: email.toLowerCase().trim(),
        exam:  exam,
      }
    }

  } catch (error) {
    return {
      success: false,
      error: firebaseError(error.code)
    }
  }
}


// ── LOGIN ──────────────────────────────────────
export async function login({ email, password }) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const user   = result.user

    // get extra info from Firestore
    const docSnap = await getDoc(doc(db, 'users', user.uid))

    if (!docSnap.exists()) {
      return { success: false, error: 'User data not found. Please sign up again.' }
    }

    const data = docSnap.data()

    updateSessionTime()

    return {
      success: true,
      user: {
        id:    user.uid,
        name:  data.name,
        email: data.email,
        exam:  data.exam,
      }
    }

  } catch (error) {
    return {
      success: false,
      error: firebaseError(error.code)
    }
  }
}


// ── LOGOUT ─────────────────────────────────────
export async function logout() {
  clearSession()
  await signOut(auth)
}


// ── FORGOT PASSWORD ────────────────────────────
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email.toLowerCase().trim())
    return {
      success: true,
      message: 'Password reset email sent. Check your inbox!'
    }
  } catch (error) {
    return {
      success: false,
      error: firebaseError(error.code)
    }
  }
}


// ── GET ACTIVE USER FROM FIREBASE ──────────────
export function getActiveUser() {
  return auth.currentUser
    ? {
        id:    auth.currentUser.uid,
        email: auth.currentUser.email,
      }
    : null
}


// ── LISTEN TO AUTH STATE CHANGES ───────────────
// Called in App.jsx to detect login/logout
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {

      // Auto-logout after 30 days of inactivity
      if (isSessionExpired()) {
        clearSession()
        await signOut(auth)
        callback(null)
        return
      }

      // get user profile from Firestore
      const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (docSnap.exists()) {
        const data = docSnap.data()
        updateSessionTime()
        callback({
          id:    firebaseUser.uid,
          name:  data.name,
          email: data.email,
          exam:  data.exam,
        })
      } else {
        callback(null)
      }

    } else {
      callback(null)
    }
  })
}


// ── FIREBASE ERROR MESSAGES ────────────────────
function firebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email already registered. Please login.'
    case 'auth/invalid-email':
      return 'Invalid email address.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/user-not-found':
      return 'Email not found. Please sign up first.'
    case 'auth/wrong-password':
      return 'Wrong password. Please try again.'
    case 'auth/invalid-credential':
      return 'Wrong email or password. Please try again.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

// ── Session Management ─────────────────────
const SESSION_DAYS = 30  // logout after 30 days of inactivity

export const updateSessionTime = () => {
  localStorage.setItem('examai_last_active', Date.now().toString())
}

export const isSessionExpired = () => {
  const last = localStorage.getItem('examai_last_active')
  if (!last) return false  // first time user, let Firebase decide
  const daysSince = (Date.now() - parseInt(last)) / (1000 * 60 * 60 * 24)
  return daysSince > SESSION_DAYS
}

export const clearSession = () => {
  localStorage.removeItem('examai_last_active')
}