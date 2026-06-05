// Tipos compartidos entre web, API y agentes

export type EstadoCita =
  | "pendiente"
  | "confirmada"
  | "en_curso"
  | "completada"
  | "cancelada"
  | "no_show"

export type CanalCita = "web" | "whatsapp" | "walkin"

export interface Barbero {
  id: string
  nombre: string
  activo: boolean
}

export interface Servicio {
  id: string
  nombre: string
  duracion_min: number   // duración real del corte — NO incluye colchón (D4)
  activo: boolean
}

export interface Cliente {
  id: string
  nombre: string
  telefono: string
  ultimo_barbero_id: string | null
}

export interface Cita {
  id: string
  cliente_id: string
  barbero_id: string
  servicio_id: string
  inicio: string   // ISO 8601
  fin: string      // inicio + duracion_min + colchon_min
  estado: EstadoCita
  canal: CanalCita
}

export interface Configuracion {
  colchon_min: number   // buffer entre citas, separado de duracion_min (D4)
  hora_apertura: string // "09:00"
  hora_cierre: string   // "20:00"
}

// Input para crear una cita (web o agente WA)
export interface CreateBookingInput {
  cliente_id?: string
  nombre_cliente?: string   // si no existe aún en la BD
  telefono_cliente?: string
  barbero_id: string
  servicio_id: string
  inicio: string
  canal: CanalCita
}

// Slot de disponibilidad devuelto por el cálculo de huecos
export interface SlotDisponible {
  barbero_id: string
  inicio: string
  fin: string
}

// Mensaje de conversación para el historial del agente
export interface MensajeChat {
  role: "user" | "assistant"
  content: string
}
