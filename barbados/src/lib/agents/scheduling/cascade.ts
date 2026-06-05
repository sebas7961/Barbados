import type { Cita } from "@/types"

// HU7 — reacomodo de citas posteriores cuando hay retraso
// Algoritmo determinista (sin IA en primera versión)
export interface RetrasoInput {
  barberoId: string
  citaAtrasada: Cita
  minutosRetraso: number
  citasPosteriores: Cita[]
}

export interface RetrasoResult {
  citasActualizadas: Array<{ id: string; nuevo_inicio: string; nuevo_fin: string }>
  clientesAfectados: string[]
}

export function calcularCascadaRetraso({
  citaAtrasada,
  minutosRetraso,
  citasPosteriores,
}: RetrasoInput): RetrasoResult {
  const citasActualizadas: RetrasoResult["citasActualizadas"] = []
  const clientesAfectados: string[] = []

  let acumulado = minutosRetraso

  for (const cita of citasPosteriores) {
    const inicio = new Date(cita.inicio)
    const fin = new Date(cita.fin)

    const nuevoInicio = new Date(inicio.getTime() + acumulado * 60_000)
    const nuevoFin = new Date(fin.getTime() + acumulado * 60_000)

    citasActualizadas.push({
      id: cita.id,
      nuevo_inicio: nuevoInicio.toISOString(),
      nuevo_fin: nuevoFin.toISOString(),
    })

    clientesAfectados.push(cita.cliente_id)
  }

  return { citasActualizadas, clientesAfectados }
}
