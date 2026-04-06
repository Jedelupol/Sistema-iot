# sos docente - Plataforma SaaS (Marca Blanca) - Project TODO

## ARQUITECTURA CORE - 4 PILARES OBLIGATORIOS

### PILAR 1: Núcleo SaaS (Marca Blanca) y Licenciamiento
- [x] Crear tabla `institucion` con campos: id, nombre, codigo_modular, logo_url, color_primario
- [x] Implementar niveles_activos (ENUM: Primaria, Secundaria, Ambos)
- [x] Implementar turnos (ENUM: Mañana, Tarde, Ambos)
- [x] Implementar tipo_licencia (ENUM: BASICA, PRO, ELITE)
- [x] Implementar modulos_autorizados (JSON: ["iot", "siagie", "whatsapp", etc])
- [x] Agregar campos de vencimiento de licencia
- [x] Crear lógica de validación por licencia en routers tRPC
- [x] Implementar middleware que bloquea acceso a módulos no autorizados

### PILAR 2: Identidad Estudiantil e Importador SIAGIE
- [x] Crear tabla `alumnos` con codigo_siagie (14 dígitos) como PRIMARY KEY UNIQUE
- [x] Mantener dni (8 dígitos) como UNIQUE pero permitiendo nulos
- [x] Agregar campos: nombres, apellido_paterno, apellido_materno, genero, fecha_nacimiento
- [x] Agregar campos: rfid_tag, grado, seccion, nivel (Primaria/Secundaria), estado, fecha_matricula
- [x] Crear endpoint POST `/api/importar/acta-siagie` para importación masiva
- [x] Implementar parser de Excel/CSV que localiza columna de estudiantes
- [x] Implementar lógica de UPSERT basada en codigo_siagie
- [x] Crear tabla `importaciones_siagie` para auditoría de importaciones
- [x] Validar que codigo_siagie no se duplica durante importación

### PILAR 3: Horarios Dinámicos y Motor de Asistencia IoT
- [x] Crear tabla `sesiones_docente` con: profesor_id, dia_semana, hora_inicio, hora_fin, curso
- [x] Agregar campos: grado, seccion, aula, estado
- [x] Crear tabla `asistencia_iot` con: rfid_uid, timestamp, tipo_evento (Entrada/Salida), estado
- [x] Agregar campo sesion_id para vincular con sesiones_docente
- [x] Agregar campo estado (Puntual/Tardanza/Ausente)
- [x] Actualizar endpoint POST `/api/iot/asistencia` para:
  - [x] Recibir rfidUid del ESP32
  - [x] Validar que RFID existe en alumnos o profesores
  - [x] Buscar sesiones_docente del día actual
  - [x] Comparar timestamp contra hora_inicio para calcular estado
  - [x] Registrar asistencia con estado automático
  - [x] Retornar datos del alumno/profesor para notificaciones
- [x] Crear lógica de cálculo: Puntual (timestamp <= hora_inicio), Tardanza (timestamp > hora_inicio)

### PILAR 4: Alertas Tempranas de Deserción
- [x] Crear tabla `alertas_desercion` con: alumno_id, nivel_riesgo, fecha_deteccion, estado_revision
- [x] Agregar campos: razon, revisado_por, fecha_revision, notas_director
- [x] Agregar campo estado_revision (Pendiente/Revisado/Resuelto/Descartado)
- [x] Crear worker/CRON que ejecute semanalmente:
  - [x] Evalúa tabla asistencia_iot de los últimos 7 días
  - [x] Cuenta faltas por alumno (registros con estado = "Ausente")
  - [x] Si alumno >= 3 faltas en 7 días: inserta alerta con nivel_riesgo = "Alto"
  - [x] Si alumno >= 2 faltas en 7 días: inserta alerta con nivel_riesgo = "Medio"
  - [x] Evita duplicados: no inserta si ya existe alerta Pendiente para ese alumno
- [x] Crear endpoint GET `/api/alertas/desercion` para dashboard del director
- [x] Crear notificación automática al director cuando se detecta alerta

---

## FASE 2: GENERACIÓN DE MIGRACIONES SQL
- [x] Ejecutar `pnpm drizzle-kit generate` para generar SQL
- [x] Revisar archivo SQL generado en `drizzle/`
- [x] Verificar relaciones One-to-Many correctas
- [x] Aplicar migración con `pnpm exec drizzle-kit migrate`

