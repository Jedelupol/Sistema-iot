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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AlumnoForm {
  codigoSiagie: string;
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: "M" | "F" | "Otro";
  fechaNacimiento: string;
  rfidTag: string;
  grado?: string;
  seccion?: string;
  nivel: "Primaria" | "Secundaria";
}

export function AlumnosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AlumnoForm>({
    codigoSiagie: "",
    dni: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    genero: "M",
    fechaNacimiento: "",
    rfidTag: "",
    nivel: "Primaria",
  });

  const { data: alumnos, refetch } = trpc.alumnos.list.useQuery();

  const createMutation = trpc.alumnos.create.useMutation({
    onSuccess: () => {
      toast.success("Alumno creado exitosamente");
      setShowModal(false);
      setFormData({
        codigoSiagie: "",
        dni: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        genero: "M",
        fechaNacimiento: "",
        rfidTag: "",
        nivel: "Primaria",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear alumno");
    },
  });

  const deleteMutation = trpc.alumnos.delete.useMutation({
    onSuccess: () => {
      toast.success("Alumno eliminado");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar alumno");
    },
  });

  const handleSubmit = () => {
    if (
      !formData.codigoSiagie ||
      !formData.nombres ||
      !formData.apellidoPaterno ||
      !formData.rfidTag ||
      !formData.fechaNacimiento
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    createMutation.mutate({
      ...formData,
      fechaNacimiento: new Date(formData.fechaNacimiento),
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este alumno?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Alumnos</h2>
          <p className="text-slate-600 mt-1">
            Gestión del padrón de estudiantes
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
      setFormData({
        codigoSiagie: "",
        dni: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        genero: "M",
        fechaNacimiento: "",
        rfidTag: "",
        nivel: "Primaria",
      });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Alumno
        </Button>
      </div>

      {/* Búsqueda */}
      <Card className="p-4">
        <Input
          placeholder="Buscar por DNI, nombre o código SIAGIE..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </Card>

      {/* Tabla */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Código SIAGIE</TableHead>
              <TableHead className="font-semibold">DNI</TableHead>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">RFID Tag</TableHead>
              <TableHead className="font-semibold">Grado</TableHead>
              <TableHead className="font-semibold">Sección</TableHead>
              <TableHead className="font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alumnos?.map((alumno) => (
              <TableRow key={alumno.id} className="hover:bg-slate-50">
                <TableCell className="font-mono text-sm font-semibold text-blue-600">
                  {alumno.codigo_siagie}
                </TableCell>
                <TableCell>{alumno.dni || "-"}</TableCell>
                <TableCell>
                  <div className="font-medium">
                    {alumno.nombres} {alumno.apellido_paterno}
                  </div>
                  <div className="text-sm text-slate-600">
                    {alumno.apellido_materno}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {alumno.rfid_tag || "-"}
                </TableCell>
                <TableCell>{alumno.grado || "-"}</TableCell>
                <TableCell>{alumno.seccion || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Ver historial"
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Editar"
                      className="text-slate-600 hover:bg-slate-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(alumno.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Alumno" : "Nuevo Alumno"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Código SIAGIE *
              </label>
              <Input
                value={formData.codigoSiagie}
                onChange={(e) =>
                  setFormData({ ...formData, codigoSiagie: e.target.value })
                }
                placeholder="14 dígitos"
                maxLength={14}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">DNI</label>
              <Input
                value={formData.dni}
                onChange={(e) =>
                  setFormData({ ...formData, dni: e.target.value })
                }
                placeholder="8 dígitos"
                maxLength={8}
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
                  setFormData({ ...formData, apellidoPaterno: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Apellido Materno
              </label>
              <Input
                value={formData.apellidoMaterno}
                onChange={(e) =>
                  setFormData({ ...formData, apellidoMaterno: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Género
              </label>
              <select
                value={formData.genero}
                onChange={(e) =>
                  setFormData({ ...formData, genero: e.target.value as "M" | "F" | "Otro" })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mt-1"
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Fecha de Nacimiento *
              </label>
              <Input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, fechaNacimiento: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Nivel *
              </label>
              <select
                value={formData.nivel}
                onChange={(e) =>
                  setFormData({ ...formData, nivel: e.target.value as "Primaria" | "Secundaria" })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm mt-1"
              >
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                RFID Tag *
              </label>
              <Input
                value={formData.rfidTag}
                onChange={(e) =>
                  setFormData({ ...formData, rfidTag: e.target.value })
                }
                placeholder="UID de tarjeta"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Grado
              </label>
              <Input
                value={formData.grado}
                onChange={(e) =>
                  setFormData({ ...formData, grado: e.target.value })
                }
                placeholder="1, 2, 3..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Sección
              </label>
              <Input
                value={formData.seccion}
                onChange={(e) =>
                  setFormData({ ...formData, seccion: e.target.value })
                }
                placeholder="A, B, C..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
