// ─────────────────────────────────────────────
// Navbar.jsx
// ─────────────────────────────────────────────

export default function Navbar({ user, currentScreen, navigate, onLogout, language, onLanguageChange }) {
  return (
    <nav className="navbar">

      {/* Logo */}
      <div className="nav-logo">
        Exam<span>Nova</span>
      </div>

      {/* Navigation Links — always English */}
      <div className="nav-links">
        <button
          className={`nav-btn ${currentScreen === 'home' ? 'active' : ''}`}
          onClick={() => navigate('home')}
        >
          Home
        </button>
        <button
          className={`nav-btn ${currentScreen === 'topics' ? 'active' : ''}`}
          onClick={() => navigate('topics')}
        >
          Practice
        </button>
        <button
          className={`nav-btn ${currentScreen === 'current' ? 'active' : ''}`}
          onClick={() => navigate('current')}
        >
          Current Affairs
        </button>
        <button
          className={`nav-btn ${currentScreen === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('dashboard')}
        >
          My Progress
        </button>
      </div>

      {/* Right side */}
      <div className="nav-right">

        {/* Language toggle */}
        <div style={styles.langToggle}>
          <button
            style={{
              ...styles.langBtn,
              background:  language === 'english' ? 'var(--accent)' : 'transparent',
              color:       language === 'english' ? 'white' : 'var(--muted)',
              borderRadius: '6px 0 0 6px',
            }}
            onClick={() => onLanguageChange && onLanguageChange('english')}
          >
            EN
          </button>
          <button
            style={{
              ...styles.langBtn,
              background:  language === 'hindi' ? 'var(--accent)' : 'transparent',
              color:       language === 'hindi' ? 'white' : 'var(--muted)',
              borderRadius: '0 6px 6px 0',
            }}
            onClick={() => onLanguageChange && onLanguageChange('hindi')}
          >
            हि
          </button>
        </div>

        {/* User avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: '700',
          color: '#fff',
          flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <span style={{ fontSize: '14px' }}>{user?.name}</span>

        {/* Logout — always English */}
        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: '1px solid var(--border2)',
            borderRadius: '6px',
            color: 'var(--muted)',
            fontSize: '12px',
            padding: '5px 10px',
            cursor: 'pointer',
            marginLeft: '4px',
          }}
        >
          Logout
        </button>

      </div>

    </nav>
  )
}

const styles = {
  langToggle: {
    display: 'flex',
    border: '1px solid var(--border2)',
    borderRadius: '6px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  langBtn: {
    padding: '4px 10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.15s',
  },
}