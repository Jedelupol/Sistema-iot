-- ============================================================================
-- SOS DOCENTE - PLATAFORMA SaaS (MARCA BLANCA)
-- Migración Core: 4 Pilares Obligatorios
-- ============================================================================

-- PILAR 1: Núcleo SaaS (Marca Blanca) y Licenciamiento
CREATE TABLE IF NOT EXISTS `institucion` (
  `id` int AUTO_INCREMENT NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `codigo_modular` varchar(7) NOT NULL UNIQUE,
  `logo_url` text,
  `color_primario` varchar(7) DEFAULT '#3498db',
  `niveles_activos` enum('Primaria','Secundaria','Ambos') DEFAULT 'Ambos',
  `turnos` enum('Mañana','Tarde','Ambos') DEFAULT 'Ambos',
  `tipo_licencia` enum('BASICA','PRO','ELITE') NOT NULL DEFAULT 'BASICA',
  `modulos_autorizados` json DEFAULT '["dashboard","profesores","alumnos"]',
  `fecha_inicio_licencia` timestamp DEFAULT CURRENT_TIMESTAMP,
  `fecha_vencimiento_licencia` timestamp NULL,
  `estado` enum('Activo','Inactivo','Suspendido') NOT NULL DEFAULT 'Activo',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `institucion_id` PRIMARY KEY(`id`),
  CONSTRAINT `idx_codigo_modular` UNIQUE(`codigo_modular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Actualizar tabla users con institucion_id
ALTER TABLE `users` 
ADD COLUMN `institucion_id` int NOT NULL DEFAULT 1 AFTER `id`,
ADD COLUMN `dni` varchar(8) UNIQUE AFTER `email`,
MODIFY COLUMN `role` enum('admin','director','profesor','user') NOT NULL DEFAULT 'user',
ADD CONSTRAINT `users_institucion_fk` FOREIGN KEY (`institucion_id`) REFERENCES `institucion`(`id`),
ADD INDEX `idx_users_institucion` (`institucion_id`);

-- PILAR 2: Identidad Estudiantil e Importador SIAGIE
CREATE TABLE IF NOT EXISTS `alumnos` (
  `id` int AUTO_INCREMENT NOT NULL,
  `institucion_id` int NOT NULL,
  `codigo_siagie` varchar(14) NOT NULL UNIQUE,
  `dni` varchar(8) UNIQUE,
  `nombres` varchar(255) NOT NULL,
  `apellido_paterno` varchar(255) NOT NULL,
  `apellido_materno` varchar(255) NOT NULL,
  `genero` enum('M','F','Otro') DEFAULT 'M',
  `fecha_nacimiento` timestamp NULL,
  `rfid_tag` varchar(50) UNIQUE,
  `grado` varchar(10),
  `seccion` varchar(10),
  `nivel` enum('Primaria','Secundaria') DEFAULT 'Primaria',
  `estado` enum('Activo','Inactivo','Retirado') NOT NULL DEFAULT 'Activo',
  `fecha_matricula` timestamp DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `alumnos_id` PRIMARY KEY(`id`),
  CONSTRAINT `alumnos_institucion_fk` FOREIGN KEY (`institucion_id`) REFERENCES `institucion`(`id`),
  CONSTRAINT `idx_codigo_siagie` UNIQUE(`codigo_siagie`),
  CONSTRAINT `idx_dni` UNIQUE(`dni`),
  INDEX `idx_alumnos_institucion` (`institucion_id`),
  INDEX `idx_alumnos_estado` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla profesores
CREATE TABLE IF NOT EXISTS `profesores` (
  `id` int AUTO_INCREMENT NOT NULL,
  `institucion_id` int NOT NULL,
  `user_id` int NOT NULL,
  `dni` varchar(8) UNIQUE,
  `nombres` varchar(255) NOT NULL,
  `apellido_paterno` varchar(255) NOT NULL,
  `apellido_materno` varchar(255) NOT NULL,
  `especialidad` varchar(255),
  `rfid_tag` varchar(50) UNIQUE,
  `estado` enum('Activo','Inactivo','Licencia') NOT NULL DEFAULT 'Activo',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `profesores_id` PRIMARY KEY(`id`),
  CONSTRAINT `profesores_institucion_fk` FOREIGN KEY (`institucion_id`) REFERENCES `institucion`(`id`),
  CONSTRAINT `profesores_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  INDEX `idx_profesores_institucion` (`institucion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PILAR 3: Horarios Dinámicos y Motor de Asistencia IoT
CREATE TABLE IF NOT EXISTS `sesiones_docente` (
  `id` int AUTO_INCREMENT NOT NULL,
  `profesor_id` int NOT NULL,
  `institucion_id` int NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  `hora_inicio` varchar(5) NOT NULL,
  `hora_fin` varchar(5) NOT NULL,
  `curso` varchar(255) NOT NULL,
  `grado` varchar(10),
  `seccion` varchar(10),
  `aula` varchar(50),
  `estado` enum('Activo','Cancelado') DEFAULT 'Activo',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `sesiones_docente_id` PRIMARY KEY(`id`),
  CONSTRAINT `sesiones_profesor_fk` FOREIGN KEY (`profesor_id`) REFERENCES `profesores`(`id`),
  CONSTRAINT `sesiones_institucion_fk` FOREIGN KEY (`institucion_id`) REFERENCES `institucion`(`id`),
  INDEX `idx_sesiones_profesor` (`profesor_id`),
  INDEX `idx_sesiones_institucion` (`institucion_id`),
  INDEX `idx_sesiones_dia` (`dia_semana`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `asistencia_iot` (
  `id` int AUTO_INCREMENT NOT NULL,
  `institucion_id` int NOT NULL,
  `profesor_id` int,
  `alumno_id` int,
  `rfid_uid` varchar(50) NOT NULL,
  `tipo_evento` enum('Entrada','Salida') DEFAULT 'Entrada',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('Puntual','Tardanza','Ausente') NOT NULL DEFAULT 'Puntual',
  `sesion_id` int,
  `notas` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `asistencia_iot_id` PRIMARY KEY(`id`),
  CONSTRAINT `asistencia_institucion_fk` FOREIGN KEY (`institucion_id`) REFERENCES `institucion`(`id`),
  CONSTRAINT `asistencia_profesor_fk` FOREIGN KEY (`profesor_id`) REFERENCES `profesores`(`id`),
  CONSTRAINT `asistencia_alumno_fk` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`),
  CONSTRAINT `asistencia_sesion_fk` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones_docente`(`id`),
  INDEX `idx_asistencia_institucion` (`institucion_id`),
  INDEX `idx_asistencia_timestamp` (`timestamp`),
  INDEX `idx_asistencia_rfid` (`rfid_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PILAR 4: Alertas Tempranas de Deserción
CREATE TABLE IF NOT EXISTS `alertas_desercion` (
  `id` int AUTO_INCREMENT NOT NULL,
  `institucion_id` int NOT NULL,
  `alumno_id` int NOT NULL,
  `nivel_riesgo` enum('Bajo','Medio','Alto') NOT NULL DEFAULT 'Medio',
  `razon` text,
  `fecha_deteccion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado_revision` enum('Pendiente','Revisado','Resuelto','Descartado') NOT NULL DEFAULT 'Pendiente',
  `revisado_por` int,
  `fecha_revision` timestamp NULL,
  `notas_director` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `alertas_desercion_id` PRIMARY KEY(`id`),
  CONSTRAINT `alertas_institucion_fk` FOREIGN KEY (`institucion_id`) REFERENCES `institucion`(`id`),
  CONSTRAINT `alertas_alumno_fk` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos`(`id`),
  CONSTRAINT `alertas_revisado_fk` FOREIGN KEY (`revisado_por`) REFERENCES `users`(`id`),
  INDEX `idx_alertas_institucion` (`institucion_id`),
  INDEX `idx_alertas_alumno` (`alumno_id`),
  INDEX `idx_alertas_estado` (`estado_revision`),
  INDEX `idx_alertas_fecha` (`fecha_deteccion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de auditoría de importaciones SIAGIE
CREATE TABLE IF NOT EXISTS `importaciones_siagie` (
  `id` int AUTO_INCREMENT NOT NULL,
  `institucion_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `cantidad_registros` int DEFAULT 0,
  `cantidad_exitosos` int DEFAULT 0,
  `cantidad_errores` int DEFAULT 0,
  `estado` enum('Procesando','Completado','Error') DEFAULT 'Procesando',
  `detalles_error` text,
  `fecha_importacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `importaciones_siagie_id` PRIMARY KEY(`id`),
  CONSTRAINT `importaciones_institucion_fk` FOREIGN KEY (`institucion_id`) REFERENCES `institucion`(`id`),
  CONSTRAINT `importaciones_usuario_fk` FOREIGN KEY (`usuario_id`) REFERENCES `users`(`id`),
  INDEX `idx_importaciones_institucion` (`institucion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
