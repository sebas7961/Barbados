"use client"

import { useEffect, useState } from "react"
import { subscribeToAgenda } from "@/lib/supabase/realtime"
import type { Cita } from "@/types"

// HU9 — hook para consumir la agenda en tiempo real desde componentes React
export function useRealtimeAgenda(initialCitas: Cita[] = []) {
  const [citas, setCitas] = useState<Cita[]>(initialCitas)

  useEffect(() => {
    const unsubscribe = subscribeToAgenda((cita, event) => {
      setCitas((prev) => {
        if (event === "INSERT") return [...prev, cita]
        if (event === "UPDATE") return prev.map((c) => (c.id === cita.id ? cita : c))
        if (event === "DELETE") return prev.filter((c) => c.id !== cita.id)
        return prev
      })
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return citas
}