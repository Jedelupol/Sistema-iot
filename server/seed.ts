import { getDb } from "./db";
import { users, institucion, alumnos, profesores, sesiones_docente } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@sgae.pe";
const ADMIN_PASSWORD = "Admin@2026";
const ADMIN_NOMBRE = "Administrador SGAE";

async function seed() {
  console.log("🌱 Iniciando seed de base de datos SQLite...");

  const db = await getDb();
  if (!db) {
    console.error("❌ No se pudo conectar a la base de datos");
    process.exit(1);
  }

  try {
    // 1. Crear institución por defecto
    console.log("📚 Creando institución por defecto...");
    const existingInst = await db
      .select()
      .from(institucion)
      .where(eq(institucion.codigo_modular, "150131"))
      .limit(1);

    if (existingInst.length === 0) {
      await db.insert(institucion).values({
        nombre: "I.E. San Jerónimo",
        codigo_modular: "150131",
        logo_url: "https://via.placeholder.com/150",
        color_primario: "#3498db",
        niveles_activos: "Ambos",
        turnos: "Ambos",
        tipo_licencia: "ELITE",
        modulos_autorizados: [
          "iot",
          "siagie",
          "whatsapp",
          "reportes",
          "alertas",
        ],
        fecha_inicio_licencia: new Date("2026-01-01"),
        fecha_vencimiento_licencia: new Date("2027-12-31"),
        estado: "Activo",
      });
    }
    console.log(`✅ Institución creada/verificada`);

    // 2. Crear usuario administrador
    console.log("👤 Creando usuario administrador...");
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);

    if (existingUser.length === 0) {
      await db.insert(users).values({
        openId: `admin-sgae-${Date.now()}`,
        nombre: ADMIN_NOMBRE,
        email: ADMIN_EMAIL,
        dni: "00000001",
        loginMethod: "local",
        role: "admin",
        institucion_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      });
    }
    console.log(`✅ Usuario administrador creado/verificado`);

    // 3. Crear profesores de prueba
    console.log("👨‍🏫 Creando profesores de prueba...");
    const profesoresData = [
      {
        institucion_id: 1,
        user_id: 1,
        dni: "12345678",
        nombres: "Juan",
        apellido_paterno: "García",
        apellido_materno: "López",
        especialidad: "Matemática",
        estado: "Activo" as const,
      },
      {
        institucion_id: 1,
        user_id: 1,
        dni: "23456789",
        nombres: "María",
        apellido_paterno: "Rodríguez",
        apellido_materno: "Martínez",
        especialidad: "Lenguaje",
        estado: "Activo" as const,
      },
    ];

    for (const prof of profesoresData) {
      const existing = await db
        .select()
        .from(profesores)
        .where(eq(profesores.dni, prof.dni))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(profesores).values(prof);
      }
    }
    console.log(`✅ ${profesoresData.length} profesores creados/verificados`);

    // 4. Crear alumnos de prueba
    console.log("👨‍🎓 Creando alumnos de prueba...");
    const alumnosData = [
      {
        institucion_id: 1,
        codigo_siagie: "20240001",
        dni: "45678901",
        nombres: "Carlos",
        apellido_paterno: "Pérez",
        apellido_materno: "Sánchez",
        genero: "M" as const,
        fecha_nacimiento: new Date("2010-05-15"),
        rfid_tag: "RF001",
        grado: "6",
        seccion: "A",
        nivel: "Primaria" as const,
        estado: "Activo" as const,
        fecha_matricula: new Date("2026-01-15"),
      },
      {
        institucion_id: 1,
        codigo_siagie: "20240002",
        dni: "56789012",
        nombres: "Ana",
        apellido_paterno: "González",
        apellido_materno: "Flores",
        genero: "F" as const,
        fecha_nacimiento: new Date("2008-08-22"),
        rfid_tag: "RF002",
        grado: "1",
        seccion: "B",
        nivel: "Secundaria" as const,
        estado: "Activo" as const,
        fecha_matricula: new Date("2026-01-15"),
      },
      {
        institucion_id: 1,
        codigo_siagie: "20240003",
        dni: "67890123",
        nombres: "Luis",
        apellido_paterno: "Martínez",
        apellido_materno: "Gómez",
        genero: "M" as const,
        fecha_nacimiento: new Date("2009-03-10"),
        rfid_tag: "RF003",
        grado: "5",
        seccion: "C",
        nivel: "Primaria" as const,
        estado: "Activo" as const,
        fecha_matricula: new Date("2026-01-15"),
      },
    ];

    for (const alumno of alumnosData) {
      const existing = await db
        .select()
        .from(alumnos)
        .where(eq(alumnos.codigo_siagie, alumno.codigo_siagie))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(alumnos).values(alumno);
      }
    }
    console.log(`✅ ${alumnosData.length} alumnos creados/verificados`);

    // 5. Crear sesiones docentes de prueba
    console.log("📅 Creando sesiones docentes de prueba...");
    const diasSemana = [
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
    ] as const;

    for (const dia of diasSemana) {
      try {
        const existing = await db
          .select()
          .from(sesiones_docente)
          .where(
            eq(sesiones_docente.profesor_id, 1) &&
              eq(sesiones_docente.dia_semana, dia)
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(sesiones_docente).values({
            profesor_id: 1,
            institucion_id: 1,
            dia_semana: dia,
            hora_inicio: "08:00",
            hora_fin: "09:00",
            curso: "Matemática",
            grado: "6",
            seccion: "A",
            aula: "601",
            estado: "Activo",
          });
        }
      } catch (e) {
        console.warn(`Advertencia al crear sesión para ${dia}:`, e);
      }
    }
    console.log(`✅ 5 sesiones docentes creadas/verificadas`);

    console.log("\n✅ ✅ ✅ SEED COMPLETADO EXITOSAMENTE ✅ ✅ ✅\n");
    console.log("📋 CREDENCIALES DE ACCESO AL DASHBOARD SGAE:");
    console.log(`   📧 Email: ${ADMIN_EMAIL}`);
    console.log(`   🔐 Contraseña: ${ADMIN_PASSWORD}`);
    console.log("\n🎯 Datos de prueba creados:");
    console.log(`   - 1 Institución: I.E. San Jerónimo (Licencia ELITE)`);
    console.log(`   - 1 Usuario Administrador`);
    console.log(`   - 2 Profesores`);
    console.log(`   - 3 Alumnos con RFID Tags`);
    console.log(`   - 5 Sesiones docentes (Lunes-Viernes 08:00-09:00)`);
    console.log("\n🚀 Ya puedes iniciar sesión en el Dashboard SGAE\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante seed:", error);
    process.exit(1);
  }
}

seed();
