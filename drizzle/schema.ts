import {
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  mysqlTable,
  json,
  decimal,
  boolean,
  uniqueIndex,
  foreignKey,
  index,
  datetime,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * ============================================================================
 * PILAR 1: NÚCLEO SaaS (MARCA BLANCA) Y LICENCIAMIENTO
 * ============================================================================
 * Tabla institucion: Contiene datos de cada institución educativa con su
 * configuración de licencia y módulos autorizados.
 */
export const institucion = mysqlTable(
  "institucion",
  {
    id: int("id").autoincrement().primaryKey(),
    nombre: varchar("nombre", { length: 255 }).notNull(),
    codigo_modular: varchar("codigo_modular", { length: 7 }).notNull().unique(),
    logo_url: text("logo_url"),
    color_primario: varchar("color_primario", { length: 7 }).default("#3498db"),
    niveles_activos: mysqlEnum("niveles_activos", [
      "Primaria",
      "Secundaria",
      "Ambos",
    ]).default("Ambos"),
    turnos: mysqlEnum("turnos", ["Mañana", "Tarde", "Ambos"]).default("Ambos"),
    tipo_licencia: mysqlEnum("tipo_licencia", ["BASICA", "PRO", "ELITE"])
      .default("BASICA")
      .notNull(),
    modulos_autorizados: json("modulos_autorizados")
      .$type<string[]>()
      .default(["dashboard", "profesores", "alumnos"]),
    fecha_inicio_licencia: timestamp("fecha_inicio_licencia").defaultNow(),
    fecha_vencimiento_licencia: timestamp("fecha_vencimiento_licencia"),
    estado: mysqlEnum("estado", ["Activo", "Inactivo", "Suspendido"])
      .default("Activo")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codigoModularIdx: uniqueIndex("idx_codigo_modular").on(
      table.codigo_modular
    ),
  })
);

export type Institucion = typeof institucion.$inferSelect;
export type InsertInstitucion = typeof institucion.$inferInsert;

/**
 * ============================================================================
 * TABLA USERS (USUARIOS DEL SISTEMA - DOCENTES, DIRECTORES, ADMIN)
 * ============================================================================
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    institucion_id: int("institucion_id").notNull(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    nombre: text("nombre"),
    email: varchar("email", { length: 320 }).unique(),
    dni: varchar("dni", { length: 8 }).unique(),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["admin", "director", "profesor", "user"])
      .default("user")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    institucionFk: foreignKey({
      columns: [table.institucion_id],
      foreignColumns: [institucion.id],
    }),
    institucionIdx: index("idx_users_institucion").on(table.institucion_id),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * ============================================================================
 * PILAR 2: IDENTIDAD ESTUDIANTIL E IMPORTADOR SIAGIE
 * ============================================================================
 * Tabla alumnos: Identificador principal es codigo_siagie (14 dígitos MINEDU).
 * El DNI es secundario y puede ser nulo (para alumnos sin DNI aún).
 * Llave de importación: codigo_siagie (UNIQUE).
 */
export const alumnos = mysqlTable(
  "alumnos",
  {
    id: int("id").autoincrement().primaryKey(),
    institucion_id: int("institucion_id").notNull(),
    codigo_siagie: varchar("codigo_siagie", { length: 14 }).notNull().unique(),
    dni: varchar("dni", { length: 8 }).unique(),
    nombres: varchar("nombres", { length: 255 }).notNull(),
    apellido_paterno: varchar("apellido_paterno", { length: 255 }).notNull(),
    apellido_materno: varchar("apellido_materno", { length: 255 }).notNull(),
    genero: mysqlEnum("genero", ["M", "F", "Otro"]).default("M"),
    fecha_nacimiento: timestamp("fecha_nacimiento"),
    rfid_tag: varchar("rfid_tag", { length: 50 }).unique(),
    grado: varchar("grado", { length: 10 }),
    seccion: varchar("seccion", { length: 10 }),
    nivel: mysqlEnum("nivel", ["Primaria", "Secundaria"]).default("Primaria"),
    estado: mysqlEnum("estado", ["Activo", "Inactivo", "Retirado"])
      .default("Activo")
      .notNull(),
    fecha_matricula: timestamp("fecha_matricula").defaultNow(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    institucionFk: foreignKey({
      columns: [table.institucion_id],
      foreignColumns: [institucion.id],
    }),
    codigoSiagieFk: uniqueIndex("idx_codigo_siagie").on(table.codigo_siagie),
    dniFk: uniqueIndex("idx_dni").on(table.dni),
    institucionIdx: index("idx_alumnos_institucion").on(table.institucion_id),
    estadoIdx: index("idx_alumnos_estado").on(table.estado),
  })
);

