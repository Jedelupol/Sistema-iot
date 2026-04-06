import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getProfesores, getProfesorById, createProfesor, updateProfesor, deleteProfesor } from "../db";

const profesorSchema = z.object({
  dni: z.string().min(1, "DNI requerido"),
  nombres: z.string().min(1, "Nombres requeridos"),
  apellidoPaterno: z.string().min(1, "Apellido paterno requerido"),
  apellidoMaterno: z.string().min(1, "Apellido materno requerido"),
  especialidad: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
});

export const profesoresRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getProfesores(ctx.user.institucion_id);
  }),

  getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
    return await getProfesorById(input, ctx.user.institucion_id);
  }),

  create: protectedProcedure.input(profesorSchema).mutation(async ({ input, ctx }) => {
    return await createProfesor({
      institucion_id: ctx.user.institucion_id,
      user_id: ctx.user.id,
      nombres: input.nombres,
      apellido_paterno: input.apellidoPaterno,
      apellido_materno: input.apellidoMaterno,
      dni: input.dni || null,
      especialidad: input.especialidad,
      estado: "Activo",
    });
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: profesorSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, any> = {};
      if (input.data.nombres !== undefined) updateData.nombres = input.data.nombres;
      if (input.data.apellidoPaterno !== undefined) updateData.apellido_paterno = input.data.apellidoPaterno;
      if (input.data.apellidoMaterno !== undefined) updateData.apellido_materno = input.data.apellidoMaterno;
      if (input.data.dni !== undefined) updateData.dni = input.data.dni;
      if (input.data.especialidad !== undefined) updateData.especialidad = input.data.especialidad;

      return await updateProfesor(input.id, updateData, ctx.user.institucion_id);
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    return await deleteProfesor(input, ctx.user.institucion_id);
  }),
});
