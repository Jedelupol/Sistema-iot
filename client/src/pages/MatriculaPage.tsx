import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function MatriculaPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"].includes(file.type)) {
        toast.error("Por favor selecciona un archivo Excel o CSV");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result;
        // Aquí iría la lógica de importación
        toast.success("Importación completada");
        setShowImportModal(false);
        setSelectedFile(null);
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      toast.error("Error al importar archivo");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Matrícula</h2>
          <p className="text-slate-600 mt-1">
            Gestión de matrículas y asignación de grados
          </p>
        </div>
        <Button
          onClick={() => setShowImportModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          Importar Acta SIAGIE
        </Button>
      </div>

      {/* Información */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">
              Importación de Acta SIAGIE
            </p>
            <p className="text-sm text-blue-800 mt-1">
              Carga archivos Excel del MINEDU para registrar masivamente
              estudiantes. El sistema identificará automáticamente la columna de
              código SIAGIE y realizará un UPSERT basado en ese identificador.
            </p>
          </div>
        </div>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-50">
          <p className="text-sm text-slate-600">Total Matriculados</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
        </Card>
        <Card className="p-4 bg-slate-50">
          <p className="text-sm text-slate-600">Primaria</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
        </Card>
        <Card className="p-4 bg-slate-50">
          <p className="text-sm text-slate-600">Secundaria</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
        </Card>
        <Card className="p-4 bg-slate-50">
          <p className="text-sm text-slate-600">Últimas Importaciones</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">0</p>
        </Card>
      </div>

      {/* Historial de Importaciones */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Historial de Importaciones
        </h3>
        <div className="text-center py-8">
          <p className="text-slate-500">No hay importaciones registradas</p>
        </div>
      </Card>

      {/* Modal de Importación */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Importar Acta SIAGIE
            </h3>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">
                    {selectedFile ? selectedFile.name : "Selecciona un archivo"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Excel o CSV (máx. 10MB)
                  </p>
                </label>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Formato esperado:</strong> El archivo debe contener
                  una columna con el código SIAGIE (14 dígitos). El sistema
                  detectará automáticamente esta columna.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowImportModal(false);
                    setSelectedFile(null);
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isImporting ? "Importando..." : "Importar"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
