import { useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import Modal from "@/components/Modal";
import { trpc } from "@/lib/trpc";
import "../theme.css";

interface ProfesorForm {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  genero: "M" | "F" | "Otro";
  fechaNacimiento: string;
  especialidad: string;
  telefono: string;
  email: string;
}

const initialForm: ProfesorForm = {
  dni: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  genero: "M",
  fechaNacimiento: "",
  especialidad: "",
  telefono: "",
  email: "",
};

export default function Profesores() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProfesorForm>(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: profesores = [], isLoading } = trpc.profesores.list.useQuery();
  const createMutation = trpc.profesores.create.useMutation();
  const deleteMutation = trpc.profesores.delete.useMutation();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.dni) newErrors.dni = "DNI requerido";
    if (!formData.nombres) newErrors.nombres = "Nombres requeridos";
    if (!formData.apellidoPaterno) newErrors.apellidoPaterno = "Apellido paterno requerido";
    if (!formData.apellidoMaterno) newErrors.apellidoMaterno = "Apellido materno requerido";
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "Fecha de nacimiento requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createMutation.mutateAsync({
        ...formData,
        fechaNacimiento: new Date(formData.fechaNacimiento),
      });
      setFormData(initialForm);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar profesor?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const filteredProfesores = profesores.filter((p: any) =>
    p.dni.includes(searchTerm) ||
    p.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0 0 8px 0", color: "#2c3e50" }}>Profesores</h1>
          <p style={{ margin: 0, color: "#95a5a6", fontSize: "14px" }}>Gestión de profesores y personal docente</p>
        </div>
        <button onClick={() => { setFormData(initialForm); setErrors({}); setIsModalOpen(true); }} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Plus size={20} />
          Agregar
        </button>
      </div>

      <div className="card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px" }}>
        <Search size={20} style={{ color: "#95a5a6" }} />
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input" style={{ margin: 0, flex: 1 }} />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#95a5a6" }}>Cargando...</div>
        ) : filteredProfesores.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#95a5a6" }}>Sin registros</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Especialidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfesores.map((profesor: any) => (
                <tr key={profesor.id}>
                  <td style={{ fontWeight: "600" }}>{profesor.dni}</td>
                  <td>{profesor.nombres}</td>
                  <td>{profesor.apellidoPaterno} {profesor.apellidoMaterno}</td>
                  <td>{profesor.especialidad || "-"}</td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button className="btn btn-small" style={{ backgroundColor: "#3498db", color: "#ffffff" }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(profesor.id)} className="btn btn-small" style={{ backgroundColor: "#e74c3c", color: "#ffffff" }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} title="Registrar Profesor" onClose={() => setIsModalOpen(false)} footer={<><button onClick={() => setIsModalOpen(false)} className="btn btn-danger">Cancelar</button><button onClick={handleSubmit} className="btn btn-primary">Registrar</button></>}>
        <form style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          <div className="form-group">
            <label className="form-label required">DNI</label>
            <input type="text" className={`form-input ${errors.dni ? "error" : ""}`} value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })} />
            {errors.dni && <span className="form-error">{errors.dni}</span>}
          </div>
          <div className="form-group">
            <label className="form-label required">Nombres</label>
            <input type="text" className={`form-input ${errors.nombres ? "error" : ""}`} value={formData.nombres} onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} />
            {errors.nombres && <span className="form-error">{errors.nombres}</span>}
          </div>
          <div className="form-group">
            <label className="form-label required">Apellido Paterno</label>
            <input type="text" className={`form-input ${errors.apellidoPaterno ? "error" : ""}`} value={formData.apellidoPaterno} onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })} />
            {errors.apellidoPaterno && <span className="form-error">{errors.apellidoPaterno}</span>}
          </div>
          <div className="form-group">
            <label className="form-label required">Apellido Materno</label>
            <input type="text" className={`form-input ${errors.apellidoMaterno ? "error" : ""}`} value={formData.apellidoMaterno} onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })} />
            {errors.apellidoMaterno && <span className="form-error">{errors.apellidoMaterno}</span>}
          </div>
          <div className="form-group">
            <label className="form-label required">Género</label>
            <select className="form-select" value={formData.genero} onChange={(e) => setFormData({ ...formData, genero: e.target.value as "M" | "F" | "Otro" })}>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label required">Fecha Nacimiento</label>
            <input type="date" className={`form-input ${errors.fechaNacimiento ? "error" : ""}`} value={formData.fechaNacimiento} onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })} />
            {errors.fechaNacimiento && <span className="form-error">{errors.fechaNacimiento}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Especialidad</label>
            <input type="text" className="form-input" value={formData.especialidad} onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input type="tel" className="form-input" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} />
          </div>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
