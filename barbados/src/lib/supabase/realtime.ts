import { createClient } from "./client"
import type { Cita } from "@/types"

// HU9 — suscripción realtime a cambios en la tabla citas
// Garantiza que web y WhatsApp vean la misma agenda sin overbooking (D7)
export function subscribeToAgenda(
  callback: (cita: Cita, event: "INSERT" | "UPDATE" | "DELETE") => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel("agenda-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "citas" },
      (payload) => {
        const event = payload.eventType as "INSERT" | "UPDATE" | "DELETE"
        callback(payload.new as Cita, event)
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
