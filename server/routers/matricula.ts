import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getAlumnos, getAlumnoById, updateAlumno } from "../db";

const matriculaSchema = z.object({
  alumnoId: z.number(),
  grado: z.string().min(1, "Grado requerido"),
  seccion: z.string().min(1, "Sección requerida"),
  nivel: z.enum(["Primaria", "Secundaria"]),
});

export const matriculaRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getAlumnos(ctx.user.institucion_id);
  }),

  getByAlumnoId: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
    return await getAlumnoById(input, ctx.user.institucion_id);
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: z.object({ grado: z.string().optional(), seccion: z.string().optional(), nivel: z.enum(["Primaria", "Secundaria"]).optional() }) }))
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, any> = {};
      if (input.data.grado !== undefined) updateData.grado = input.data.grado;
      if (input.data.seccion !== undefined) updateData.seccion = input.data.seccion;
      if (input.data.nivel !== undefined) updateData.nivel = input.data.nivel;

      return await updateAlumno(input.id, updateData, ctx.user.institucion_id);
    }),
});
