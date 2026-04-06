import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Profesores from "./pages/Profesores";
import Alumnos from "./pages/Alumnos";
import Matricula from "./pages/Matricula";
import Asistencia from "./pages/Asistencia";
import Consultas from "./pages/Consultas";
import Informes from "./pages/Informes";
import Seguridad from "./pages/Seguridad";
import PruebasIoT from "./pages/PruebasIoT";
import "./theme.css";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      <Route path={"/profesores"} component={() => (
        <MainLayout>
          <Profesores />
        </MainLayout>
      )} />
      <Route path={"/alumnos"} component={() => (
        <MainLayout>
          <Alumnos />
        </MainLayout>
      )} />
      <Route path={"/matricula"} component={() => (
        <MainLayout>
          <Matricula />
        </MainLayout>
      )} />
      <Route path={"/asistencia"} component={() => (
        <MainLayout>
          <Asistencia />
        </MainLayout>
      )} />
      <Route path={"/consultas"} component={() => (
        <MainLayout>
          <Consultas />
        </MainLayout>
      )} />
      <Route path={"/informes"} component={() => (
        <MainLayout>
          <Informes />
        </MainLayout>
      )} />
      <Route path={"/seguridad"} component={() => (
        <MainLayout>
          <Seguridad />
        </MainLayout>
      )} />
      <Route path={"/pruebas-iot"} component={() => (
        <MainLayout>
          <PruebasIoT />
        </MainLayout>
      )} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
