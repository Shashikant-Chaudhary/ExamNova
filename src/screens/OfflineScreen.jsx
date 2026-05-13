import { useEffect, useState } from "react";

export default function OfflineScreen({ isInline = false }) {
  const [dots, setDots] = useState(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(d => (d + 1) % 4);
    }, 500);
    const pulseInterval = setInterval(() => {
      setPulse(p => !p);
    }, 1500);
    return () => {
      clearInterval(dotsInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  const dotsStr = ".".repeat(dots);

  return (
    <div style={{
      position: isInline ? "fixed" : "fixed",
      inset: 0,
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "24px",
      animation: "fadeIn 0.4s ease",
    }}>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes ripple {
          0%   { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes barBounce {
          0%, 100% { transform: scaleY(0.4); }
          50%       { transform: scaleY(1); }
        }
        .offline-icon-wrap {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float 3s ease-in-out infinite;
        }
        .offline-ripple {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid var(--accent);
          animation: ripple 2s ease-out infinite;
        }
        .offline-ripple:nth-child(2) { animation-delay: 0.6s; }
        .offline-ripple:nth-child(3) { animation-delay: 1.2s; }
        .offline-icon-bg {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--surface);
          border: 2px solid var(--border2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        .offline-content {
          animation: slideUp 0.5s ease 0.2s both;
          text-align: center;
          max-width: 340px;
        }
        .wifi-bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 32px;
        }
        .wifi-bar {
          width: 7px;
          border-radius: 3px;
          background: var(--border2);
          transform-origin: bottom;
        }
        .wifi-bar:nth-child(1) { height: 10px; animation: barBounce 1.2s ease-in-out infinite 0s; }
        .wifi-bar:nth-child(2) { height: 18px; animation: barBounce 1.2s ease-in-out infinite 0.2s; }
        .wifi-bar:nth-child(3) { height: 26px; animation: barBounce 1.2s ease-in-out infinite 0.4s; }
        .wifi-bar:nth-child(4) { height: 32px; animation: barBounce 1.2s ease-in-out infinite 0.6s; }
        .offline-tips {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 24px;
          text-align: left;
        }
        .offline-tip {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 13px;
          color: var(--muted2);
          animation: slideUp 0.5s ease both;
        }
        .offline-tip:nth-child(1) { animation-delay: 0.4s; }
        .offline-tip:nth-child(2) { animation-delay: 0.55s; }
        .offline-tip:nth-child(3) { animation-delay: 0.7s; }
      `}</style>

      {/* Animated icon */}
      <div className="offline-icon-wrap">
        <div className="offline-ripple" />
        <div className="offline-ripple" />
        <div className="offline-ripple" />
        <div className="offline-icon-bg">
          <div className="wifi-bars">
            <div className="wifi-bar" />
            <div className="wifi-bar" />
            <div className="wifi-bar" />
            <div className="wifi-bar" />
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="offline-content" style={{ marginTop: 32 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 20,
          padding: "4px 14px",
          fontSize: 12,
          color: "var(--red)",
          fontWeight: 600,
          letterSpacing: 1,
          marginBottom: 16,
          textTransform: "uppercase",
        }}>
          <span style={{
            width: 7, height: 7,
            borderRadius: "50%",
            background: "var(--red)",
            display: "inline-block",
            boxShadow: pulse ? "0 0 8px var(--red)" : "none",
            transition: "box-shadow 0.5s",
          }} />
          No Connection
        </div>

        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--text)",
          marginBottom: 10,
          lineHeight: 1.3,
        }}>
          You're Offline
        </h2>

        <p style={{
          fontSize: 14,
          color: "var(--muted)",
          lineHeight: 1.7,
          marginBottom: 4,
        }}>
          ExamNova needs internet to load questions<br />
          and fetch current affairs{dotsStr}
        </p>

        {/* Tips */}
        <div className="offline-tips">
          <div className="offline-tip">
            <span style={{ fontSize: 18 }}>📶</span>
            Check your Wi-Fi or mobile data connection
          </div>
          <div className="offline-tip">
            <span style={{ fontSize: 18 }}>✈️</span>
            Make sure Airplane mode is turned off
          </div>
          <div className="offline-tip">
            <span style={{ fontSize: 18 }}>🔄</span>
            The app will reconnect automatically
          </div>
        </div>

        {/* Retry button */}
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 28,
            width: "100%",
            justifyContent: "center",
            padding: "13px 20px",
            fontSize: 15,
            borderRadius: 10,
            animation: "slideUp 0.5s ease 0.8s both",
          }}
        >
          ↻ &nbsp; Try Again
        </button>

        <p style={{
          marginTop: 16,
          fontSize: 12,
          color: "var(--muted)",
          opacity: 0.7,
        }}>
          ExamNova will resume automatically once connected
        </p>
      </div>
    </div>
  );
}