export type Alumno = typeof alumnos.$inferSelect;
export type InsertAlumno = typeof alumnos.$inferInsert;

/**
 * ============================================================================
 * TABLA PROFESORES
 * ============================================================================
 */
export const profesores = mysqlTable(
  "profesores",
  {
    id: int("id").autoincrement().primaryKey(),
    institucion_id: int("institucion_id").notNull(),
    user_id: int("user_id").notNull(),
    dni: varchar("dni", { length: 8 }).unique(),
    nombres: varchar("nombres", { length: 255 }).notNull(),
    apellido_paterno: varchar("apellido_paterno", { length: 255 }).notNull(),
    apellido_materno: varchar("apellido_materno", { length: 255 }).notNull(),
    especialidad: varchar("especialidad", { length: 255 }),
    rfid_tag: varchar("rfid_tag", { length: 50 }).unique(),
    estado: mysqlEnum("estado", ["Activo", "Inactivo", "Licencia"])
      .default("Activo")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    institucionFk: foreignKey({
      columns: [table.institucion_id],
      foreignColumns: [institucion.id],
    }),
    userFk: foreignKey({
      columns: [table.user_id],
      foreignColumns: [users.id],
    }),
    institucionIdx: index("idx_profesores_institucion").on(
      table.institucion_id
    ),
  })
);

export type Profesor = typeof profesores.$inferSelect;
export type InsertProfesor = typeof profesores.$inferInsert;

/**
 * ============================================================================
 * PILAR 3: HORARIOS DINÁMICOS Y MOTOR DE ASISTENCIA IoT
 * ============================================================================
 * Tabla sesiones_docente: Define el horario de cada docente por día de semana.
 * Permite múltiples sesiones por día (ej: profesor de secundaria con 3 cursos).
 * El endpoint IoT usará esta tabla para validar asistencia en horarios dinámicos.
 */
export const sesiones_docente = mysqlTable(
  "sesiones_docente",
  {
    id: int("id").autoincrement().primaryKey(),
    profesor_id: int("profesor_id").notNull(),
    institucion_id: int("institucion_id").notNull(),
    dia_semana: mysqlEnum("dia_semana", [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
      "Domingo",
    ]).notNull(),
    hora_inicio: varchar("hora_inicio", { length: 5 }).notNull(), // HH:MM
    hora_fin: varchar("hora_fin", { length: 5 }).notNull(), // HH:MM
    curso: varchar("curso", { length: 255 }).notNull(),
    grado: varchar("grado", { length: 10 }),
    seccion: varchar("seccion", { length: 10 }),
    aula: varchar("aula", { length: 50 }),
    estado: mysqlEnum("estado", ["Activo", "Cancelado"]).default("Activo"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    profesorFk: foreignKey({
      columns: [table.profesor_id],
      foreignColumns: [profesores.id],
    }),
    institucionFk: foreignKey({
      columns: [table.institucion_id],
      foreignColumns: [institucion.id],
    }),
    profesorIdx: index("idx_sesiones_profesor").on(table.profesor_id),
    institucionIdx: index("idx_sesiones_institucion").on(table.institucion_id),
    diaSemanIdx: index("idx_sesiones_dia").on(table.dia_semana),
  })
);

export type SesionDocente = typeof sesiones_docente.$inferSelect;
export type InsertSesionDocente = typeof sesiones_docente.$inferInsert;

/**
 * ============================================================================
 * TABLA ASISTENCIA IoT
 * ============================================================================
 * Registra cada escaneo RFID con validación contra sesiones_docente.
 * Estado calculado: Puntual (dentro de hora_inicio), Tardanza (después de hora_inicio).
 */
