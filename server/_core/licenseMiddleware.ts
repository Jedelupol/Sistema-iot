import { TRPCError } from "@trpc/server";
import { middleware } from "./trpc";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { institucion } from "../../drizzle/schema";

/**
 * Middleware para validar que la licencia está activa y no vencida
 */
export const checkLicense = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuario no autenticado",
    });
  }

  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Base de datos no disponible",
    });
  }

  try {
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

    // Validar estado
    if (inst_data.estado !== "Activo") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Institución ${inst_data.estado.toLowerCase()}. Contacte al administrador.`,
      });
    }

    // Validar vencimiento de licencia
    if (
      inst_data.fecha_vencimiento_licencia &&
      new Date(inst_data.fecha_vencimiento_licencia) < new Date()
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Licencia vencida. Contacte al administrador.",
      });
    }

    return next({
      ctx: {
        ...ctx,
        institucion: inst_data,
      },
    });
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al validar licencia",
    });
  }
});

/**
 * Middleware para validar acceso a módulos específicos
 * @param modulos - Array de módulos requeridos (ej: ["iot", "siagie"])
 */
export const checkModuleAccess = (modulos: string[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuario no autenticado",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Base de datos no disponible",
      });
    }

    try {
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
      const autorizados = (inst_data.modulos_autorizados as string[]) || [];

      // Verificar que todos los módulos requeridos están autorizados
      const modulosNoAutorizados = modulos.filter(
        (m) => !autorizados.includes(m)
      );

      if (modulosNoAutorizados.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Módulos no autorizados: ${modulosNoAutorizados.join(", ")}. Upgrade tu licencia para acceder.`,
        });
      }

      return next({
        ctx: {
          ...ctx,
          institucion: inst_data,
        },
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al validar acceso a módulos",
      });
    }
  });

/**
 * Procedimiento protegido que valida licencia
 */
export const protectedWithLicense = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuario no autenticado",
    });
  }

  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Base de datos no disponible",
    });
  }

  try {
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

    // Validar estado
    if (inst_data.estado !== "Activo") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Institución ${inst_data.estado.toLowerCase()}`,
      });
    }

    // Validar vencimiento
    if (
      inst_data.fecha_vencimiento_licencia &&
      new Date(inst_data.fecha_vencimiento_licencia) < new Date()
    ) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Licencia vencida",
      });
    }

    return next({
      ctx: {
        ...ctx,
        institucion: inst_data,
      },
    });
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al validar licencia",
    });
  }
});
