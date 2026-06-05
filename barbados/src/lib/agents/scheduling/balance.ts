import type { SlotDisponible } from "@/types"

// HU8 — sugiere al primo cuando Luis está saturado
// Evita perder clientes por falta de cupo en el barbero preferido
export interface BalanceInput {
  slotsLuis: SlotDisponible[]
  slotsPrimo: SlotDisponible[]
  inicioSolicitado: Date
  ventanaMinutos?: number // cuántos minutos hacia adelante buscar (default: 120)
}

export interface BalanceResult {
  barberoSugerido: "luis" | "primo" | null
  slotSugerido: SlotDisponible | null
  razon: string
}

export function sugerirBarbero({
  slotsLuis,
  slotsPrimo,
  inicioSolicitado,
  ventanaMinutos = 120,
}: BalanceInput): BalanceResult {
  const ventanaFin = new Date(inicioSolicitado.getTime() + ventanaMinutos * 60_000)

  const luisDisponible = slotsLuis.some(
    (s) => new Date(s.inicio) >= inicioSolicitado && new Date(s.inicio) <= ventanaFin
  )

  if (luisDisponible) {
    return { barberoSugerido: "luis", slotSugerido: null, razon: "Luis tiene disponibilidad en la ventana solicitada" }
  }

  const slotPrimo = slotsPrimo.find(
    (s) => new Date(s.inicio) >= inicioSolicitado && new Date(s.inicio) <= ventanaFin
  )

  if (slotPrimo) {
    return {
      barberoSugerido: "primo",
      slotSugerido: slotPrimo,
      razon: "Luis está saturado; el primo tiene disponibilidad cercana",
    }
  }

  return { barberoSugerido: null, slotSugerido: null, razon: "Sin disponibilidad en la ventana solicitada" }
}