---

## FASE 3: ACTUALIZAR ROUTERS tRPC CON VALIDACIÓN POR LICENCIA
- [x] Crear middleware `checkLicense` que valida tipo_licencia e institucion_id
- [x] Crear middleware `checkModuleAccess` que valida modulos_autorizados
- [x] Crear router institucion con endpoints de validación
- [x] Bloquear acceso a módulos no autorizados con error FORBIDDEN
- [x] Crear endpoint GET `/api/institucion/licencia` para obtener estado actual

---

## FASE 4: ENDPOINT DE IMPORTACIÓN SIAGIE
- [x] Crear endpoint POST `/api/importar/acta-siagie`
- [x] Implementar validación de archivo (Excel/CSV)
- [x] Implementar parser que localiza columna de estudiantes
- [x] Implementar UPSERT masivo basado en codigo_siagie
- [x] Registrar importación en tabla `importaciones_siagie`
- [x] Retornar resumen: cantidad_registros, cantidad_exitosos, cantidad_errores
- [x] Crear endpoint GET `/api/importar/historial` para ver historial de importaciones

---

## FASE 5: WORKER CRON PARA ALERTAS DE DESERCIÓN
- [x] Crear archivo `server/workers/desercionWorker.ts`
- [x] Implementar función que evalúa asistencias de últimos 7 días
- [x] Implementar lógica de conteo de faltas por alumno
- [x] Implementar inserción de alertas automáticas
- [x] Registrar worker en `server/_core/index.ts` con schedule semanal
- [x] Crear logs para auditoría de ejecución del worker

---

## FASE 6: VALIDACIÓN FINAL DE ARQUITECTURA
- [x] Verificar que todas las relaciones One-to-Many funcionan correctamente
- [x] Verificar que codigo_siagie es la llave principal de búsqueda
- [x] Verificar que licencia bloquea módulos no autorizados
- [x] Verificar que sesiones_docente calcula estado de asistencia correctamente
- [x] Verificar que alertas de deserción se generan automáticamente
- [x] Crear checkpoint de arquitectura core

---

## MÓDULOS FUNCIONALES
- [x] Dashboard con estadísticas por institucion
- [x] Módulo Profesores (CRUD)
- [x] Módulo Alumnos (CRUD)
- [x] Módulo Matrícula (CRUD)
- [x] Módulo Asistencia IoT (Monitor en tiempo real)
- [x] Módulo Consultas (Búsqueda avanzada)
- [x] Módulo Informes (Reportes PDF/Excel)
- [x] Módulo Seguridad (Gestión de usuarios y roles)
- [x] Simulador SITL (Pruebas IoT)
- [x] Integración CallMeBot WhatsApp (Notificaciones)

---

## FRONTEND - COMPONENTES Y LAYOUT
- [x] DashboardLayoutSaas con Sidebar colapsable
- [x] Componente useModuleState (Zustand)
- [x] Página DashboardMain con gráficos (Recharts)
- [x] Página ProfesoresPage con tabla y modal CRUD
- [x] Página AlumnosPage con tabla y modal CRUD
- [x] Página MatriculaPage con importador SIAGIE
- [x] Página MonitorIoT con monitor en tiempo real
- [x] Página SimuladorSITL para pruebas manuales
- [x] Página ConsultasPage con búsqueda avanzada
- [x] Página InformesPage con generador de reportes
- [x] Página SeguridadPage con gestión de usuarios
- [x] App.tsx actualizado con rutas y autenticación
- [x] Servicio CallMeBotService para notificaciones WhatsApp
- [x] Todos los errores de TypeScript corregidos
- [x] Servidor compilando sin errores
- [x] Pantalla de login verificada y funcional

---

## NOTAS ARQUITECTÓNICAS
- Base de datos: MySQL (Drizzle ORM)
- Identificador principal de alumno: codigo_siagie (MINEDU)
- Identificador secundario de alumno: dni (puede ser nulo)
- Motor de asistencia: Basado en sesiones_docente dinámicas
- Cálculo de estado: Comparación timestamp vs hora_inicio
- Alertas: Generadas automáticamente por worker CRON semanal
- Licenciamiento: Controla qué módulos ve cada institución
