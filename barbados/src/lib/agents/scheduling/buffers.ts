import type { Servicio, Configuracion } from "@/types"

// HU6 — calcula la duración total de un slot: corte + colchón
// NUNCA mezclar duracion_min y colchon_min en un solo valor (D4)
export function calcularDuracionSlot(
  servicio: Pick<Servicio, "duracion_min">,
  config: Pick<Configuracion, "colchon_min">
): number {
  return servicio.duracion_min + config.colchon_min
}

// Devuelve la hora de fin dado un inicio y un servicio
export function calcularFin(
  inicio: Date,
  servicio: Pick<Servicio, "duracion_min">,
  config: Pick<Configuracion, "colchon_min">
): Date {
  const totalMinutos = calcularDuracionSlot(servicio, config)
  return new Date(inicio.getTime() + totalMinutos * 60_000)
}
