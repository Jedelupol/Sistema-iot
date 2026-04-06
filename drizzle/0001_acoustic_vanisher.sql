CREATE TABLE `alumnos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dni` varchar(20) NOT NULL,
	`nombres` varchar(100) NOT NULL,
	`apellidoPaterno` varchar(100) NOT NULL,
	`apellidoMaterno` varchar(100) NOT NULL,
	`genero` enum('M','F','Otro') NOT NULL,
	`fechaNacimiento` date NOT NULL,
	`rfidTag` varchar(50) NOT NULL,
	`usuarioId` int,
	`grado` varchar(20),
	`seccion` varchar(20),
	`telefono` varchar(20),
	`email` varchar(320),
	`estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alumnos_id` PRIMARY KEY(`id`),
	CONSTRAINT `alumnos_dni_unique` UNIQUE(`dni`),
	CONSTRAINT `alumnos_rfidTag_unique` UNIQUE(`rfidTag`)
);
--> statement-breakpoint
CREATE TABLE `asistenciaIot` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alumnoId` int NOT NULL,
	`rfidUid` varchar(50) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`tipoEvento` enum('entrada','salida','otro') NOT NULL DEFAULT 'entrada',
	`estado` enum('registrado','notificado','error') NOT NULL DEFAULT 'registrado',
	`notificacionEnviada` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `asistenciaIot_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logsAcceso` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`accion` varchar(255) NOT NULL,
	`modulo` varchar(100) NOT NULL,
	`detalles` text,
	`direccionIp` varchar(50),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logsAcceso_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matricula` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alumnoId` int NOT NULL,
	`grado` varchar(20) NOT NULL,
	`seccion` varchar(20) NOT NULL,
	`anio` int NOT NULL,
	`estado` enum('activo','inactivo','retirado') NOT NULL DEFAULT 'activo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matricula_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profesores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dni` varchar(20) NOT NULL,
	`nombres` varchar(100) NOT NULL,
	`apellidoPaterno` varchar(100) NOT NULL,
	`apellidoMaterno` varchar(100) NOT NULL,
	`genero` enum('M','F','Otro') NOT NULL,
	`fechaNacimiento` date NOT NULL,
	`usuarioId` int,
	`especialidad` varchar(100),
	`telefono` varchar(20),
	`email` varchar(320),
	`estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profesores_id` PRIMARY KEY(`id`),
	CONSTRAINT `profesores_dni_unique` UNIQUE(`dni`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','director','profesor') NOT NULL DEFAULT 'user';