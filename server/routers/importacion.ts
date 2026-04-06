import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  alumnos,
  importaciones_siagie,
  institucion,
} from "../../drizzle/schema";
import { z } from "zod";
import * as XLSX from "xlsx";

/**
 * FASE 4: Endpoint de Importación SIAGIE
 * Procesa archivos Excel/CSV con Actas de Evaluación del MINEDU
 * Realiza UPSERT masivo basado en codigo_siagie
 */
export const importacionRouter = router({
  /**
   * Importar Acta SIAGIE desde archivo Excel/CSV
   * Busca columna de estudiantes y hace UPSERT por codigo_siagie
   */
  importarActaSiagie: protectedProcedure
    .input(
      z.object({
        fileBase64: z.string().describe("Archivo en base64"),
        nombreArchivo: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Base de datos no disponible",
        });
      }

      try {
        // Validar que la institución existe y tiene acceso al módulo
        const inst = await db
          .select()
          .from(institucion)
          .where(eq(institucion.id, ctx.user.institucion_id))
          .limit(1);

        if (inst.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Institución no encontrada",
          });
        }

        const inst_data = inst[0];

        // Validar licencia
        if (inst_data.estado !== "Activo") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Institución inactiva",
          });
        }

        if (
          inst_data.fecha_vencimiento_licencia &&
          new Date(inst_data.fecha_vencimiento_licencia) < new Date()
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Licencia vencida",
          });
        }

        const modulos = (inst_data.modulos_autorizados as string[]) || [];
        if (!modulos.includes("siagie")) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Módulo SIAGIE no autorizado en tu licencia",
          });
        }

        // Decodificar base64
        const buffer = Buffer.from(input.fileBase64, "base64");

        // Leer archivo Excel
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Archivo Excel vacío",
          });
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No hay datos en el archivo",
          });
        }

        // Registrar importación
        const importacionId = await db
          .insert(importaciones_siagie)
          .values({
            institucion_id: ctx.user.institucion_id,
            usuario_id: ctx.user.id,
            nombre_archivo: input.nombreArchivo,
            cantidad_registros: jsonData.length,
            estado: "Procesando",
          });

        let exitosos = 0;
        let errores = 0;
        const detallesError: string[] = [];

        // Procesar cada fila
        for (let idx = 0; idx < jsonData.length; idx++) {
          const row = jsonData[idx] as Record<string, unknown>;

          try {
            // Buscar codigo_siagie en las columnas (puede tener diferentes nombres)
            const codigoSiagieKey = Object.keys(row).find(
              (key) =>
                key.toLowerCase().includes("codigo") &&
                key.toLowerCase().includes("siagie")
            );

            if (!codigoSiagieKey) {
              errores++;
              detallesError.push(
                `Fila ${idx + 1}: No se encontró columna codigo_siagie`
              );
              continue;
            }

            const codigoSiagie = String(row[codigoSiagieKey]).trim();

            if (!codigoSiagie || codigoSiagie.length !== 14) {
              errores++;
              detallesError.push(
                `Fila ${idx + 1}: codigo_siagie inválido (${codigoSiagie})`
              );
              continue;
            }

            // Extraer datos del alumno
            const nombresKey = Object.keys(row).find(
              (key) =>
                key.toLowerCase().includes("nombre") &&
                !key.toLowerCase().includes("apellido")
            );
            const apellidoPaternoKey = Object.keys(row).find((key) =>
              key.toLowerCase().includes("paterno")
            );
            const apellidoMaternoKey = Object.keys(row).find((key) =>
              key.toLowerCase().includes("materno")
            );
            const dniKey = Object.keys(row).find((key) =>
              key.toLowerCase().includes("dni")
            );

            const nombres = nombresKey
              ? String(row[nombresKey]).trim()
              : "Sin nombre";
            const apellidoPaterno = apellidoPaternoKey
              ? String(row[apellidoPaternoKey]).trim()
              : "Sin apellido";
            const apellidoMaterno = apellidoMaternoKey
              ? String(row[apellidoMaternoKey]).trim()
              : "";
            const dni = dniKey ? String(row[dniKey]).trim() : null;

            // UPSERT basado en codigo_siagie
            await db
              .insert(alumnos)
              .values({
                institucion_id: ctx.user.institucion_id,
                codigo_siagie: codigoSiagie,
                dni: dni && dni.length === 8 ? dni : null,
                nombres,
                apellido_paterno: apellidoPaterno,
                apellido_materno: apellidoMaterno,
                nivel: "Primaria",
                estado: "Activo",
              })
              .onDuplicateKeyUpdate({
                set: {
                  nombres,
                  apellido_paterno: apellidoPaterno,
                  apellido_materno: apellidoMaterno,
                  dni: dni && dni.length === 8 ? dni : null,
                },
              });

            exitosos++;
          } catch (error) {
            errores++;
            detallesError.push(
              `Fila ${idx + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`
            );
          }
        }

        // Actualizar registro de importación
        await db
          .update(importaciones_siagie)
          .set({
            cantidad_exitosos: exitosos,
            cantidad_errores: errores,
            estado: errores === 0 ? "Completado" : "Completado",
            detalles_error:
              detallesError.length > 0 ? detallesError.join("\n") : null,
          })
          .where(eq(importaciones_siagie.id, importacionId[0].insertId));

        return {
          success: true,
          cantidad_registros: jsonData.length,
          cantidad_exitosos: exitosos,
          cantidad_errores: errores,
          detalles_error:
            detallesError.length > 0 ? detallesError.slice(0, 10) : [],
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error al importar archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
        });
      }
    }),

  /**
   * Obtener historial de importaciones
   */
  obtenerHistorial: protectedProcedure
    .input(z.object({ limite: z.number().default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Base de datos no disponible",
        });
      }

      try {
        const resultado = await db
          .select()
          .from(importaciones_siagie)
          .where(eq(importaciones_siagie.institucion_id, ctx.user.institucion_id))
          .orderBy(desc(importaciones_siagie.fecha_importacion))
          .limit(input?.limite || 20);

        return resultado;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener historial de importaciones",
        });
      }
    }),

  /**
   * Obtener detalles de una importación específica
   */
  obtenerDetalles: protectedProcedure
    .input(z.object({ importacionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Base de datos no disponible",
        });
      }

      try {
        const resultado = await db
          .select()
          .from(importaciones_siagie)
          .where(
            and(
              eq(importaciones_siagie.id, input.importacionId),
              eq(
                importaciones_siagie.institucion_id,
                ctx.user.institucion_id
              )
            )
          )
          .limit(1);

        if (resultado.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Importación no encontrada",
          });
        }

        return resultado[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener detalles de importación",
        });
      }
    }),
});