export const asistencia_iot = mysqlTable(
  "asistencia_iot",
  {
    id: int("id").autoincrement().primaryKey(),
    institucion_id: int("institucion_id").notNull(),
    profesor_id: int("profesor_id"),
    alumno_id: int("alumno_id"),
    rfid_uid: varchar("rfid_uid", { length: 50 }).notNull(),
    tipo_evento: mysqlEnum("tipo_evento", ["Entrada", "Salida"]).default(
      "Entrada"
    ),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    estado: mysqlEnum("estado", ["Puntual", "Tardanza", "Ausente"])
      .default("Puntual")
      .notNull(),
    sesion_id: int("sesion_id"),
    notas: text("notas"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    institucionFk: foreignKey({
      columns: [table.institucion_id],
      foreignColumns: [institucion.id],
    }),
    profesorFk: foreignKey({
      columns: [table.profesor_id],
      foreignColumns: [profesores.id],
    }),
    alumnoFk: foreignKey({
      columns: [table.alumno_id],
      foreignColumns: [alumnos.id],
    }),
    sesionFk: foreignKey({
      columns: [table.sesion_id],
      foreignColumns: [sesiones_docente.id],
    }),
    institucionIdx: index("idx_asistencia_institucion").on(
      table.institucion_id
    ),
    timestampIdx: index("idx_asistencia_timestamp").on(table.timestamp),
    rfidIdx: index("idx_asistencia_rfid").on(table.rfid_uid),
  })
);

export type AsistenciaIot = typeof asistencia_iot.$inferSelect;
export type InsertAsistenciaIot = typeof asistencia_iot.$inferInsert;

/**
 * ============================================================================
 * PILAR 4: ALERTAS TEMPRANAS DE DESERCIÓN
 * ============================================================================
 * Tabla alertas_desercion: Registra incidencias de riesgo de deserción.
 * Trigger/CRON: Evalúa semanalmente. Si alumno acumula 3 faltas en 7 días,
 * inserta alerta automáticamente.
 */
export const alertas_desercion = mysqlTable(
  "alertas_desercion",
  {
    id: int("id").autoincrement().primaryKey(),
    institucion_id: int("institucion_id").notNull(),
    alumno_id: int("alumno_id").notNull(),
    nivel_riesgo: mysqlEnum("nivel_riesgo", ["Bajo", "Medio", "Alto"])
      .default("Medio")
      .notNull(),
    razon: text("razon"),
    fecha_deteccion: timestamp("fecha_deteccion").defaultNow().notNull(),
    estado_revision: mysqlEnum("estado_revision", [
      "Pendiente",
      "Revisado",
      "Resuelto",
      "Descartado",
    ])
      .default("Pendiente")
      .notNull(),
    revisado_por: int("revisado_por"),
    fecha_revision: timestamp("fecha_revision"),
    notas_director: text("notas_director"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    institucionFk: foreignKey({
      columns: [table.institucion_id],
      foreignColumns: [institucion.id],
    }),
    alumnoFk: foreignKey({
      columns: [table.alumno_id],
      foreignColumns: [alumnos.id],
    }),
    revisadoPorFk: foreignKey({
      columns: [table.revisado_por],
      foreignColumns: [users.id],
    }),
    institucionIdx: index("idx_alertas_institucion").on(table.institucion_id),
    alumnoIdx: index("idx_alertas_alumno").on(table.alumno_id),
    estadoIdx: index("idx_alertas_estado").on(table.estado_revision),
    fechaDeteccionIdx: index("idx_alertas_fecha").on(table.fecha_deteccion),
  })
);

export type AlertaDesercion = typeof alertas_desercion.$inferSelect;
export type InsertAlertaDesercion = typeof alertas_desercion.$inferInsert;

/**
 * ============================================================================
 * TABLA IMPORTACIONES SIAGIE
 * ============================================================================
 * Registra cada importación masiva de actas SIAGIE para auditoría.
 */
