import { eq } from "drizzle-orm";
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
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
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
export async function getProfesores() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(profesores);
}

export async function getProfesorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profesores).where(eq(profesores.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProfesor(data: InsertProfesor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(profesores).values(data);
  return result;
}

export async function updateProfesor(id: number, data: Partial<InsertProfesor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(profesores).set(data).where(eq(profesores.id, id));
}

export async function deleteProfesor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(profesores).where(eq(profesores.id, id));
}

// Queries para Alumnos
export async function getAlumnos() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(alumnos);
}

export async function getAlumnoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(alumnos).where(eq(alumnos.id, id)).limit(1);
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

export async function updateAlumno(id: number, data: Partial<InsertAlumno>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(alumnos).set(data).where(eq(alumnos.id, id));
}

export async function deleteAlumno(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(alumnos).where(eq(alumnos.id, id));
}

// Queries para Matrícula
export async function getMatriculas() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(matricula);
}

export async function getMatriculaByAlumnoId(alumnoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(matricula).where(eq(matricula.alumnoId, alumnoId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMatricula(data: InsertMatricula) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(matricula).values(data);
  return result;
}

export async function updateMatricula(id: number, data: Partial<InsertMatricula>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(matricula).set(data).where(eq(matricula.id, id));
}

// Queries para Asistencia IoT
export async function getAsistenciasIot() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(asistenciaIot);
}

export async function getAsistenciasByAlumnoId(alumnoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(asistenciaIot).where(eq(asistenciaIot.alumnoId, alumnoId));
}

export async function createAsistenciaIot(data: InsertAsistenciaIot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(asistenciaIot).values(data);
  return result;
}

export async function updateAsistenciaIot(id: number, data: Partial<InsertAsistenciaIot>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(asistenciaIot).set(data).where(eq(asistenciaIot.id, id));
}
