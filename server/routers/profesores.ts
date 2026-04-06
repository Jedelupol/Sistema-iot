import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getProfesores, getProfesorById, createProfesor, updateProfesor, deleteProfesor } from "../db";

const profesorSchema = z.object({
  dni: z.string().min(1, "DNI requerido"),
  nombres: z.string().min(1, "Nombres requeridos"),
  apellidoPaterno: z.string().min(1, "Apellido paterno requerido"),
  apellidoMaterno: z.string().min(1, "Apellido materno requerido"),
  genero: z.enum(["M", "F", "Otro"]),
  fechaNacimiento: z.date(),
  especialidad: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
});

export const profesoresRouter = router({
  list: protectedProcedure.query(async () => {
    return await getProfesores();
  }),

  getById: protectedProcedure.input(z.number()).query(async ({ input }) => {
    return await getProfesorById(input);
  }),

  create: protectedProcedure.input(profesorSchema).mutation(async ({ input }) => {
    return await createProfesor({
      ...input,
      estado: "activo",
    });
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: profesorSchema.partial() }))
    .mutation(async ({ input }) => {
      return await updateProfesor(input.id, input.data);
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ input }) => {
    return await deleteProfesor(input);
  }),
});
