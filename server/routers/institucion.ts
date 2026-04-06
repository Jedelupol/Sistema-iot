import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { institucion } from "../../drizzle/schema";
import { z } from "zod";

export const institucionRouter = router({
  /**
   * Obtener información de la institución del usuario
   */
  getInfo: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Base de datos no disponible",
      });
    }

    try {
      const result = await db
        .select()
        .from(institucion)
        .where(eq(institucion.id, ctx.user.institucion_id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Institución no encontrada",
        });
      }

      return result[0];
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener información de institución",
      });
    }
  }),

  /**
   * Obtener estado de licencia
   */
  getLicenseStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Base de datos no disponible",
      });
    }

    try {
      const result = await db
        .select({
          tipo_licencia: institucion.tipo_licencia,
          estado: institucion.estado,
          fecha_vencimiento_licencia: institucion.fecha_vencimiento_licencia,
          modulos_autorizados: institucion.modulos_autorizados,
        })
        .from(institucion)
        .where(eq(institucion.id, ctx.user.institucion_id))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Institución no encontrada",
        });
      }

      const data = result[0];
      const vencida =
        data.fecha_vencimiento_licencia &&
        new Date(data.fecha_vencimiento_licencia) < new Date();

      return {
        tipo_licencia: data.tipo_licencia,
        estado: data.estado,
        vencida,
        fecha_vencimiento: data.fecha_vencimiento_licencia,
        modulos_autorizados: (data.modulos_autorizados as string[]) || [],
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener estado de licencia",
      });
    }
  }),

  /**
   * Verificar acceso a módulo específico
   */
  checkModuleAccess: protectedProcedure
    .input(z.object({ module: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Base de datos no disponible",
        });
      }

      try {
        const result = await db
          .select({
            modulos_autorizados: institucion.modulos_autorizados,
            estado: institucion.estado,
            fecha_vencimiento_licencia: institucion.fecha_vencimiento_licencia,
          })
          .from(institucion)
          .where(eq(institucion.id, ctx.user.institucion_id))
          .limit(1);

        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Institución no encontrada",
          });
        }

        const data = result[0];

        // Validar estado
        if (data.estado !== "Activo") {
          return {
            authorized: false,
            reason: `Institución ${data.estado.toLowerCase()}`,
          };
        }

        // Validar vencimiento
        if (
          data.fecha_vencimiento_licencia &&
          new Date(data.fecha_vencimiento_licencia) < new Date()
        ) {
          return {
            authorized: false,
            reason: "Licencia vencida",
          };
        }

        // Validar módulo
        const modulos = (data.modulos_autorizados as string[]) || [];
        const authorized = modulos.includes(input.module);

        return {
          authorized,
          reason: authorized ? "Acceso permitido" : "Módulo no autorizado",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al verificar acceso a módulo",
        });
      }
    }),

  /**
   * Actualizar información de institución (solo admin)
   */
  update: adminProcedure
    .input(
      z.object({
        nombre: z.string().optional(),
        logo_url: z.string().optional(),
        color_primario: z.string().optional(),
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
        const updateData: Record<string, unknown> = {};
        if (input.nombre) updateData.nombre = input.nombre;
        if (input.logo_url) updateData.logo_url = input.logo_url;
        if (input.color_primario) updateData.color_primario = input.color_primario;

        if (Object.keys(updateData).length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No hay datos para actualizar",
          });
        }

        await db
          .update(institucion)
          .set(updateData)
          .where(eq(institucion.id, ctx.user.institucion_id));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar institución",
        });
      }
    }),
});
