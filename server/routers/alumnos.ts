import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getAlumnos, getAlumnoById, getAlumnoByRfidTag, createAlumno, updateAlumno, deleteAlumno, getAsistenciasByAlumnoId } from "../db";

const alumnoSchema = z.object({
  codigoSiagie: z.string().length(14, "Código SIAGIE debe tener 14 dígitos"),
  dni: z.string().optional(),
  nombres: z.string().min(1, "Nombres requeridos"),
  apellidoPaterno: z.string().min(1, "Apellido paterno requerido"),
  apellidoMaterno: z.string().min(1, "Apellido materno requerido"),
  genero: z.enum(["M", "F", "Otro"]),
  fechaNacimiento: z.date(),
  rfidTag: z.string().min(1, "RFID Tag requerido"),
  grado: z.string().optional(),
  seccion: z.string().optional(),
  nivel: z.enum(["Primaria", "Secundaria"]),
});

export const alumnosRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getAlumnos(ctx.user.institucion_id);
  }),

  getById: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
    return await getAlumnoById(input, ctx.user.institucion_id);
  }),

  getByRfidTag: protectedProcedure.input(z.string()).query(async ({ input }) => {
    return await getAlumnoByRfidTag(input);
  }),

  create: protectedProcedure.input(alumnoSchema).mutation(async ({ input, ctx }) => {
    return await createAlumno({
      institucion_id: ctx.user.institucion_id,
      codigo_siagie: input.codigoSiagie,
      nombres: input.nombres,
      apellido_paterno: input.apellidoPaterno,
      apellido_materno: input.apellidoMaterno,
      dni: input.dni || null,
      genero: input.genero,
      fecha_nacimiento: input.fechaNacimiento,
      rfid_tag: input.rfidTag,
      grado: input.grado,
      seccion: input.seccion,
      nivel: input.nivel,
      estado: "Activo",
    });
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: alumnoSchema.partial() }))
    .mutation(async ({ input, ctx }) => {
      const updateData: Record<string, any> = {};
      if (input.data.nombres !== undefined) updateData.nombres = input.data.nombres;
      if (input.data.apellidoPaterno !== undefined) updateData.apellido_paterno = input.data.apellidoPaterno;
      if (input.data.apellidoMaterno !== undefined) updateData.apellido_materno = input.data.apellidoMaterno;
      if (input.data.dni !== undefined) updateData.dni = input.data.dni;
      if (input.data.genero !== undefined) updateData.genero = input.data.genero;
      if (input.data.fechaNacimiento !== undefined) updateData.fecha_nacimiento = input.data.fechaNacimiento;
      if (input.data.rfidTag !== undefined) updateData.rfid_tag = input.data.rfidTag;
      if (input.data.grado !== undefined) updateData.grado = input.data.grado;
      if (input.data.seccion !== undefined) updateData.seccion = input.data.seccion;
      if (input.data.nivel !== undefined) updateData.nivel = input.data.nivel;

      return await updateAlumno(input.id, updateData, ctx.user.institucion_id);
    }),

  delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
    return await deleteAlumno(input, ctx.user.institucion_id);
  }),

  getAsistencias: protectedProcedure.input(z.number()).query(async ({ input }) => {
    return await getAsistenciasByAlumnoId(input);
  }),
});
