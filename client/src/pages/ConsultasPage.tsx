import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function ConsultasPage() {
  const [busqueda, setBusqueda] = useState("");
  const [tipoConsulta, setTipoConsulta] = useState<"dni" | "apellido">("dni");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);

  const { data: alumnos } = trpc.alumnos.list.useQuery({});

  const handleBuscar = () => {
    if (!busqueda) {
      setResultados([]);
      return;
    }

    let filtered = alumnos || [];

    if (tipoConsulta === "dni") {
      filtered = filtered.filter((a) =>
        a.dni?.toLowerCase().includes(busqueda.toLowerCase())
      );
    } else {
      filtered = filtered.filter(
        (a) =>
          a.apellido_paterno?.toLowerCase().includes(busqueda.toLowerCase()) ||
          a.apellido_materno?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    setResultados(filtered);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Consultas</h2>
        <p className="text-slate-600 mt-1">
          Búsqueda avanzada de alumnos y historial de asistencia
        </p>
      </div>

      {/* Panel de Búsqueda */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Búsqueda Avanzada
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Tipo de Búsqueda
            </label>
            <select
              value={tipoConsulta}
              onChange={(e) =>
                setTipoConsulta(e.target.value as "dni" | "apellido")
              }
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="dni">Por DNI</option>
              <option value="apellido">Por Apellido</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              {tipoConsulta === "dni" ? "DNI" : "Apellido"}
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder={tipoConsulta === "dni" ? "12345678" : "García"}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleBuscar}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Filtro de Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Fecha Inicio
            </label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Fecha Fin
            </label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Resultados */}
      {resultados.length > 0 && (
        <Card className="overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">
              Resultados ({resultados.length})
            </h3>
          </div>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold">Código SIAGIE</TableHead>
                <TableHead className="font-semibold">DNI</TableHead>
                <TableHead className="font-semibold">Nombres</TableHead>
                <TableHead className="font-semibold">Apellidos</TableHead>
                <TableHead className="font-semibold">Grado</TableHead>
                <TableHead className="font-semibold">Estado</TableHead>
                <TableHead className="font-semibold">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultados.map((alumno) => (
                <TableRow
                  key={alumno.id}
                  className="hover:bg-slate-50 border-b border-slate-100"
                >
                  <TableCell className="font-mono text-sm">
                    {alumno.codigo_siagie}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {alumno.dni}
                  </TableCell>
                  <TableCell className="font-medium">{alumno.nombres}</TableCell>
                  <TableCell>
                    {alumno.apellido_paterno} {alumno.apellido_materno}
                  </TableCell>
                  <TableCell>
                    {alumno.grado} - {alumno.seccion}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        alumno.estado === "Activo"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      }
                    >
                      {alumno.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      Ver Historial
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {busqueda && resultados.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-500">
            No se encontraron resultados para "{busqueda}"
          </p>
        </Card>
      )}

      {!busqueda && (
        <Card className="p-8 text-center bg-slate-50">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            Ingresa un criterio de búsqueda para comenzar
          </p>
        </Card>
      )}
    </div>
  );
}
