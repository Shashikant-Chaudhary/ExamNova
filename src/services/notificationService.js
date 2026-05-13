// ─────────────────────────────────────────────
// notificationService.js
// Handles both:
//   1. Browser push notifications (when user grants permission via SettingsScreen)
//   2. In-app smart banner (no permission needed — used by App.jsx)
// ─────────────────────────────────────────────

const KEYS = {
  ENABLED:       'examai_notif_enabled',     // 'true' | 'false'
  REMINDER_TIME: 'examai_notif_time',        // 'HH:MM'
  LAST_PRACTICE: 'examai_last_practice',     // 'YYYY-MM-DD'
  BANNER_SHOWN:  'examai_banner_shown',      // 'YYYY-MM-DD'
  LAST_SHOWN:    'examai_notif_last_shown',  // 'YYYY-MM-DD'
}

const DEFAULT_TIME = '18:00'

let _schedulerTimer = null

// ─────────────────────────────────────────────
// BROWSER NOTIFICATION API
// (used by SettingsScreen toggle + scheduler)
// ─────────────────────────────────────────────

export function isSupported() {
  return 'Notification' in window
}

export function getPermission() {
  if (!isSupported()) return 'denied'
  return Notification.permission
}

export async function requestPermission() {
  if (!isSupported()) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied')  return 'denied'
  return await Notification.requestPermission()
}

export function isEnabled() {
  return localStorage.getItem(KEYS.ENABLED) === 'true'
}

export function setEnabled(val) {
  localStorage.setItem(KEYS.ENABLED, val ? 'true' : 'false')
}

export function getReminderTime() {
  return localStorage.getItem(KEYS.REMINDER_TIME) || DEFAULT_TIME
}

export function setReminderTime(time) {
  localStorage.setItem(KEYS.REMINDER_TIME, time)
}

export function showNotification(title = 'ExamNova', body = "You haven't practiced today 📚") {
  if (!isSupported() || Notification.permission !== 'granted') return

  const today = new Date().toISOString().split('T')[0]
  if (localStorage.getItem(KEYS.LAST_SHOWN) === today) return
  localStorage.setItem(KEYS.LAST_SHOWN, today)

  try {
    const notif = new Notification(title, {
      body,
      icon:     '/favicon.ico',
      badge:    '/favicon.ico',
      tag:      'examai-daily',
      renotify: false,
    })
    notif.onclick = () => { window.focus(); notif.close() }
    setTimeout(() => notif.close(), 8000)
  } catch (e) {
    console.warn('Notification error:', e)
  }
}

export function scheduleNextReminder() {
  if (_schedulerTimer) clearTimeout(_schedulerTimer)
  if (!isEnabled() || getPermission() !== 'granted') return

  const [hh, mm] = getReminderTime().split(':').map(Number)
  const now    = new Date()
  const target = new Date()
  target.setHours(hh, mm, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)

  _schedulerTimer = setTimeout(() => {
    if (!practicedToday()) {
      showNotification(
        'ExamNova — Daily Reminder ⏰',
        `It's ${getReminderTime()} — time to practice! Keep your streak alive 🔥`
      )
    }
    scheduleNextReminder()
  }, target - now)
}

export function cancelNotifications() {
  if (_schedulerTimer) {
    clearTimeout(_schedulerTimer)
    _schedulerTimer = null
  }
}

export function initNotifications() {
  if (!isEnabled() || !isSupported() || getPermission() !== 'granted') return
  if (!practicedToday()) {
    setTimeout(() => {
      showNotification(
        'ExamNova — Practice Reminder 📚',
        "You haven't practiced today! Open ExamNova and keep your streak alive 🔥"
      )
    }, 3000)
  }
  scheduleNextReminder()
}

// ─────────────────────────────────────────────
// IN-APP SMART BANNER
// (used by App.jsx — no permission needed)
// ─────────────────────────────────────────────

function today() {
  return new Date().toISOString().split('T')[0]
}

export function markPracticedToday() {
  localStorage.setItem(KEYS.LAST_PRACTICE, today())
}

export function practicedToday() {
  return localStorage.getItem(KEYS.LAST_PRACTICE) === today()
}

export function isStreakAtRisk(streakCount = 0) {
  if (streakCount < 2) return false
  const last = localStorage.getItem(KEYS.LAST_PRACTICE)
  if (!last) return false
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return last === yesterday.toISOString().split('T')[0]
}

export function getBannerConfig(streakCount = 0) {
  if (localStorage.getItem(KEYS.BANNER_SHOWN) === today()) return { show: false }
  if (practicedToday()) return { show: false }

  if (isStreakAtRisk(streakCount)) {
    return {
      show: true, type: 'streak_risk', icon: '🔥',
      message: `Your ${streakCount}-day streak is at risk!`,
      sub: "You practiced yesterday but haven't started today. Don't break the streak!",
      accent: '#f97316', cta: 'Practice Now →',
    }
  }

  const hour = new Date().getHours()
  if (hour < 10) return { show: false }

  const msg = hour >= 20
    ? { message: "Haven't practiced today 📚", sub: "It's almost midnight — even 5 questions counts!", cta: 'Quick Practice →' }
    : hour >= 17
    ? { message: "Evening practice time! 📚", sub: "You haven't practiced today. Keep the habit going.", cta: 'Start Practice →' }
    : { message: "You haven't practiced today 📚", sub: "Open a topic and answer a few questions — it only takes 10 minutes.", cta: 'Practice Now →' }

  return { show: true, type: 'not_practiced', icon: '📚', accent: '#3b82f6', ...msg }
}

export function markBannerShown() {
  localStorage.setItem(KEYS.BANNER_SHOWN, today())
}

export function clearNotificationState() {
  localStorage.removeItem(KEYS.LAST_PRACTICE)
  localStorage.removeItem(KEYS.BANNER_SHOWN)
  localStorage.removeItem(KEYS.LAST_SHOWN)
}