import { SYSTEM_PROMPT } from "./prompt"
import { AGENT_TOOLS } from "./tools"
import type { MensajeChat } from "@/types"

interface AgentInput {
  from: string
  message: string
  history: MensajeChat[]
}

// HU4 — bucle principal del agente conversacional
// Usa el LLM configurado en LLM_PROVIDER (gemini | groq) con function calling
export async function runConversationalAgent({ from, message, history }: AgentInput): Promise<string> {
  const provider = process.env.LLM_PROVIDER ?? "gemini"

  const messages: MensajeChat[] = [
    ...history,
    { role: "user", content: message },
  ]

  if (provider === "gemini") {
    return runWithGemini(messages)
  }

  return runWithGroq(messages)
}

async function runWithGemini(messages: MensajeChat[]): Promise<string> {
  // TODO: integrar @google/generative-ai con function calling
  // Tools disponibles: AGENT_TOOLS
  // System prompt: SYSTEM_PROMPT
  throw new Error("Gemini no implementado aún — añadir @google/generative-ai")
}

async function runWithGroq(messages: MensajeChat[]): Promise<string> {
  // TODO: integrar Groq SDK con function calling compatible con OpenAI
  throw new Error("Groq no implementado aún — añadir groq-sdk")
}
