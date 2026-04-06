import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useModuleState } from "@/hooks/useModuleState";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, Settings } from "lucide-react";
import { getLoginUrl } from "@/const";

interface DashboardLayoutSaasProps {
  children: React.ReactNode;
  modules: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }>;
}

export function DashboardLayoutSaas({
  children,
  modules,
}: DashboardLayoutSaasProps) {
  const { user, logout } = useAuth();
  const { activeModule, setActiveModule, sidebarOpen, setSidebarOpen } =
    useModuleState();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-700`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">
                SJ
              </div>
              <span className="font-bold text-sm">SOS Docente</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-slate-700"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>

        {/* Módulos */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeModule === module.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
              title={!sidebarOpen ? module.label : ""}
            >
              <span className="flex-shrink-0">{module.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">
                    {module.label}
                  </span>
                  {module.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {module.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Usuario */}
        <div className="border-t border-slate-700 p-2 space-y-2">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              {sidebarOpen && (
                <span className="text-xs truncate flex-1 text-left">
                  {user?.name || "Usuario"}
                </span>
              )}
            </button>

            {showUserMenu && sidebarOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-700 text-sm"
                >
                  <Settings size={16} />
                  Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-slate-700 text-sm border-t border-slate-700"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">SOS Docente</h1>
            <p className="text-sm text-slate-500">
              Plataforma SaaS de Gestión Escolar IoT
            </p>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6">{children}</main>
      </div>
    </div>
  );
}
