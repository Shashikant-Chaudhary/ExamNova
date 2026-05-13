import { useEffect, useState } from "react";

export default function OfflineToast() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setExiting(false);
      setVisible(true);
    };
    const handleOnline = () => {
      setExiting(true);
      setTimeout(() => setVisible(false), 400);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(30px) scale(0.95); }
        }
        @keyframes progressShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .offline-toast-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      <div style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        animation: exiting ? "toastOut 0.4s ease forwards" : "toastIn 0.4s ease forwards",
        minWidth: 300,
        maxWidth: "90vw",
      }}>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border2)",
          borderRadius: 14,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Red left border accent */}
          <div style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: 4,
            background: "var(--red)",
            borderRadius: "14px 0 0 14px",
          }} />

          {/* Icon */}
          <div style={{
            width: 38, height: 38,
            borderRadius: 10,
            background: "rgba(239,68,68,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
            className="offline-toast-pulse"
          >
            📡
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text)",
              marginBottom: 2,
            }}>
              Connection Lost
            </div>
            <div style={{
              fontSize: 12,
              color: "var(--muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              Check your internet — reconnecting…
            </div>
          </div>

          {/* Spinner */}
          <div style={{
            width: 18, height: 18,
            border: "2px solid var(--border2)",
            borderTopColor: "var(--red)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            flexShrink: 0,
          }} />
        </div>
      </div>
    </>
  );
}