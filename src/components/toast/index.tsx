import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  createContext,
  type JSX,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
};

type ToastContextType = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx)
    throw new Error("useToastContext must be used inside ToastProvider");
  return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    ({ type, title, message, duration = 3000 }: Omit<Toast, "id">) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 9999,
          width: 320,
        }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

type ToastItemProps = Toast & { onClose: () => void };

const iconMap: Record<ToastType, JSX.Element> = {
  success: <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a" }} />,
  error: <CloseCircleOutlined style={{ fontSize: 24, color: "#ff4d4f" }} />,
  warning: (
    <ExclamationCircleOutlined style={{ fontSize: 24, color: "#faad14" }} />
  ),
  info: <InfoCircleOutlined style={{ fontSize: 24, color: "#1890ff" }} />,
};

const bgMap: Record<ToastType, string> = {
  success: "#f6ffed",
  error: "#fff1f0",
  warning: "#fffbe6",
  info: "#e6f7ff",
};

const borderMap: Record<ToastType, string> = {
  success: "#52c41a",
  error: "#ff4d4f",
  warning: "#faad14",
  info: "#1890ff",
};

const textColorMap: Record<ToastType, string> = {
  success: "#389e0d",
  error: "#cf1322",
  warning: "#d48806",
  info: "#096dd9",
};

const ToastItem = ({
  type,
  title,
  message,
  duration = 3000,
  onClose,
}: ToastItemProps) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.transition = `width ${duration}ms linear`;
      progressRef.current.style.width = "0%";
    }
  }, [duration]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        border: `1px solid ${borderMap[type]}`,
        backgroundColor: bgMap[type],
        borderRadius: 8,
        padding: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        position: "relative",
      }}
    >
      <div style={{ marginTop: 2 }}>{iconMap[type]}</div>
      <div style={{ flex: 1 }}>
        {title && (
          <div
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: textColorMap[type],
              marginBottom: 4,
            }}
          >
            {title}
          </div>
        )}
        <div style={{ color: textColorMap[type], fontSize: 14 }}>{message}</div>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <CloseOutlined style={{ fontSize: 14, color: "#00000073" }} />
      </button>
      <div
        ref={progressRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 3,
          width: "100%",
          backgroundColor: borderMap[type],
        }}
      />
    </div>
  );
};
