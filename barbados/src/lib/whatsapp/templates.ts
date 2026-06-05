// Textos de plantillas salientes — HU5

export const TEMPLATES = {
  // Confirmación de nueva cita
  CONFIRMACION: "Hola {{1}}, tu cita en Barbados está confirmada para el {{2}} a las {{3}} con {{4}}. ¡Te esperamos!",

  // Recordatorio 24h antes
  RECORDATORIO_24H: "Hola {{1}}, te recordamos que mañana {{2}} a las {{3}} tienes cita en Barbados con {{4}}. ¿Confirmas tu asistencia?",

  // Aviso de retraso — HU7
  AVISO_RETRASO: "Hola {{1}}, te avisamos que tu cita de hoy a las {{2}} se retrasa aproximadamente {{3}} minutos. Tu nueva hora estimada es {{4}}. Disculpa las molestias.",

  // Sugerencia del primo — HU8
  SUGERENCIA_PRIMO: "Hola {{1}}, Luis no tiene disponibilidad en ese horario, pero {{2}} (nuestro otro barbero) tiene espacio libre. ¿Te agendamos con él?",
} as const

export type TemplateKey = keyof typeof TEMPLATES
