import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export function InformesPage() {
  const [tipoReporte, setTipoReporte] = useState("asistencia");
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const [grado, setGrado] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerarReporte = async () => {
    setIsGenerating(true);
    try {
      // Simulación de generación de reporte
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Reporte generado exitosamente");
    } catch (error) {
      toast.error("Error al generar reporte");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDescargar = (formato: "pdf" | "excel") => {
    toast.success(`Descargando reporte en ${formato.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Informes</h2>
        <p className="text-slate-600 mt-1">
          Generador de reportes mensuales en PDF y Excel
        </p>
      </div>

      {/* Panel de Configuración */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Configurar Reporte
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Tipo de Reporte
            </label>
            <Select value={tipoReporte} onValueChange={setTipoReporte}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asistencia">Asistencia General</SelectItem>
                <SelectItem value="por-grado">Por Grado</SelectItem>
                <SelectItem value="por-alumno">Por Alumno</SelectItem>
                <SelectItem value="desercion">Alertas de Deserción</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Mes</label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Grado</label>
            <Select value={grado} onValueChange={setGrado}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="1">1º Grado</SelectItem>
                <SelectItem value="2">2º Grado</SelectItem>
                <SelectItem value="3">3º Grado</SelectItem>
                <SelectItem value="4">4º Grado</SelectItem>
                <SelectItem value="5">5º Grado</SelectItem>
                <SelectItem value="6">6º Grado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerarReporte}
              disabled={isGenerating}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating ? "Generando..." : "Generar"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Opciones de Descarga */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Descargar Reporte
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleDescargar("pdf")}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 h-auto py-4"
          >
            <FileText className="w-5 h-5 mr-2" />
            <div className="text-left">
              <p className="font-semibold">Descargar PDF</p>
              <p className="text-xs text-slate-600">Formato profesional</p>
            </div>
          </Button>

          <Button
            onClick={() => handleDescargar("excel")}
            variant="outline"
            className="border-green-300 text-green-600 hover:bg-green-50 h-auto py-4"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            <div className="text-left">
              <p className="font-semibold">Descargar Excel</p>
              <p className="text-xs text-slate-600">Editable y analizable</p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm text-slate-600">Asistencias</p>
          <p className="text-2xl font-bold text-green-600 mt-1">245</p>
          <p className="text-xs text-slate-600 mt-1">Este mes</p>
        </Card>

        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-slate-600">Tardanzas</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">18</p>
          <p className="text-xs text-slate-600 mt-1">Este mes</p>
        </Card>

        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-slate-600">Ausencias</p>
          <p className="text-2xl font-bold text-red-600 mt-1">12</p>
          <p className="text-xs text-slate-600 mt-1">Este mes</p>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-sm text-slate-600">Tasa Asistencia</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">94%</p>
          <p className="text-xs text-slate-600 mt-1">Este mes</p>
        </Card>
      </div>

      {/* Tabla de Ejemplo */}
      <Card className="overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">
            Vista Previa del Reporte
          </h3>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Grado</TableHead>
              <TableHead className="font-semibold">Sección</TableHead>
              <TableHead className="font-semibold">Asistencias</TableHead>
              <TableHead className="font-semibold">Tardanzas</TableHead>
              <TableHead className="font-semibold">Ausencias</TableHead>
              <TableHead className="font-semibold">% Asistencia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6].map((grado) => (
              <TableRow key={grado} className="hover:bg-slate-50">
                <TableCell className="font-medium">{grado}º Grado</TableCell>
                <TableCell>A</TableCell>
                <TableCell>42</TableCell>
                <TableCell>3</TableCell>
                <TableCell>2</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    93%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