export const importaciones_siagie = mysqlTable(
  "importaciones_siagie",
  {
    id: int("id").autoincrement().primaryKey(),
    institucion_id: int("institucion_id").notNull(),
    usuario_id: int("usuario_id").notNull(),
    nombre_archivo: varchar("nombre_archivo", { length: 255 }).notNull(),
    cantidad_registros: int("cantidad_registros").default(0),
    cantidad_exitosos: int("cantidad_exitosos").default(0),
    cantidad_errores: int("cantidad_errores").default(0),
    estado: mysqlEnum("estado", ["Procesando", "Completado", "Error"])
      .default("Procesando"),
    detalles_error: text("detalles_error"),
    fecha_importacion: timestamp("fecha_importacion").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    institucionFk: foreignKey({
      columns: [table.institucion_id],
      foreignColumns: [institucion.id],
    }),
    usuarioFk: foreignKey({
      columns: [table.usuario_id],
      foreignColumns: [users.id],
    }),
    institucionIdx: index("idx_importaciones_institucion").on(
      table.institucion_id
    ),
  })
);

export type ImportacionSiagie = typeof importaciones_siagie.$inferSelect;
export type InsertImportacionSiagie = typeof importaciones_siagie.$inferInsert;

/**
 * ============================================================================
 * RELACIONES (Drizzle Relations)
 * ============================================================================
 */
export const institucionRelations = relations(institucion, ({ many }) => ({
  users: many(users),
  alumnos: many(alumnos),
  profesores: many(profesores),
  sesiones: many(sesiones_docente),
  asistencias: many(asistencia_iot),
  alertas: many(alertas_desercion),
  importaciones: many(importaciones_siagie),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  institucion: one(institucion, {
    fields: [users.institucion_id],
    references: [institucion.id],
  }),
  profesores: many(profesores),
  alertasRevisadas: many(alertas_desercion),
}));

export const alumnosRelations = relations(alumnos, ({ one, many }) => ({
  institucion: one(institucion, {
    fields: [alumnos.institucion_id],
    references: [institucion.id],
  }),
  asistencias: many(asistencia_iot),
  alertas: many(alertas_desercion),
}));

export const profesoresRelations = relations(profesores, ({ one, many }) => ({
  institucion: one(institucion, {
    fields: [profesores.institucion_id],
    references: [institucion.id],
  }),
  user: one(users, {
    fields: [profesores.user_id],
    references: [users.id],
  }),
  sesiones: many(sesiones_docente),
  asistencias: many(asistencia_iot),
}));

export const sesionesDocenteRelations = relations(
  sesiones_docente,
  ({ one, many }) => ({
    institucion: one(institucion, {
      fields: [sesiones_docente.institucion_id],
      references: [institucion.id],
    }),
    profesor: one(profesores, {
      fields: [sesiones_docente.profesor_id],
      references: [profesores.id],
    }),
    asistencias: many(asistencia_iot),
  })
);

export const asistenciaIotRelations = relations(
  asistencia_iot,
  ({ one }) => ({
    institucion: one(institucion, {
      fields: [asistencia_iot.institucion_id],
      references: [institucion.id],
    }),
    profesor: one(profesores, {
      fields: [asistencia_iot.profesor_id],
      references: [profesores.id],
    }),
    alumno: one(alumnos, {
      fields: [asistencia_iot.alumno_id],
      references: [alumnos.id],
    }),
    sesion: one(sesiones_docente, {
      fields: [asistencia_iot.sesion_id],
      references: [sesiones_docente.id],
    }),
  })
);

export const alertasDesercionRelations = relations(
  alertas_desercion,
  ({ one }) => ({
    institucion: one(institucion, {
      fields: [alertas_desercion.institucion_id],
      references: [institucion.id],
    }),
    alumno: one(alumnos, {
      fields: [alertas_desercion.alumno_id],
      references: [alumnos.id],
    }),
    revisadoPor: one(users, {
      fields: [alertas_desercion.revisado_por],
      references: [users.id],
    }),
  })
);

export const importacionesSiagiRelations = relations(
  importaciones_siagie,
  ({ one }) => ({
    institucion: one(institucion, {
      fields: [importaciones_siagie.institucion_id],
      references: [institucion.id],
    }),
    usuario: one(users, {
      fields: [importaciones_siagie.usuario_id],
      references: [users.id],
    }),
  })
);
