import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getAlumnos, getAlumnoById, getAlumnoByRfidTag, createAlumno, updateAlumno, deleteAlumno, getAsistenciasByAlumnoId } from "../db";

const alumnoSchema = z.object({
  dni: z.string().min(1, "DNI requerido"),
  nombres: z.string().min(1, "Nombres requeridos"),
  apellidoPaterno: z.string().min(1, "Apellido paterno requerido"),
  apellidoMaterno: z.string().min(1, "Apellido materno requerido"),
  genero: z.enum(["M", "F", "Otro"]),
  fechaNacimiento: z.date(),
  rfidTag: z.string().min(1, "RFID Tag requerido"),
  grado: z.string().optional(),
  seccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
});

export const alumnosRouter = router({
  list: protectedProcedure.query(async () => {
    return await getAlumnos();
  }),

  getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
    return await getAlumnoById(input);
  }),

  getByRfidTag: protectedProcedure.input(z.string()).query(async ({ input }) => {
    return await getAlumnoByRfidTag(input);
  }),

  create: protectedProcedure.input(alumnoSchema).mutation(async ({ input }) => {
    return await createAlumno({
      ...input,
      estado: "Activo",
    });
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: alumnoSchema.partial() }))
    .mutation(async ({ input }) => {
      return await updateAlumno(input.id, input.data);
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    return await deleteAlumno(input);
  }),

  getAsistencias: protectedProcedure.input(z.number()).query(async ({ input }) => {
    return await getAsistenciasByAlumnoId(input);
  }),
});
