import "../theme.css";

export default function Footer() {
  return (
    <footer
      className="footer"
      style={{
        backgroundColor: "#2c3e50",
        color: "#95a5a6",
        padding: "24px",
        textAlign: "center",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        marginTop: "48px",
        fontSize: "14px",
      }}
    >
      <p style={{ margin: 0 }}>
        © 2026 I.E. San Jerónimo - V 3.0.0 (Core IoT Engine)
      </p>
      <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#7f8c8d" }}>
        Sistema de Gestión Escolar con Integración IoT
      </p>
    </footer>
  );
}
