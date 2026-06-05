// Abstracción sobre Twilio (dev) / Meta (prod)
// Cambiar WHATSAPP_PROVIDER en .env para alternar sin tocar código

interface SendMessageOptions {
  to: string
  template: string
  params?: string[]
  body?: string
}

export async function sendWhatsAppMessage(opts: SendMessageOptions) {
  const provider = process.env.WHATSAPP_PROVIDER ?? "twilio"

  if (provider === "twilio") {
    return sendViaTwilio(opts)
  }

  return sendViaMeta(opts)
}

async function sendViaTwilio({ to, body, template, params }: SendMessageOptions) {
  const twilio = await import("twilio")
  const client = twilio.default(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )

  const text = body ?? buildTemplateText(template, params ?? [])

  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER!,
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    body: text,
  })
}

async function sendViaMeta(_opts: SendMessageOptions) {
  // TODO: implementar con la API de Meta Cloud para producción
  throw new Error("Meta provider no implementado aún")
}

function buildTemplateText(template: string, params: string[]): string {
  return params.reduce((text, param, i) => text.replace(`{{${i + 1}}}`, param), template)
}
