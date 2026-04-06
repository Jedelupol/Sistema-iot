# San Jerónimo IoT - Project TODO

## Fase 1: Configuración Base y Estructura
- [x] Configurar MongoDB schema con colecciones: users, profesores, alumnos, matricula, asistencia_iot, roles
- [x] Implementar autenticación con roles (Admin/Director/Profesor)
- [x] Crear endpoints API base para CRUD de entidades principales
- [ ] Configurar variables de entorno para integración IoT y CallMeBot

## Fase 2: Identidad Visual e Interfaz Principal
- [x] Crear theme.css institucional con paleta de colores (#3498db azul, #e74c3c rojo, gris oscuro)
- [x] Implementar Layout Principal: Header fijo con logo I.E. San Jerónimo
- [x] Implementar Sidebar oscuro con iconos y navegación
- [x] Implementar Footer con créditos © 2026 I.E. San Jerónimo - V 3.0.0
- [x] Configurar componentes base (cards, buttons, modales) con estilos institucionales

## Fase 3: Dashboard
- [x] Crear vista Dashboard con 4 tarjetas de estadísticas (total profesores, total alumnos, asistencias hoy, pendientes)
- [x] Implementar gráfico de flujo semanal de asistencia (recharts)
- [ ] Conectar datos en tiempo real desde backend
- [ ] Añadir filtros por fecha y rango

## Fase 4: Módulo Profesores
- [x] Crear schema MongoDB para profesores (DNI, nombres, apellidos, género, fecha nacimiento, usuario, contraseña)
- [x] Implementar CRUD completo (Create, Read, Update, Delete)
- [x] Crear formulario modal para registro/edición de profesores
- [x] Implementar listado con paginación y filtros (DNI, nombre, apellido)
- [x] Validar campos obligatorios en backend
- [x] Crear endpoints API: GET /api/profesores, POST /api/profesores, PUT /api/profesores/:id, DELETE /api/profesores/:id

## Fase 5: Módulo Alumnos
- [x] Crear schema MongoDB para alumnos (DNI, nombres, apellidos, género, fecha nacimiento, RFID Tag, usuario, contraseña, grado, sección)
- [x] Implementar CRUD completo
- [x] Crear formulario modal para registro/edición con campo RFID Tag obligatorio
- [x] Implementar listado con paginación, filtros y búsqueda avanzada
- [x] Crear vista de historial de asistencia por alumno
- [x] Crear endpoints API: GET /api/alumnos, POST /api/alumnos, PUT /api/alumnos/:id, DELETE /api/alumnos/:id, GET /api/alumnos/:id/asistencia

## Fase 6: Módulo Matrícula
- [ ] Crear schema MongoDB para matrícula (alumno_id, grado, sección, año, estado)
- [ ] Implementar formulario modal para registro de nuevos ingresos
- [ ] Validar asignación de grados y secciones
- [ ] Generar automáticamente credenciales de usuario para alumnos nuevos
- [ ] Crear endpoints API: POST /api/matricula, GET /api/matricula/:alumno_id, PUT /api/matricula/:id

## Fase 7: Módulo Asistencia IoT
- [ ] Crear schema MongoDB para asistencia_iot (alumno_id, rfid_uid, timestamp, tipo_evento, estado)
- [ ] Implementar endpoint POST /api/iot/asistencia para recibir datos del ESP32
- [ ] Crear monitor en tiempo real que muestre ingresos de alumnos
- [ ] Implementar notificaciones en pantalla al detectar RFID
- [ ] Validar que RFID_Tag existe en base de datos antes de registrar
- [ ] Crear endpoints API: POST /api/iot/asistencia, GET /api/iot/monitor, GET /api/iot/eventos

## Fase 8: Módulo Consultas
- [ ] Crear vista de buscador avanzado por DNI o apellidos
- [ ] Implementar búsqueda instantánea con debounce
- [ ] Mostrar resultados de alumnos y profesores
- [ ] Crear vista de historial completo de asistencias por alumno
- [ ] Implementar filtros por rango de fecha
- [ ] Crear endpoints API: GET /api/consultas/buscar, GET /api/consultas/historial/:alumno_id

## Fase 9: Módulo Informes
- [ ] Crear generador de reportes mensuales
- [ ] Implementar exportación a PDF con librería (pdfkit o similar)
- [ ] Implementar exportación a Excel con librería (xlsx o similar)
- [ ] Incluir estadísticas por grado, sección y alumno
- [ ] Crear filtros por mes, grado, sección
- [ ] Crear endpoints API: GET /api/informes/pdf, GET /api/informes/excel

## Fase 10: Módulo Seguridad
- [ ] Implementar gestión de usuarios con roles (Admin/Director/Profesor)
- [ ] Crear vista de administración de usuarios
- [ ] Implementar gestión de contraseñas (cambio, reset)
- [ ] Crear sistema de permisos diferenciados por rol
- [ ] Implementar logs de acceso al sistema
- [ ] Crear endpoints API: GET /api/usuarios, POST /api/usuarios, PUT /api/usuarios/:id, DELETE /api/usuarios/:id

## Fase 11: Simulador SITL y Pruebas IoT
- [ ] Crear vista especial "Pruebas IoT" con selector de alumnos
- [ ] Implementar simulación de escaneo RFID
- [ ] Validar registro en base de datos
- [ ] Validar notificación en pantalla
- [ ] Crear endpoints API: POST /api/iot/simular

## Fase 12: Integración CallMeBot WhatsApp
- [ ] Configurar integración con API CallMeBot
- [ ] Implementar notificaciones automáticas por WhatsApp a apoderados
- [ ] Crear templates de mensajes para alertas de asistencia
- [ ] Validar entrega de mensajes
- [ ] Crear endpoints API: POST /api/notificaciones/whatsapp

## Fase 13: Pruebas y Validación
- [ ] Escribir vitest para endpoints API críticos
- [ ] Validar flujos de autenticación
- [ ] Validar CRUD de todas las entidades
- [ ] Validar integración IoT
- [ ] Validar generación de reportes
- [ ] Pruebas de rendimiento

## Fase 14: Integración Final y Entrega
- [ ] Verificar todos los módulos funcionan correctamente
- [ ] Validar identidad visual en todos los módulos
- [ ] Crear documentación de API
- [ ] Crear guía de usuario
- [ ] Realizar pruebas end-to-end
- [ ] Generar checkpoint final
