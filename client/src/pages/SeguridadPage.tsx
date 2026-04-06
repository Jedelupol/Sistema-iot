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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Shield, Edit2, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "admin" | "director" | "profesor" | "user";
  estado: "Activo" | "Inactivo";
  ultimoAcceso: string;
}

export function SeguridadPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      nombre: "Admin Sistema",
      email: "admin@sosdocente.com",
      rol: "admin",
      estado: "Activo",
      ultimoAcceso: "Hoy 14:30",
    },
    {
      id: 2,
      nombre: "Director",
      email: "director@colegio.edu.pe",
      rol: "director",
      estado: "Activo",
      ultimoAcceso: "Hoy 09:15",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "user" as const,
    password: "",
  });

  const handleAgregar = () => {
    if (!formData.nombre || !formData.email || !formData.password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const nuevoUsuario: Usuario = {
      id: Math.max(...usuarios.map((u) => u.id), 0) + 1,
      nombre: formData.nombre,
      email: formData.email,
      rol: formData.rol,
      estado: "Activo",
      ultimoAcceso: "Nunca",
    };

    setUsuarios([...usuarios, nuevoUsuario]);
    toast.success("Usuario creado exitosamente");
    resetForm();
  };

  const handleEliminar = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      setUsuarios(usuarios.filter((u) => u.id !== id));
      toast.success("Usuario eliminado");
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      email: "",
      rol: "user",
      password: "",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const getRolBadge = (rol: string) => {
    const colores: Record<string, string> = {
      admin: "bg-red-100 text-red-800 hover:bg-red-100",
      director: "bg-purple-100 text-purple-800 hover:bg-purple-100",
      profesor: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      user: "bg-slate-100 text-slate-800 hover:bg-slate-100",
    };
    return <Badge className={colores[rol] || colores.user}>{rol}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Seguridad</h2>
          <p className="text-slate-600 mt-1">
            Administración de usuarios y control de acceso
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-slate-600">Total Usuarios</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {usuarios.length}
          </p>
        </Card>
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-slate-600">Administradores</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {usuarios.filter((u) => u.rol === "admin").length}
          </p>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <p className="text-sm text-slate-600">Directores</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {usuarios.filter((u) => u.rol === "director").length}
          </p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <p className="text-sm text-slate-600">Activos</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {usuarios.filter((u) => u.estado === "Activo").length}
          </p>
        </Card>
      </div>

      {/* Tabla de Usuarios */}
      <Card className="overflow-hidden">
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Usuarios del Sistema</h3>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Rol</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Último Acceso</TableHead>
              <TableHead className="font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow
                key={usuario.id}
                className="hover:bg-slate-50 border-b border-slate-100"
              >
                <TableCell className="font-medium">{usuario.nombre}</TableCell>
                <TableCell className="text-sm text-slate-600">
                  {usuario.email}
                </TableCell>
                <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {usuario.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {usuario.ultimoAcceso}
                </TableCell>
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
                      onClick={() => handleEliminar(usuario.id)}
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

      {/* Políticas de Seguridad */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900">Políticas de Seguridad</p>
            <ul className="text-sm text-yellow-800 mt-2 space-y-1">
              <li>• Contraseñas mínimo 8 caracteres con mayúsculas y números</li>
              <li>• Cambio de contraseña recomendado cada 90 días</li>
              <li>• Bloqueo de cuenta tras 5 intentos fallidos</li>
              <li>• Auditoría de accesos registrada automáticamente</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nombre Completo *
                </label>
                <Input
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Juan Pérez"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="usuario@ejemplo.com"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Rol *
                </label>
                <Select
                  value={formData.rol}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      rol: value as "admin" | "director" | "profesor" | "user",
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="profesor">Profesor</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Contraseña *
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="pr-10"
                  />
                </div>
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
                onClick={handleAgregar}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Crear Usuario
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
