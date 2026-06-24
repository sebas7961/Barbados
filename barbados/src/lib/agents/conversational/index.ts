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
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        tools: [{
          functionDeclarations: AGENT_TOOLS.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          }))
        }],
        generationConfig: { maxOutputTokens: 500 }
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ Error Gemini:', data)
    throw new Error(data.error?.message || 'Error desconocido de Gemini')
  }

  const candidate = data.candidates?.[0]?.content
  const part = candidate?.parts?.[0]

  // El modelo quiere llamar una tool
  if (part?.functionCall) {
    const { name, args } = part.functionCall
    console.log(`🔧 Gemini tool call: ${name}`, args)

    const toolResult = await executeTool(name, args)

    // Segunda llamada con el resultado de la tool
    const followUp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [
            ...messages.map(m => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }]
            })),
            { role: 'model', parts: [{ functionCall: { name, args } }] },
            { role: 'user', parts: [{ functionResponse: { name, response: toolResult } }] }
          ],
          generationConfig: { maxOutputTokens: 500 }
        }),
      }
    )

    const followData = await followUp.json()
    return followData.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Lo siento, hubo un error.'
  }

  return part?.text ?? 'Lo siento, hubo un error.'
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