import { getDb } from "../db";
import {
  alumnos,
  asistencia_iot,
  alertas_desercion,
  institucion,
} from "../../drizzle/schema";
import { eq, and, gte, lt, sql } from "drizzle-orm";

/**
 * FASE 5: Worker CRON para Detección Automática de Alertas de Deserción
 * Ejecuta semanalmente:
 * - Evalúa tabla asistencia_iot de los últimos 7 días
 * - Cuenta faltas por alumno (registros con estado = "Ausente")
 * - Si alumno >= 3 faltas en 7 días: inserta alerta con nivel_riesgo = "Alto"
 * - Si alumno >= 2 faltas en 7 días: inserta alerta con nivel_riesgo = "Medio"
 * - Evita duplicados: no inserta si ya existe alerta Pendiente para ese alumno
 */

interface DesercionStats {
  alumno_id: number;
  institucion_id: number;
  cantidad_faltas: number;
}

export async function detectarAlertasDesercion() {
  const db = await getDb();
  if (!db) {
    console.error("[DesercionWorker] Base de datos no disponible");
    return;
  }

  try {
    console.log("[DesercionWorker] Iniciando detección de alertas de deserción");

    // Obtener todas las instituciones activas
    const instituciones = await db
      .select()
      .from(institucion)
      .where(eq(institucion.estado, "Activo"));

    console.log(
      `[DesercionWorker] Procesando ${instituciones.length} instituciones`
    );

    for (const inst of instituciones) {
      await procesarInstitucion(db, inst.id);
    }

    console.log("[DesercionWorker] Detección de alertas completada");
  } catch (error) {
    console.error(
      "[DesercionWorker] Error:",
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
}

async function procesarInstitucion(db: any, institucion_id: number) {
  try {
    // Calcular rango de fechas (últimos 7 días)
    const hoy = new Date();
    const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Obtener estadísticas de faltas por alumno en los últimos 7 días
    const faltasStats = await db
      .select({
        alumno_id: asistencia_iot.alumno_id,
        institucion_id: asistencia_iot.institucion_id,
        cantidad_faltas: sql<number>`COUNT(*)`,
      })
      .from(asistencia_iot)
      .where(
        and(
          eq(asistencia_iot.institucion_id, institucion_id),
          eq(asistencia_iot.estado, "Ausente"),
          gte(asistencia_iot.timestamp, hace7dias),
          lt(asistencia_iot.timestamp, hoy)
        )
      )
      .groupBy(asistencia_iot.alumno_id, asistencia_iot.institucion_id);

    console.log(
      `[DesercionWorker] Institución ${institucion_id}: ${faltasStats.length} alumnos con faltas`
    );

    for (const stat of faltasStats as DesercionStats[]) {
      const { alumno_id, cantidad_faltas } = stat;

      // Determinar nivel de riesgo
      let nivel_riesgo: "Bajo" | "Medio" | "Alto";
      if (cantidad_faltas >= 3) {
        nivel_riesgo = "Alto";
      } else if (cantidad_faltas >= 2) {
        nivel_riesgo = "Medio";
      } else {
        nivel_riesgo = "Bajo";
      }

      // Verificar si ya existe alerta Pendiente para este alumno
      const alertaExistente = await db
        .select()
        .from(alertas_desercion)
        .where(
          and(
            eq(alertas_desercion.alumno_id, alumno_id),
            eq(alertas_desercion.institucion_id, institucion_id),
            eq(alertas_desercion.estado_revision, "Pendiente")
          )
        )
        .limit(1);

      if (alertaExistente.length > 0) {
        // Actualizar alerta existente si el nivel de riesgo cambió
        const alertaActual = alertaExistente[0];
        if (alertaActual.nivel_riesgo !== nivel_riesgo) {
          await db
            .update(alertas_desercion)
            .set({
              nivel_riesgo,
              razon: `${cantidad_faltas} inasistencias en los últimos 7 días`,
              fecha_deteccion: new Date(),
            })
            .where(eq(alertas_desercion.id, alertaActual.id));

          console.log(
            `[DesercionWorker] Alerta actualizada: Alumno ${alumno_id}, Riesgo ${nivel_riesgo}`
          );
        }
      } else {
        // Crear nueva alerta
        await db.insert(alertas_desercion).values({
          institucion_id,
          alumno_id,
          nivel_riesgo,
          razon: `${cantidad_faltas} inasistencias en los últimos 7 días`,
          estado_revision: "Pendiente",
          fecha_deteccion: new Date(),
        });

        console.log(
          `[DesercionWorker] Alerta creada: Alumno ${alumno_id}, Riesgo ${nivel_riesgo}`
        );
      }
    }

    // Resolver alertas de alumnos que ya no tienen faltas
    const alertasPendientes = await db
      .select()
      .from(alertas_desercion)
      .where(
        and(
          eq(alertas_desercion.institucion_id, institucion_id),
          eq(alertas_desercion.estado_revision, "Pendiente")
        )
      );

    for (const alerta of alertasPendientes) {
      // Verificar si el alumno aún tiene faltas
      const faltasActuales = await db
        .select({
          cantidad_faltas: sql<number>`COUNT(*)`,
        })
        .from(asistencia_iot)
        .where(
          and(
            eq(asistencia_iot.alumno_id, alerta.alumno_id),
            eq(asistencia_iot.institucion_id, institucion_id),
            eq(asistencia_iot.estado, "Ausente"),
            gte(asistencia_iot.timestamp, hace7dias),
            lt(asistencia_iot.timestamp, hoy)
          )
        );

      if (
        faltasActuales.length === 0 ||
        faltasActuales[0].cantidad_faltas < 2
      ) {
        // Marcar alerta como resuelta
        await db
          .update(alertas_desercion)
          .set({
            estado_revision: "Resuelto",
            notas_director: "Alumno ha mejorado asistencia",
          })
          .where(eq(alertas_desercion.id, alerta.id));

        console.log(
          `[DesercionWorker] Alerta resuelta: Alumno ${alerta.alumno_id}`
        );
      }
    }
  } catch (error) {
    console.error(
      `[DesercionWorker] Error procesando institución ${institucion_id}:`,
      error instanceof Error ? error.message : "Error desconocido"
    );
  }
}

export default detectarAlertasDesercion;
