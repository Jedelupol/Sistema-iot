import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Menu, LogOut, User } from "lucide-react";
import { useState } from "react";
import "../theme.css";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="header" style={{
      backgroundColor: "#2c3e50",
      color: "#ffffff",
      padding: "0 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "70px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999,
    }}>
      {/* Logo y Título */}
      <div className="header-logo" style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        flex: 1,
      }}>
        <button
          className="menu-toggle"
          onClick={onMenuClick}
          style={{
            background: "none",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Menu size={24} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#3498db",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "20px",
          }}>
            SJ
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "700",
              color: "#ffffff",
            }}>
              San Jerónimo
            </h1>
            <p style={{
              margin: 0,
              fontSize: "12px",
              color: "#95a5a6",
            }}>
              Sistema IoT v3.0
            </p>
          </div>
        </div>
      </div>

      {/* Menú de Usuario */}
      <div className="header-user" style={{
        position: "relative",
      }}>
        {isAuthenticated ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}>
              <User size={18} />
              <span>{user?.nombre || "Usuario"}</span>
            </div>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "24px",
              }}
            >
              ▼
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div style={{
                position: "absolute",
                top: "100%",
                right: 0,
                backgroundColor: "#ffffff",
                color: "#2c3e50",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                minWidth: "200px",
                marginTop: "8px",
                zIndex: 1000,
              }}>
                <div style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #ecf0f1",
                  fontSize: "14px",
                }}>
                  <p style={{ margin: 0, fontWeight: "600" }}>{user?.nombre}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#95a5a6" }}>
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#e74c3c",
                    fontSize: "14px",
                    transition: "background-color 150ms ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href={getLoginUrl()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#3498db",
              color: "#ffffff",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "600",
              transition: "background-color 150ms ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2980b9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#3498db";
            }}
          >
            Iniciar Sesión
          </a>
        )}
      </div>
    </header>
  );
}
