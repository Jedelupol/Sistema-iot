import { useState } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Wifi,
  Search,
  FileText,
  Lock,
  ChevronDown,
} from "lucide-react";
import "../theme.css";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/dashboard",
  },
  {
    id: "profesores",
    label: "Profesores",
    icon: <Users size={20} />,
    path: "/profesores",
  },
  {
    id: "alumnos",
    label: "Alumnos",
    icon: <BookOpen size={20} />,
    path: "/alumnos",
  },
  {
    id: "matricula",
    label: "Matrícula",
    icon: <ClipboardList size={20} />,
    path: "/matricula",
  },
  {
    id: "asistencia",
    label: "Asistencia IoT",
    icon: <Wifi size={20} />,
    path: "/asistencia",
    badge: "EN VIVO",
  },
  {
    id: "consultas",
    label: "Consultas",
    icon: <Search size={20} />,
    path: "/consultas",
  },
  {
    id: "informes",
    label: "Informes",
    icon: <FileText size={20} />,
    path: "/informes",
  },
  {
    id: "seguridad",
    label: "Seguridad",
    icon: <Lock size={20} />,
    path: "/seguridad",
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("dashboard");

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 998,
            display: "none",
          }}
          onMouseEnter={(e) => {
            if (window.innerWidth <= 768) {
              e.currentTarget.style.display = "block";
            }
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          position: "fixed",
          left: 0,
          top: "70px",
          width: "250px",
          height: "calc(100vh - 70px)",
          backgroundColor: "#2c3e50",
          color: "#ffffff",
          overflowY: "auto",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
          zIndex: 999,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease-in-out",
        }}
      >
        {/* Navegación */}
        <nav style={{
          padding: "24px 0",
        }}>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.path}
                  onClick={() => handleItemClick(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 24px",
                    color: activeItem === item.id ? "#3498db" : "#95a5a6",
                    textDecoration: "none",
                    transition: "all 150ms ease-in-out",
                    borderLeft: activeItem === item.id ? "4px solid #3498db" : "4px solid transparent",
                    backgroundColor: activeItem === item.id ? "rgba(52, 152, 219, 0.1)" : "transparent",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    if (activeItem !== item.id) {
                      e.currentTarget.style.color = "#ecf0f1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = activeItem === item.id ? "rgba(52, 152, 219, 0.1)" : "transparent";
                    e.currentTarget.style.color = activeItem === item.id ? "#3498db" : "#95a5a6";
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}>
                    {item.icon}
                    <span style={{
                      fontSize: "14px",
                      fontWeight: activeItem === item.id ? "600" : "500",
                    }}>
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span style={{
                      backgroundColor: "#e74c3c",
                      color: "#ffffff",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: "700",
                    }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sección de Pruebas IoT */}
        <div style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "24px",
          marginTop: "24px",
        }}>
          <h4 style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "#95a5a6",
            margin: "0 0 12px 0",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}>
            Herramientas
          </h4>
          <Link
            href="/pruebas-iot"
            onClick={() => handleItemClick("pruebas-iot")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: "rgba(231, 76, 60, 0.1)",
              color: "#e74c3c",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 150ms ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(231, 76, 60, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(231, 76, 60, 0.1)";
            }}
          >
            <Wifi size={16} />
            Pruebas IoT
          </Link>
        </div>
      </aside>

      {/* Espaciador para desktop */}
      <div style={{
        width: "250px",
        display: "none",
      }} />
    </>
  );
}
