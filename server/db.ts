import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, profesores, alumnos, Profesor, InsertProfesor, Alumno, InsertAlumno, asistencia_iot, InsertAsistenciaIot, alertas_desercion } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      institucion_id: user.institucion_id || 1,
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["nombre", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Queries para Profesores
export async function getProfesores(institucionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(profesores).where(eq(profesores.institucion_id, institucionId));
}

export async function getProfesorById(id: number, institucionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profesores).where(and(eq(profesores.id, id), eq(profesores.institucion_id, institucionId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProfesor(data: InsertProfesor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(profesores).values(data);
  return result;
}

export async function updateProfesor(id: number, data: Partial<InsertProfesor>, institucionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(profesores).set(data).where(and(eq(profesores.id, id), eq(profesores.institucion_id, institucionId)));
}

export async function deleteProfesor(id: number, institucionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(profesores).where(and(eq(profesores.id, id), eq(profesores.institucion_id, institucionId)));
}

// Queries para Alumnos
export async function getAlumnos(institucionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(alumnos).where(eq(alumnos.institucion_id, institucionId));
}

export async function getAlumnoById(id: number, institucionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(alumnos).where(and(eq(alumnos.id, id), eq(alumnos.institucion_id, institucionId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAlumnoByRfidTag(rfidTag: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(alumnos).where(eq(alumnos.rfid_tag, rfidTag)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAlumno(data: InsertAlumno) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(alumnos).values(data);
  return result;
}

export async function updateAlumno(id: number, data: Partial<InsertAlumno>, institucionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(alumnos).set(data).where(and(eq(alumnos.id, id), eq(alumnos.institucion_id, institucionId)));
}

export async function deleteAlumno(id: number, institucionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(alumnos).where(and(eq(alumnos.id, id), eq(alumnos.institucion_id, institucionId)));
}

// Queries para Matrícula (integrada en tabla alumnos)

// Queries para Asistencia IoT
export async function getAsistenciasIot() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(asistencia_iot);
}

export async function getAsistenciasByAlumnoId(alumnoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(asistencia_iot).where(eq(asistencia_iot.alumno_id, alumnoId));
}

export async function createAsistenciaIot(data: InsertAsistenciaIot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(asistencia_iot).values(data);
  return result;
}

export async function updateAsistenciaIot(id: number, data: Partial<InsertAsistenciaIot>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(asistencia_iot).set(data).where(eq(asistencia_iot.id, id));
}
