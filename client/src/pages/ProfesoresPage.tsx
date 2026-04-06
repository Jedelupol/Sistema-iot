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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit2, Trash2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ProfesorForm {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  especialidad?: string;
  telefono?: string;
}

export function ProfesoresPage() {
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProfesorForm>({
    dni: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
  });

  const { data: profesores, refetch } = trpc.profesores.list.useQuery();
  const createMutation = trpc.profesores.create.useMutation({
    onSuccess: () => {
      toast.success("Profesor registrado exitosamente");
      refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Error al registrar profesor");
    },
  });

  const deleteMutation = trpc.profesores.delete.useMutation({
    onSuccess: () => {
      toast.success("Profesor eliminado exitosamente");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar profesor");
    },
  });

  const resetForm = () => {
    setFormData({
      dni: "",
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = () => {
    if (
      !formData.dni ||
      !formData.nombres ||
      !formData.apellidoPaterno ||
      !formData.apellidoMaterno
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    createMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este profesor?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProfesores = profesores?.filter(
    (p) =>
      p.dni?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.apellido_paterno?.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Profesores</h2>
          <p className="text-slate-600 mt-1">
            Gestión de docentes del sistema
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Profesor
        </Button>
      </div>

      {/* Búsqueda */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por DNI, nombre o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">DNI</TableHead>
              <TableHead className="font-semibold">Nombres</TableHead>
              <TableHead className="font-semibold">Apellidos</TableHead>
              <TableHead className="font-semibold">Especialidad</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfesores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-slate-500">
                    No hay profesores registrados
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredProfesores.map((profesor) => (
                <TableRow
                  key={profesor.id}
                  className="hover:bg-slate-50 border-b border-slate-100"
                >
                  <TableCell className="font-mono text-sm">
                    {profesor.dni}
                  </TableCell>
                  <TableCell className="font-medium">{profesor.nombres}</TableCell>
                  <TableCell>
                    {profesor.apellido_paterno} {profesor.apellido_materno}
                  </TableCell>
                  <TableCell>{profesor.especialidad || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(profesor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingId ? "Editar Profesor" : "Agregar Nuevo Profesor"}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  DNI *
                </label>
                <Input
                  value={formData.dni}
                  onChange={(e) =>
                    setFormData({ ...formData, dni: e.target.value })
                  }
                  placeholder="12345678"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nombres *
                </label>
                <Input
                  value={formData.nombres}
                  onChange={(e) =>
                    setFormData({ ...formData, nombres: e.target.value })
                  }
                  placeholder="Juan"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Apellido Paterno *
                </label>
                <Input
                  value={formData.apellidoPaterno}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apellidoPaterno: e.target.value,
                    })
                  }
                  placeholder="Pérez"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Apellido Materno *
                </label>
                <Input
                  value={formData.apellidoMaterno}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apellidoMaterno: e.target.value,
                    })
                  }
                  placeholder="García"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Especialidad
                </label>
                <Input
                  value={formData.especialidad || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, especialidad: e.target.value })
                  }
                  placeholder="Matemáticas"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Teléfono
                </label>
                <Input
                  value={formData.telefono || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, telefono: e.target.value })
                  }
                  placeholder="999999999"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createMutation.isPending ? "Guardando..." : "Registrar"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
