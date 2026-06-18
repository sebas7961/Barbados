import Groq from 'groq-sdk'
import { SYSTEM_PROMPT } from "./prompt"
import { AGENT_TOOLS } from "./tools"
import { executeTool } from "@/lib/agents/tools/executor"
import type { MensajeChat } from "@/types"

interface AgentInput {
  from: string
  message: string
  history: MensajeChat[]
}

export async function runConversationalAgent({ from, message, history }: AgentInput): Promise<string> {
  const provider = process.env.LLM_PROVIDER ?? "groq"
  const messages: MensajeChat[] = [...history, { role: "user", content: message }]

  if (provider === "gemini") return runWithGemini(messages)
  return runWithGroq(messages)
}

async function runWithGemini(messages: MensajeChat[]): Promise<string> {
  throw new Error("Gemini no implementado aún")
}

async function runWithGroq(messages: MensajeChat[]): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const formattedMessages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
  ]

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: formattedMessages,
    tools: AGENT_TOOLS.map(tool => ({
      type: 'function' as const,
      function: { name: tool.name, description: tool.description, parameters: tool.parameters }
    })),
    tool_choice: 'auto',
    max_tokens: 500,
  })

  const choice = response.choices[0]

  if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
    const toolCall = choice.message.tool_calls[0]
    const toolResult = await executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments))

    const finalResponse = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        ...formattedMessages,
        choice.message,
        { role: 'tool' as const, tool_call_id: toolCall.id, content: JSON.stringify(toolResult) }
      ],
      max_tokens: 500,
    })

    return finalResponse.choices[0].message.content ?? 'Lo siento, hubo un error.'
  }

  return choice.message.content ?? 'Lo siento, hubo un error.'
}