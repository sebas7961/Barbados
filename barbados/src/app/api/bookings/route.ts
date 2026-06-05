import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { CreateBookingInput } from "@/types"

// Fuente única de verdad para crear/editar/cancelar citas.
// Tanto la web como el agente de WhatsApp deben usar este endpoint (D7).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const barberoId = searchParams.get("barbero_id")
  const fecha = searchParams.get("fecha")

  const supabase = createServerClient()

  // TODO: calcular slots libres usando duracion_min + colchon_min (HU1, HU6)
  return NextResponse.json({ slots: [] })
}

export async function POST(req: NextRequest) {
  const input: CreateBookingInput = await req.json()
  const supabase = createServerClient()

  // TODO: validar disponibilidad y crear cita (HU1, D7)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const { id, ...changes } = await req.json()
  const supabase = createServerClient()

  // TODO: actualizar cita (estado, reprogramar) — HU7
  return NextResponse.json({ ok: true })
}
