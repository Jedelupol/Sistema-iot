import { Users, BookOpen, LogIn, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../theme.css";

const weeklyData = [
  { day: "Lun", asistencias: 145, ausencias: 15 },
  { day: "Mar", asistencias: 152, ausencias: 8 },
  { day: "Mié", asistencias: 148, ausencias: 12 },
  { day: "Jue", asistencias: 160, ausencias: 5 },
  { day: "Vie", asistencias: 155, ausencias: 10 },
  { day: "Sab", asistencias: 120, ausencias: 20 },
];

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard = ({ title, value, icon, color, bgColor }: StatCard) => (
  <div className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px", borderLeft: `4px solid ${color}` }}>
    <div style={{ width: "60px", height: "60px", borderRadius: "12px", backgroundColor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", color: color }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: "12px", color: "#95a5a6", fontWeight: "600" }}>{title}</p>
      <h3 style={{ margin: "4px 0 0 0", fontSize: "28px", fontWeight: "700", color: "#2c3e50" }}>{value}</h3>
    </div>
  </div>
);

export default function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h1 style={{ margin: "0 0 8px 0", color: "#2c3e50" }}>Dashboard</h1>
        <p style={{ margin: 0, color: "#95a5a6", fontSize: "14px" }}>Resumen general del sistema de gestión escolar</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        <StatCard title="Total de Profesores" value="24" icon={<Users size={32} />} color="#3498db" bgColor="rgba(52, 152, 219, 0.1)" />
        <StatCard title="Total de Alumnos" value="480" icon={<BookOpen size={32} />} color="#27ae60" bgColor="rgba(39, 174, 96, 0.1)" />
        <StatCard title="Asistencias Hoy" value="456" icon={<LogIn size={32} />} color="#e74c3c" bgColor="rgba(231, 76, 60, 0.1)" />
        <StatCard title="Tasa de Asistencia" value="95%" icon={<TrendingUp size={32} />} color="#f39c12" bgColor="rgba(243, 156, 18, 0.1)" />
      </div>

      <div className="card">
        <h2 style={{ margin: "0 0 16px 0", color: "#2c3e50" }}>Flujo de Asistencia Semanal</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
            <XAxis dataKey="day" stroke="#95a5a6" />
            <YAxis stroke="#95a5a6" />
            <Tooltip contentStyle={{ backgroundColor: "#2c3e50", border: "1px solid #3498db", borderRadius: "8px", color: "#ffffff" }} />
            <Legend />
            <Line type="monotone" dataKey="asistencias" stroke="#3498db" strokeWidth={2} dot={{ fill: "#3498db", r: 5 }} name="Asistencias" />
            <Line type="monotone" dataKey="ausencias" stroke="#e74c3c" strokeWidth={2} dot={{ fill: "#e74c3c", r: 5 }} name="Ausencias" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
