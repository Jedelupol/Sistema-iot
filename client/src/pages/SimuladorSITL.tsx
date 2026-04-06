import { useState } from "react";
import { z } from "zod";
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
  const [ultimoResultado, setUltimoResultado] = useState<{
    alumno: string;
    timestamp: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: alumnos } = trpc.alumnos.list.useQuery();
  const simularMutation = trpc.asistencia.simularEscaneo.useMutation({
    onSuccess: (result) => {
      setUltimoResultado({
        alumno: result.message || "Escaneo registrado",
        timestamp: new Date().toLocaleTimeString(),
      });
      toast.success("Escaneo simulado exitosamente");
      setIsSimulating(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error en la simulación");
      setIsSimulating(false);
    },
  });

  const handleSimularEscaneo = () => {
    if (!alumnoSeleccionado) {
      toast.error("Selecciona un alumno");
      return;
    }

    setIsSimulating(true);
    simularMutation.mutate({ alumnoId: parseInt(alumnoSeleccionado) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Simulador SITL</h1>
        <p className="text-gray-600 mt-2">Prueba de escaneo RFID sin hardware</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Alumno
            </label>
            <Select value={alumnoSeleccionado} onValueChange={setAlumnoSeleccionado}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un alumno..." />
              </SelectTrigger>
              <SelectContent>
                {alumnos?.map((alumno) => (
                  <SelectItem key={alumno.id} value={alumno.id.toString()}>
                    {alumno.nombres} {alumno.apellido_paterno}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSimularEscaneo}
            disabled={isSimulating || !alumnoSeleccionado}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isSimulating ? "Simulando..." : "Simular Escaneo RFID"}
          </Button>
        </div>
      </Card>

      {ultimoResultado && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-900">Escaneo Registrado</h3>
              <p className="text-green-700 text-sm mt-1">{ultimoResultado.alumno}</p>
              <Badge className="mt-2 bg-green-600">{ultimoResultado.timestamp}</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
