import React from "react";
import { Card } from "@/components/ui/card";
import { Users, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { trpc } from "@/lib/trpc";

const dataSemanal = [
  { dia: "Lunes", puntual: 45, tardanza: 8, ausente: 2 },
  { dia: "Martes", puntual: 48, tardanza: 5, ausente: 2 },
  { dia: "Miércoles", puntual: 50, tardanza: 3, ausente: 2 },
  { dia: "Jueves", puntual: 47, tardanza: 6, ausente: 2 },
  { dia: "Viernes", puntual: 52, tardanza: 2, ausente: 1 },
];

export function DashboardMain() {
  const { data: institucionInfo } = trpc.institucion.getInfo.useQuery();
  const { data: licenseStatus } = trpc.institucion.getLicenseStatus.useQuery();
  const { data: alertasStats } = trpc.alertas.obtenerEstadisticas.useQuery();

  const estadisticas = [
    {
      titulo: "Total Alumnos",
      valor: "245",
      icono: <Users className="w-8 h-8 text-blue-500" />,
      cambio: "+12 este mes",
    },
    {
      titulo: "Alertas Activas",
      valor: alertasStats?.pendientes || "0",
      icono: <AlertTriangle className="w-8 h-8 text-red-500" />,
      cambio: `${alertasStats?.alto_riesgo || 0} alto riesgo`,
    },
    {
      titulo: "Asistencias Hoy",
      valor: "240",
      icono: <CheckCircle className="w-8 h-8 text-green-500" />,
      cambio: "98% de asistencia",
    },
    {
      titulo: "Tasa de Asistencia",
      valor: "96.8%",
      icono: <TrendingUp className="w-8 h-8 text-purple-500" />,
      cambio: "+2.3% vs semana anterior",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Bienvenido a {institucionInfo?.nombre || "SOS Docente"}
        </h2>
        <p className="text-slate-600 mt-1">
          Licencia: {licenseStatus?.tipo_licencia || "BASICA"} •{" "}
          {licenseStatus?.vencida
            ? "Licencia vencida"
            : "Licencia activa"}
        </p>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {estadisticas.map((stat, idx) => (
          <Card key={idx} className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {stat.titulo}
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {stat.valor}
                </p>
                <p className="text-xs text-slate-500 mt-2">{stat.cambio}</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">{stat.icono}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Línea - Flujo de Asistencia */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Flujo de Asistencia Semanal
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dataSemanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="puntual"
                stroke="#10b981"
                name="Puntual"
              />
              <Line
                type="monotone"
                dataKey="tardanza"
                stroke="#f59e0b"
                name="Tardanza"
              />
              <Line
                type="monotone"
                dataKey="ausente"
                stroke="#ef4444"
                name="Ausente"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Barras - Comparativa Diaria */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Comparativa de Asistencia
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataSemanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="puntual" fill="#10b981" name="Puntual" />
              <Bar dataKey="tardanza" fill="#f59e0b" name="Tardanza" />
              <Bar dataKey="ausente" fill="#ef4444" name="Ausente" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alertas Recientes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Alertas de Deserción Recientes
        </h3>
        <div className="space-y-3">
          {[
            {
              alumno: "Juan Pérez García",
              riesgo: "Alto",
              razon: "3 faltas en 7 días",
              color: "bg-red-100 text-red-800",
            },
            {
              alumno: "María López Rodríguez",
              riesgo: "Medio",
              razon: "2 faltas en 7 días",
              color: "bg-yellow-100 text-yellow-800",
            },
            {
              alumno: "Carlos Mendoza Flores",
              riesgo: "Bajo",
              razon: "1 falta en 7 días",
              color: "bg-blue-100 text-blue-800",
            },
          ].map((alerta, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
            >
              <div>
                <p className="font-medium text-slate-900">{alerta.alumno}</p>
                <p className="text-sm text-slate-600">{alerta.razon}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${alerta.color}`}>
                {alerta.riesgo}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
