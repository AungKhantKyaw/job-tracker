"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Hook ─────────────────────────────────────────────────────────────────────

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.toast;
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  info: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const COLORS: Record<
  ToastType,
  { bg: string; border: string; icon: string; progress: string }
> = {
  success: {
    bg: "#0f1f14",
    border: "rgba(74,222,128,0.2)",
    icon: "#4ade80",
    progress: "#4ade80",
  },
  error: {
    bg: "#1f0f0f",
    border: "rgba(248,113,113,0.2)",
    icon: "#f87171",
    progress: "#f87171",
  },
  warning: {
    bg: "#1f1a0f",
    border: "rgba(251,191,36,0.2)",
    icon: "#fbbf24",
    progress: "#fbbf24",
  },
  info: {
    bg: "#0f1520",
    border: "rgba(96,165,250,0.2)",
    icon: "#60a5fa",
    progress: "#60a5fa",
  },
};

// ── Single Toast Item ─────────────────────────────────────────────────────────

const ToastItem = ({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) => {
  const colors = COLORS[toast.type];
  const duration = toast.duration ?? 4000;

  return (
    <div
      style={{
        ...styles.toast,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        animation: "toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar */}
      <div
        style={{
          ...styles.progress,
          backgroundColor: colors.progress,
          animationDuration: `${duration}ms`,
        }}
      />

      {/* Icon */}
      <div style={{ ...styles.icon, color: colors.icon }}>
        {ICONS[toast.type]}
      </div>

      {/* Message */}
      <p style={styles.message}>{toast.message}</p>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={styles.closeBtn}
        aria-label="Dismiss notification"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);

      timers.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const toast = {
    success: (msg: string, d?: number) => addToast("success", msg, d),
    error: (msg: string, d?: number) => addToast("error", msg, d),
    warning: (msg: string, d?: number) => addToast("warning", msg, d),
    info: (msg: string, d?: number) => addToast("info", msg, d),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100%) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes progressShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .toast-close:hover { color: #e2e8f0 !important; background: rgba(255,255,255,0.08) !important; }
      `}</style>

      {/* Toast container */}
      <div style={styles.container} aria-label="Notifications">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxWidth: 380,
    width: "calc(100vw - 48px)",
    pointerEvents: "none",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)",
    position: "relative",
    overflow: "hidden",
    pointerEvents: "all",
    backdropFilter: "blur(12px)",
  },
  progress: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 2,
    borderRadius: "0 0 12px 12px",
    animation: "progressShrink linear both",
    opacity: 0.6,
  },
  icon: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  message: {
    flex: 1,
    fontSize: 13,
    fontWeight: 500,
    color: "#e2e8f0",
    margin: 0,
    lineHeight: 1.4,
  },
  closeBtn: {
    flexShrink: 0,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    borderRadius: 6,
    transition: "color 0.15s, background 0.15s",
  },
};
