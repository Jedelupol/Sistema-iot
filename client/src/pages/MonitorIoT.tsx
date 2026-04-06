import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle, Clock, Radio } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface RegistroAsistencia {
  id: number;
  alumno_nombre: string;
  estado: "Puntual" | "Tardanza" | "Ausente";
  hora: string;
  rfid_uid: string;
  timestamp: Date;
}

export function MonitorIoT() {
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [isLive, setIsLive] = useState(true);

  const { data: asistencias } = trpc.asistencia.list.useQuery();

  useEffect(() => {
    if (asistencias) {
      setRegistros(
        asistencias.map((a) => ({
          id: a.id,
          alumno_nombre: `Alumno ${a.alumno_id}`,
          estado: a.estado as "Puntual" | "Tardanza" | "Ausente",
          hora: new Date(a.timestamp).toLocaleTimeString(),
          rfid_uid: a.rfid_uid,
          timestamp: new Date(a.timestamp),
        }))
      );
    }
  }, [asistencias]);

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Puntual":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Tardanza":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Ausente":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Puntual":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Puntual
          </Badge>
        );
      case "Tardanza":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Tardanza
          </Badge>
        );
      case "Ausente":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Ausente
          </Badge>
        );
      default:
        return null;
    }
  };

  const estadisticas = {
    total: registros.length,
    puntual: registros.filter((r) => r.estado === "Puntual").length,
    tardanza: registros.filter((r) => r.estado === "Tardanza").length,
    ausente: registros.filter((r) => r.estado === "Ausente").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Monitor IoT - Asistencia en Tiempo Real
          </h2>
          <p className="text-slate-600 mt-1">
            Registros de ingreso mediante RFID
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
          />
          <span className="text-sm font-medium">
            {isLive ? "EN VIVO" : "Desconectado"}
          </span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-slate-600">Total Registros</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {estadisticas.total}
          </p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm text-slate-600">Puntual</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {estadisticas.puntual}
          </p>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-slate-600">Tardanza</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {estadisticas.tardanza}
          </p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-slate-600">Ausente</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {estadisticas.ausente}
          </p>
        </Card>
      </div>

      {/* Controles */}
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-green-500 animate-pulse" />
          <span className="text-sm font-medium">
            Escuchando eventos del ESP32...
          </span>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsLive(!isLive)}
          className={isLive ? "border-green-300" : ""}
        >
          {isLive ? "Pausar" : "Reanudar"}
        </Button>
      </Card>

      {/* Tabla de Registros */}
      <Card className="overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">
            Últimos Registros (Últimas 50)
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Hora</TableHead>
              <TableHead className="font-semibold">Alumno</TableHead>
              <TableHead className="font-semibold">RFID UID</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-slate-500">
                    Esperando registros del ESP32...
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              registros.map((registro) => (
                <TableRow
                  key={registro.id}
                  className="hover:bg-slate-50 border-b border-slate-100"
                >
                  <TableCell className="font-mono text-sm">
                    {registro.hora}
                  </TableCell>
                  <TableCell className="font-medium">
                    {registro.alumno_nombre}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {registro.rfid_uid}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getEstadoIcon(registro.estado)}
                      {getEstadoBadge(registro.estado)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Información del Sistema */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm font-medium text-blue-900">
          💡 Información: El monitor escucha en tiempo real los eventos del
          ESP32. Cada escaneo de RFID se procesa automáticamente según las
          sesiones configuradas para calcular si es Puntual, Tardanza o Ausente.
        </p>
      </Card>
    </div>
  );
}
