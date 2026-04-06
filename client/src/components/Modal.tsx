import { X } from "lucide-react";
import "../theme.css";

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}

export default function Modal({ isOpen, title, children, onClose, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: "24px",
            borderBottom: "1px solid #ecf0f1",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 className="modal-title" style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#2c3e50" }}>
            {title}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#95a5a6",
              transition: "color 150ms ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#2c3e50";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#95a5a6";
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ padding: "24px" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="modal-footer"
            style={{
              padding: "24px",
              borderTop: "1px solid #ecf0f1",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
