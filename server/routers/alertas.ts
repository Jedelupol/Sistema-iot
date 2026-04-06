import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq, and, desc } from "drizzle-orm";
import {
  alertas_desercion,
  alumnos,
} from "../../drizzle/schema";
import { z } from "zod";

export const alertasRouter = router({
  listar: protectedProcedure
    .input(
      z
        .object({
          estado: z
            .enum(["Pendiente", "Revisado", "Resuelto", "Descartado"])
            .optional(),
          nivel_riesgo: z.enum(["Bajo", "Medio", "Alto"]).optional(),
          limite: z.number().default(50),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Base de datos no disponible",
        });
      }

      try {
        const conditions = [
          eq(alertas_desercion.institucion_id, ctx.user.institucion_id),
        ];

        if (input?.estado) {
          conditions.push(eq(alertas_desercion.estado_revision, input.estado));
        }

        if (input?.nivel_riesgo) {
          conditions.push(eq(alertas_desercion.nivel_riesgo, input.nivel_riesgo));
        }

        const resultado = await db
          .select({
            id: alertas_desercion.id,
            alumno_id: alertas_desercion.alumno_id,
            nivel_riesgo: alertas_desercion.nivel_riesgo,
            razon: alertas_desercion.razon,
            fecha_deteccion: alertas_desercion.fecha_deteccion,
            estado_revision: alertas_desercion.estado_revision,
            alumno_nombre: alumnos.nombres,
            alumno_apellido_paterno: alumnos.apellido_paterno,
            alumno_codigo_siagie: alumnos.codigo_siagie,
          })
          .from(alertas_desercion)
          .innerJoin(alumnos, eq(alertas_desercion.alumno_id, alumnos.id))
          .where(and(...conditions))
          .orderBy(desc(alertas_desercion.fecha_deteccion))
          .limit(input?.limite || 50);

        return resultado;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener alertas",
        });
      }
    }),

  obtenerDetalles: protectedProcedure
    .input(z.object({ alertaId: z.number() }))
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
          .from(alertas_desercion)
          .where(
            and(
              eq(alertas_desercion.id, input.alertaId),
              eq(alertas_desercion.institucion_id, ctx.user.institucion_id)
            )
          )
          .limit(1);

        if (resultado.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Alerta no encontrada",
          });
        }

        return resultado[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener detalles de alerta",
        });
      }
    }),

  marcarRevisada: protectedProcedure
    .input(z.object({ alertaId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Base de datos no disponible",
        });
      }

      try {
        const alerta = await db
          .select()
          .from(alertas_desercion)
          .where(
            and(
              eq(alertas_desercion.id, input.alertaId),
              eq(alertas_desercion.institucion_id, ctx.user.institucion_id)
            )
          )
          .limit(1);

        if (alerta.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Alerta no encontrada",
          });
        }

        await db
          .update(alertas_desercion)
          .set({
            estado_revision: "Revisado",
            revisado_por: ctx.user.id,
            fecha_revision: new Date(),
          })
          .where(eq(alertas_desercion.id, input.alertaId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al marcar alerta como revisada",
        });
      }
    }),

  resolver: protectedProcedure
    .input(
      z.object({
        alertaId: z.number(),
        notas: z.string().optional(),
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
        const alerta = await db
          .select()
          .from(alertas_desercion)
          .where(
            and(
              eq(alertas_desercion.id, input.alertaId),
              eq(alertas_desercion.institucion_id, ctx.user.institucion_id)
            )
          )
          .limit(1);

        if (alerta.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Alerta no encontrada",
          });
        }

        await db
          .update(alertas_desercion)
          .set({
            estado_revision: "Resuelto",
            revisado_por: ctx.user.id,
            fecha_revision: new Date(),
            notas_director: input.notas || "Resuelto por director",
          })
          .where(eq(alertas_desercion.id, input.alertaId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al resolver alerta",
        });
      }
    }),

  descartar: protectedProcedure
    .input(
      z.object({
        alertaId: z.number(),
        razon: z.string(),
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
        const alerta = await db
          .select()
          .from(alertas_desercion)
          .where(
            and(
              eq(alertas_desercion.id, input.alertaId),
              eq(alertas_desercion.institucion_id, ctx.user.institucion_id)
            )
          )
          .limit(1);

        if (alerta.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Alerta no encontrada",
          });
        }

        await db
          .update(alertas_desercion)
          .set({
            estado_revision: "Descartado",
            revisado_por: ctx.user.id,
            fecha_revision: new Date(),
            notas_director: input.razon,
          })
          .where(eq(alertas_desercion.id, input.alertaId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al descartar alerta",
        });
      }
    }),

  obtenerEstadisticas: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Base de datos no disponible",
      });
    }

    try {
      const alertas = await db
        .select()
        .from(alertas_desercion)
        .where(eq(alertas_desercion.institucion_id, ctx.user.institucion_id));

      const estadisticas = {
        total: alertas.length,
        pendientes: alertas.filter(
          (a) => a.estado_revision === "Pendiente"
        ).length,
        revisadas: alertas.filter(
          (a) => a.estado_revision === "Revisado"
        ).length,
        resueltas: alertas.filter(
          (a) => a.estado_revision === "Resuelto"
        ).length,
        descartadas: alertas.filter(
          (a) => a.estado_revision === "Descartado"
        ).length,
        alto_riesgo: alertas.filter((a) => a.nivel_riesgo === "Alto").length,
        medio_riesgo: alertas.filter((a) => a.nivel_riesgo === "Medio").length,
        bajo_riesgo: alertas.filter((a) => a.nivel_riesgo === "Bajo").length,
      };

      return estadisticas;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener estadísticas",
      });
    }
  }),
});
