import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getAsistenciasIot, createAsistenciaIot, updateAsistenciaIot, getAlumnoByRfidTag, getAsistenciasByAlumnoId } from "../db";

const asistenciaIotSchema = z.object({
  alumnoId: z.number(),
  rfidUid: z.string().min(1, "RFID UID requerido"),
  tipoEvento: z.enum(["entrada", "salida", "otro"]).default("entrada"),
});

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
          alumnoId: alumno.id,
          rfidUid: input.rfidUid,
          tipoEvento: "entrada",
          estado: "Puntual",
          notificacionEnviada: false,
        });

        return {
          success: true,
          alumno: {
            id: alumno.id,
            nombres: alumno.nombres,
            apellidoPaterno: alumno.apellidoPaterno,
            apellidoMaterno: alumno.apellidoMaterno,
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
    .mutation(async ({ input }) => {
      try {
        const resultado = await createAsistenciaIot({
          alumnoId: input.alumnoId,
          rfidUid: `SIM-${Date.now()}`,
          tipoEvento: "entrada",
          estado: "Puntual",
          notificacionEnviada: false,
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
    .input(z.object({ id: z.number(), data: z.object({ estado: z.enum(["registrado", "notificado", "error"]).optional(), notificacionEnviada: z.boolean().optional() }) }))
    .mutation(async ({ input }) => {
      return await updateAsistenciaIot(input.id, input.data);
    }),
});
