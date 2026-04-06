import axios from "axios";

const CALLMEBOT_API_URL = "https://api.callmebot.com/whatsapp.php";

export interface MensajeWhatsApp {
  numero: string;
  mensaje: string;
  apikey?: string;
}

/**
 * Servicio para enviar notificaciones por WhatsApp vía CallMeBot
 */
export class CallMeBotService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CALLMEBOT_API_KEY || "";
  }

  /**
   * Enviar mensaje de asistencia registrada
   */
  async notificarAsistencia(
    numeroApoderado: string,
    nombreAlumno: string,
    estado: "Puntual" | "Tardanza" | "Ausente",
    hora: string
  ): Promise<boolean> {
    const emoji =
      estado === "Puntual"
        ? "✅"
        : estado === "Tardanza"
          ? "⏰"
          : "❌";

    const mensaje = `${emoji} *Asistencia Registrada*\n\nAlumno: ${nombreAlumno}\nEstado: ${estado}\nHora: ${hora}\n\nSistema SOS Docente`;

    return this.enviarMensaje(numeroApoderado, mensaje);
  }

  /**
   * Enviar notificación de alerta de deserción
   */
  async notificarAlertaDesercion(
    numeroDirector: string,
    nombreAlumno: string,
    nivelRiesgo: "Bajo" | "Medio" | "Alto",
    razon: string
  ): Promise<boolean> {
    const emoji = nivelRiesgo === "Alto" ? "🚨" : "⚠️";

    const mensaje = `${emoji} *Alerta de Deserción*\n\nAlumno: ${nombreAlumno}\nNivel de Riesgo: ${nivelRiesgo}\nRazón: ${razon}\n\nAcción requerida - SOS Docente`;

    return this.enviarMensaje(numeroDirector, mensaje);
  }

  /**
   * Enviar mensaje genérico
   */
  async enviarMensaje(numero: string, mensaje: string): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.warn(
          "[CallMeBot] API Key no configurada. Mensaje no enviado."
        );
        return false;
      }

      // Normalizar número (agregar código de país si es necesario)
      const numeroFormateado = numero.startsWith("+")
        ? numero.replace("+", "")
        : numero;

      const response = await axios.get(CALLMEBOT_API_URL, {
        params: {
          phone: numeroFormateado,
          text: mensaje,
          apikey: this.apiKey,
        },
        timeout: 5000,
      });

      if (response.status === 200) {
        console.log(
          `[CallMeBot] Mensaje enviado a ${numeroFormateado}`
        );
        return true;
      }

      console.error(
        `[CallMeBot] Error al enviar mensaje: ${response.statusText}`
      );
      return false;
    } catch (error) {
      console.error(
        "[CallMeBot] Error:",
        error instanceof Error ? error.message : "Error desconocido"
      );
      return false;
    }
  }

  /**
   * Enviar notificación de importación SIAGIE completada
   */
  async notificarImportacionSiagie(
    numeroDirector: string,
    cantidadExitosos: number,
    cantidadErrores: number
  ): Promise<boolean> {
    const mensaje =
      cantidadErrores === 0
        ? `✅ *Importación SIAGIE Exitosa*\n\nRegistros importados: ${cantidadExitosos}\n\nSOS Docente`
        : `⚠️ *Importación SIAGIE Completada con Errores*\n\nExitosos: ${cantidadExitosos}\nErrores: ${cantidadErrores}\n\nSOS Docente`;

    return this.enviarMensaje(numeroDirector, mensaje);
  }
}

export const callmebotService = new CallMeBotService();
