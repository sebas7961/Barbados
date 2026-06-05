import { NextRequest, NextResponse } from "next/server"
import { sendWhatsAppMessage } from "@/lib/whatsapp/provider"

// HU5 — envía plantillas y recordatorios salientes
export async function POST(req: NextRequest) {
  const { to, template, params } = await req.json()

  if (!to || !template) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  await sendWhatsAppMessage({ to, template, params })
  return NextResponse.json({ ok: true })
}
