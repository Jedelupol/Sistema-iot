import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getAsistenciasIot, createAsistenciaIot, updateAsistenciaIot, getAlumnoByRfidTag, getAsistenciasByAlumnoId } from "../db";

export const asistenciaRouter = router({
  list: protectedProcedure.query(async () => {
    return await getAsistenciasIot();
  }),

  getByAlumnoId: protectedProcedure.input(z.number()).query(async ({ input }) => {
    return await getAsistenciasByAlumnoId(input);
  }),

  // Endpoint IoT público para recibir datos del ESP32
  registrarIoT: publicProcedure
    .input(z.object({ rfidUid: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const alumno = await getAlumnoByRfidTag(input.rfidUid);
        
        if (!alumno) {
          return {
            success: false,
            error: "RFID no registrado en el sistema",
            alumnoId: null,
          };
        }

        const resultado = await createAsistenciaIot({
          institucion_id: alumno.institucion_id,
          alumno_id: alumno.id,
          rfid_uid: input.rfidUid,
          tipo_evento: "Entrada",
          estado: "Puntual",
        });

        return {
          success: true,
          alumno: {
            id: alumno.id,
            nombres: alumno.nombres,
            apellido_paterno: alumno.apellido_paterno,
            apellido_materno: alumno.apellido_materno,
            grado: alumno.grado,
            seccion: alumno.seccion,
          },
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[IoT] Error registrando asistencia:", error);
        return {
          success: false,
          error: "Error al registrar asistencia",
          alumnoId: null,
        };
      }
    }),

  // Endpoint para simular escaneo RFID (Pruebas IoT)
  simularEscaneo: protectedProcedure
    .input(z.object({ alumnoId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const resultado = await createAsistenciaIot({
          institucion_id: ctx.user.institucion_id,
          alumno_id: input.alumnoId,
          rfid_uid: `SIM-${Date.now()}`,
          tipo_evento: "Entrada",
          estado: "Puntual",
        });

        return {
          success: true,
          message: "Escaneo simulado registrado correctamente",
          timestamp: new Date(),
        };
      } catch (error) {
        console.error("[Simulador] Error simulando escaneo:", error);
        return {
          success: false,
          error: "Error al simular escaneo",
        };
      }
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: z.object({ estado: z.enum(["Puntual", "Tardanza", "Ausente"]).optional() }) }))
    .mutation(async ({ input, ctx }) => {
      return await updateAsistenciaIot(input.id, input.data);
    }),
});
