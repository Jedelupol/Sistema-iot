import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardLayoutSaas } from "@/components/DashboardLayoutSaas";
import { DashboardMain } from "@/pages/DashboardMain";
import { AlumnosPage } from "@/pages/AlumnosPage";
import { MonitorIoT } from "@/pages/MonitorIoT";
import { SimuladorSITL } from "@/pages/SimuladorSITL";
import { useModuleState } from "@/hooks/useModuleState";
import {
  LayoutDashboard,
  Users,
  Radio,
  Zap,
  AlertTriangle,
  FileText,
  Lock,
  Upload,
} from "lucide-react";
import { Loader2 } from "lucide-react";

function DashboardRouter() {
  const { activeModule } = useModuleState();

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardMain />;
      case "alumnos":
        return <AlumnosPage />;
      case "monitor-iot":
        return <MonitorIoT />;
      case "simulador-sitl":
        return <SimuladorSITL />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-500">Módulo en desarrollo...</p>
          </div>
        );
    }
  };

  const modules = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "alumnos",
      label: "Alumnos",
      icon: <Users size={20} />,
    },
    {
      id: "monitor-iot",
      label: "Asistencia IoT",
      icon: <Radio size={20} />,
      badge: "EN VIVO",
    },
    {
      id: "simulador-sitl",
      label: "Simulador SITL",
      icon: <Zap size={20} />,
    },
    {
      id: "alertas",
      label: "Alertas",
      icon: <AlertTriangle size={20} />,
    },
    {
      id: "informes",
      label: "Informes",
      icon: <FileText size={20} />,
    },
    {
      id: "seguridad",
      label: "Seguridad",
      icon: <Lock size={20} />,
    },
    {
      id: "importar",
      label: "Importar SIAGIE",
      icon: <Upload size={20} />,
    },
  ];

  return (
    <DashboardLayoutSaas modules={modules}>
      {renderContent()}
    </DashboardLayoutSaas>
  );
}

function AuthenticatedApp() {
  return (
    <Switch>
      <Route path="/*" component={DashboardRouter} />
    </Switch>
  );
}

function UnauthenticatedApp() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-blue-900">
      <div className="text-center">
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-blue-600">SJ</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">SOS Docente</h1>
        <p className="text-blue-100 mb-6">
          Plataforma SaaS de Gestión Escolar IoT
        </p>
        <a
          href={`${window.location.origin}/api/oauth/callback`}
          className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
        >
          Iniciar Sesión
        </a>
      </div>
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
