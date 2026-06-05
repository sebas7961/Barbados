import { NextRequest, NextResponse } from "next/server"
import { runConversationalAgent } from "@/lib/agents/conversational"

// HU4 — orquesta el agente conversacional (LLM + function calling)
export async function POST(req: NextRequest) {
  const { from, message, history } = await req.json()

  if (!from || !message) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const reply = await runConversationalAgent({ from, message, history: history ?? [] })
  return NextResponse.json({ reply })
}
