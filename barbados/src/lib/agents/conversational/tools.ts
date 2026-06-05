// Function calling tools para el agente LLM — HU4
// La misma lógica que usa la web, sin duplicar (D7)

export const AGENT_TOOLS = [
  {
    name: "verHorariosDisponibles",
    description: "Devuelve los slots libres para un barbero y fecha dados.",
    parameters: {
      type: "object",
      properties: {
        barbero_id: { type: "string", description: "ID del barbero (opcional, null = cualquiera)" },
        fecha: { type: "string", description: "Fecha en formato YYYY-MM-DD" },
        servicio_id: { type: "string", description: "ID del servicio para calcular duración" },
      },
      required: ["fecha", "servicio_id"],
    },
  },
  {
    name: "crearCita",
    description: "Crea una nueva cita confirmada para el cliente.",
    parameters: {
      type: "object",
      properties: {
        nombre_cliente: { type: "string" },
        telefono_cliente: { type: "string" },
        barbero_id: { type: "string" },
        servicio_id: { type: "string" },
        inicio: { type: "string", description: "ISO 8601 datetime" },
      },
      required: ["nombre_cliente", "telefono_cliente", "barbero_id", "servicio_id", "inicio"],
    },
  },
  {
    name: "reprogramarCita",
    description: "Cambia la fecha/hora de una cita existente.",
    parameters: {
      type: "object",
      properties: {
        cita_id: { type: "string" },
        nuevo_inicio: { type: "string", description: "ISO 8601 datetime" },
      },
      required: ["cita_id", "nuevo_inicio"],
    },
  },
  {
    name: "cancelarCita",
    description: "Cancela una cita existente.",
    parameters: {
      type: "object",
      properties: {
        cita_id: { type: "string" },
      },
      required: ["cita_id"],
    },
  },
]
