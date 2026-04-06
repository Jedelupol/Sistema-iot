import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getMatriculas, getMatriculaByAlumnoId, createMatricula, updateMatricula } from "../db";

const matriculaSchema = z.object({
  alumnoId: z.number(),
  grado: z.string().min(1, "Grado requerido"),
  seccion: z.string().min(1, "Sección requerida"),
  anio: z.number(),
});

export const matriculaRouter = router({
  list: protectedProcedure.query(async () => {
    return await getMatriculas();
  }),

  getByAlumnoId: protectedProcedure.input(z.number()).query(async ({ input }) => {
    return await getMatriculaByAlumnoId(input);
  }),

  create: protectedProcedure.input(matriculaSchema).mutation(async ({ input }) => {
    return await createMatricula({
      ...input,
      estado: "activo",
    });
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: matriculaSchema.partial() }))
    .mutation(async ({ input }) => {
      return await updateMatricula(input.id, input.data);
    }),
});
