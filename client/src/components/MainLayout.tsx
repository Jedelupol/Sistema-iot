import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "../theme.css";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#ecf0f1",
    }}>
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Contenedor principal */}
      <div style={{
        display: "flex",
        flex: 1,
        marginTop: "70px",
      }}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Contenido principal */}
        <main style={{
          flex: 1,
          padding: "24px",
          marginLeft: "250px",
          overflow: "auto",
        }}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Estilos responsivos */}
      <style>{`
        @media (max-width: 768px) {
          main {
            margin-left: 0 !important;
            padding: 16px !important;
          }
          
          .sidebar {
            width: 100% !important;
            max-width: 280px !important;
          }
        }
      `}</style>
    </div>
  );
}
