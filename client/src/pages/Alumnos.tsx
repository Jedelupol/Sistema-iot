import { useState } from "react";
import { Plus, Edit2, Trash2, Search, History } from "lucide-react";
import Modal from "@/components/Modal";
import { trpc } from "@/lib/trpc";
import "../theme.css";

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

const initialForm: AlumnoForm = {
  codigoSiagie: "",
  dni: "",
  nombres: "",
  apellidoPaterno: "",
  apellidoMaterno: "",
  genero: "M",
  fechaNacimiento: "",
  rfidTag: "",
  nivel: "Primaria",
};

export default function Alumnos() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AlumnoForm>(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: alumnos = [], isLoading } = trpc.alumnos.list.useQuery();
  const { data: asistencias = [] } = selectedAlumnoId ? trpc.alumnos.getAsistencias.useQuery(selectedAlumnoId) : { data: [] };
  const createMutation = trpc.alumnos.create.useMutation();
  const deleteMutation = trpc.alumnos.delete.useMutation();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.dni) newErrors.dni = "DNI requerido";
    if (!formData.nombres) newErrors.nombres = "Nombres requeridos";
    if (!formData.apellidoPaterno) newErrors.apellidoPaterno = "Apellido paterno requerido";
    if (!formData.apellidoMaterno) newErrors.apellidoMaterno = "Apellido materno requerido";
    if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "Fecha de nacimiento requerida";
    if (!formData.rfidTag) newErrors.rfidTag = "RFID Tag requerido";
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
    if (confirm("¿Eliminar alumno?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const filteredAlumnos = alumnos.filter((a: any) =>
    a.dni.includes(searchTerm) ||
    a.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0 0 8px 0", color: "#2c3e50" }}>Alumnos</h1>
          <p style={{ margin: 0, color: "#95a5a6", fontSize: "14px" }}>Padrón de estudiantes con historial de asistencia</p>
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
        ) : filteredAlumnos.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", color: "#95a5a6" }}>Sin registros</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombres</th>
                <th>Grado</th>
                <th>Sección</th>
                <th>RFID Tag</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlumnos.map((alumno: any) => (
                <tr key={alumno.id}>
                  <td style={{ fontWeight: "600" }}>{alumno.dni}</td>
                  <td>{alumno.nombres} {alumno.apellidoPaterno}</td>
                  <td>{alumno.grado || "-"}</td>
                  <td>{alumno.seccion || "-"}</td>
                  <td style={{ fontSize: "12px", color: "#3498db", fontFamily: "monospace" }}>{alumno.rfidTag}</td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => { setSelectedAlumnoId(alumno.id); setIsHistoryOpen(true); }} className="btn btn-small" style={{ backgroundColor: "#27ae60", color: "#ffffff" }}>
                      <History size={16} />
                    </button>
                    <button className="btn btn-small" style={{ backgroundColor: "#3498db", color: "#ffffff" }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(alumno.id)} className="btn btn-small" style={{ backgroundColor: "#e74c3c", color: "#ffffff" }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} title="Registrar Alumno" onClose={() => setIsModalOpen(false)} footer={<><button onClick={() => setIsModalOpen(false)} className="btn btn-danger">Cancelar</button><button onClick={handleSubmit} className="btn btn-primary">Registrar</button></>}>
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
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label required">RFID Tag (OBLIGATORIO)</label>
            <input type="text" className={`form-input ${errors.rfidTag ? "error" : ""}`} placeholder="Ej: 04B2C5A3" value={formData.rfidTag} onChange={(e) => setFormData({ ...formData, rfidTag: e.target.value })} />
            {errors.rfidTag && <span className="form-error">{errors.rfidTag}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Grado</label>
            <select className="form-select" value={formData.grado} onChange={(e) => setFormData({ ...formData, grado: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option value="1ro">1ro</option>
              <option value="2do">2do</option>
              <option value="3ro">3ro</option>
              <option value="4to">4to</option>
              <option value="5to">5to</option>
              <option value="6to">6to</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Sección</label>
            <select className="form-select" value={formData.seccion} onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>

        </form>
      </Modal>

      <Modal isOpen={isHistoryOpen} title="Historial de Asistencia" onClose={() => setIsHistoryOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {asistencias.length === 0 ? (
            <p style={{ color: "#95a5a6", textAlign: "center" }}>Sin registros de asistencia</p>
          ) : (
            asistencias.map((a: any, idx: number) => (
              <div key={idx} style={{ padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: "600", color: "#2c3e50" }}>Entrada</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#95a5a6" }}>RFID: {a.rfidUid}</p>
                </div>
                <span style={{ fontSize: "12px", color: "#3498db" }}>
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
