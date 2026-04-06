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
import { AlertCircle, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function SimuladorSITL() {
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<string>("");
  const [rfidUid, setRfidUid] = useState<string>("");
  const [ultimoResultado, setUltimoResultado] = useState<{
    alumno: string;
    estado: string;
    timestamp: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: alumnos } = trpc.alumnos.list.useQuery({});
  const simularMutation = trpc.asistencia.simularEscaneo.useMutation({
    onSuccess: (result) => {
      setUltimoResultado({
        alumno: result.alumno_nombre || "Desconocido",
        estado: result.estado || "Desconocido",
        timestamp: new Date().toLocaleTimeString(),
      });
      toast.success(`Escaneo simulado: ${result.estado}`);
      setIsSimulating(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error en la simulación");
      setIsSimulating(false);
    },
  });

  const handleSimularEscaneo = () => {
    if (!alumnoSeleccionado && !rfidUid) {
      toast.error("Selecciona un alumno o ingresa un RFID UID");
      return;
    }

    setIsSimulating(true);

    const alumnoSelec = alumnos?.find((a) => a.id === parseInt(alumnoSeleccionado));
    const uid = rfidUid || alumnoSelec?.rfid_tag || "";

    simularMutation.mutate({ rfidUid: uid });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">
          Simulador SITL (Software-In-The-Loop)
        </h2>
        <p className="text-slate-600 mt-1">
          Prueba el sistema IoT sin hardware ESP32
        </p>
      </div>

      {/* Advertencia */}
      <Card className="p-4 bg-yellow-50 border-yellow-200 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-900">Modo de Prueba</p>
          <p className="text-sm text-yellow-800 mt-1">
            Este simulador permite enviar eventos de RFID manualmente para
            validar que el sistema calcula correctamente el estado de asistencia
            (Puntual, Tardanza, Ausente) según las sesiones configuradas.
          </p>
        </div>
      </Card>

      {/* Panel de Control */}
      <Card className="p-6 border-2 border-blue-300 bg-blue-50">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Enviar Escaneo RFID
        </h3>

        <div className="space-y-4">
          {/* Selector de Alumno */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Alumno (Opción 1)
            </label>
            <Select value={alumnoSeleccionado} onValueChange={setAlumnoSeleccionado}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona un alumno..." />
              </SelectTrigger>
              <SelectContent>
                {alumnos?.map((alumno) => (
                  <SelectItem key={alumno.id} value={alumno.id.toString()}>
                    {alumno.nombres} {alumno.apellido_paterno} (
                    {alumno.codigo_siagie})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* O Ingreso Manual de RFID */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              O ingresa RFID UID manualmente (Opción 2)
            </label>
            <Input
              value={rfidUid}
              onChange={(e) => setRfidUid(e.target.value)}
              placeholder="Ej: 04A1B2C3D4E5F6"
              className="mt-1 font-mono"
            />
          </div>

          {/* Botón de Simulación */}
          <Button
            onClick={handleSimularEscaneo}
            disabled={isSimulating || simularMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 h-auto"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isSimulating || simularMutation.isPending
              ? "Simulando..."
              : "Simular Escaneo RFID"}
          </Button>
        </div>
      </Card>

      {/* Resultado */}
      {ultimoResultado && (
        <Card className="p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            ✅ Resultado de la Simulación
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-green-700">Alumno:</p>
              <p className="text-lg font-semibold text-green-900">
                {ultimoResultado.alumno}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700">Estado Calculado:</p>
              <div className="mt-1">
                {ultimoResultado.estado === "Puntual" && (
                  <Badge className="bg-green-600 hover:bg-green-600">
                    ✓ Puntual
                  </Badge>
                )}
                {ultimoResultado.estado === "Tardanza" && (
                  <Badge className="bg-yellow-600 hover:bg-yellow-600">
                    ⏰ Tardanza
                  </Badge>
                )}
                {ultimoResultado.estado === "Ausente" && (
                  <Badge className="bg-red-600 hover:bg-red-600">
                    ✗ Ausente
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-green-700">Timestamp:</p>
              <p className="text-sm font-mono text-green-900">
                {ultimoResultado.timestamp}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Información Técnica */}
      <Card className="p-6 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">
          ℹ️ Cómo Funciona
        </h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>1. Selecciona un alumno</strong> de la lista o ingresa su
            RFID UID manualmente.
          </p>
          <p>
            <strong>2. Haz clic en "Simular Escaneo RFID"</strong> para enviar
            un evento al servidor.
          </p>
          <p>
            <strong>3. El servidor valida:</strong>
          </p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>Que el RFID existe en la base de datos</li>
            <li>Que hay una sesión activa para el alumno en este momento</li>
            <li>Calcula si es Puntual (dentro de horario), Tardanza o Ausente</li>
          </ul>
          <p>
            <strong>4. Resultado:</strong> Se registra la asistencia y se
            muestra el estado calculado.
          </p>
        </div>
      </Card>

      {/* Instrucciones para ESP32 */}
      <Card className="p-6 bg-slate-900 text-white">
        <h3 className="text-lg font-semibold mb-3">
          📡 Integración Real con ESP32
        </h3>
        <p className="text-sm mb-3">
          Para integrar un ESP32 real, envía un POST a:
        </p>
        <div className="bg-slate-800 p-3 rounded font-mono text-xs overflow-x-auto mb-3">
          POST /api/trpc/asistencia.registrarIoT
        </div>
        <p className="text-sm mb-3">Con el siguiente payload JSON:</p>
        <div className="bg-slate-800 p-3 rounded font-mono text-xs overflow-x-auto">
          {`{
  "rfidUid": "04A1B2C3D4E5F6"
}`}
        </div>
      </Card>
    </div>
  );
}
