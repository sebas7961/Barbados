import { NextRequest, NextResponse } from "next/server"

// HU4 — recibe mensajes entrantes de Twilio / Meta
// Valida firma, extrae el cuerpo y lo pasa al agente conversacional
export async function POST(req: NextRequest) {
  const body = await req.formData()

  const from = body.get("From") as string
  const message = body.get("Body") as string

  if (!from || !message) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  // TODO: validar firma HMAC de Twilio antes de procesar
  // TODO: llamar a /api/agent con { from, message }

  return NextResponse.json({ ok: true })
}
