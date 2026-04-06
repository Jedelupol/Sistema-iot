import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "director", "profesor"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabla de Profesores
export const profesores = mysqlTable("profesores", {
  id: int("id").autoincrement().primaryKey(),
  dni: varchar("dni", { length: 20 }).notNull().unique(),
  nombres: varchar("nombres", { length: 100 }).notNull(),
  apellidoPaterno: varchar("apellidoPaterno", { length: 100 }).notNull(),
  apellidoMaterno: varchar("apellidoMaterno", { length: 100 }).notNull(),
  genero: mysqlEnum("genero", ["M", "F", "Otro"]).notNull(),
  fechaNacimiento: date("fechaNacimiento").notNull(),
  usuarioId: int("usuarioId"),
  especialidad: varchar("especialidad", { length: 100 }),
  telefono: varchar("telefono", { length: 20 }),
  email: varchar("email", { length: 320 }),
  estado: mysqlEnum("estado", ["activo", "inactivo"]).default("activo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profesor = typeof profesores.$inferSelect;
export type InsertProfesor = typeof profesores.$inferInsert;

// Tabla de Alumnos
export const alumnos = mysqlTable("alumnos", {
  id: int("id").autoincrement().primaryKey(),
  dni: varchar("dni", { length: 20 }).notNull().unique(),
  nombres: varchar("nombres", { length: 100 }).notNull(),
  apellidoPaterno: varchar("apellidoPaterno", { length: 100 }).notNull(),
  apellidoMaterno: varchar("apellidoMaterno", { length: 100 }).notNull(),
  genero: mysqlEnum("genero", ["M", "F", "Otro"]).notNull(),
  fechaNacimiento: date("fechaNacimiento").notNull(),
  rfidTag: varchar("rfidTag", { length: 50 }).notNull().unique(),
  usuarioId: int("usuarioId"),
  grado: varchar("grado", { length: 20 }),
  seccion: varchar("seccion", { length: 20 }),
  telefono: varchar("telefono", { length: 20 }),
  email: varchar("email", { length: 320 }),
  estado: mysqlEnum("estado", ["activo", "inactivo"]).default("activo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Alumno = typeof alumnos.$inferSelect;
export type InsertAlumno = typeof alumnos.$inferInsert;

// Tabla de Matrícula
export const matricula = mysqlTable("matricula", {
  id: int("id").autoincrement().primaryKey(),
  alumnoId: int("alumnoId").notNull(),
  grado: varchar("grado", { length: 20 }).notNull(),
  seccion: varchar("seccion", { length: 20 }).notNull(),
  anio: int("anio").notNull(),
  estado: mysqlEnum("estado", ["activo", "inactivo", "retirado"]).default("activo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Matricula = typeof matricula.$inferSelect;
export type InsertMatricula = typeof matricula.$inferInsert;

// Tabla de Asistencia IoT
export const asistenciaIot = mysqlTable("asistenciaIot", {
  id: int("id").autoincrement().primaryKey(),
  alumnoId: int("alumnoId").notNull(),
  rfidUid: varchar("rfidUid", { length: 50 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  tipoEvento: mysqlEnum("tipoEvento", ["entrada", "salida", "otro"]).default("entrada").notNull(),
  estado: mysqlEnum("estado", ["registrado", "notificado", "error"]).default("registrado").notNull(),
  notificacionEnviada: boolean("notificacionEnviada").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AsistenciaIot = typeof asistenciaIot.$inferSelect;
export type InsertAsistenciaIot = typeof asistenciaIot.$inferInsert;

// Tabla de Logs de Acceso
export const logsAcceso = mysqlTable("logsAcceso", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  accion: varchar("accion", { length: 255 }).notNull(),
  modulo: varchar("modulo", { length: 100 }).notNull(),
  detalles: text("detalles"),
  direccionIp: varchar("direccionIp", { length: 50 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type LogAcceso = typeof logsAcceso.$inferSelect;
export type InsertLogAcceso = typeof logsAcceso.$inferInsert;