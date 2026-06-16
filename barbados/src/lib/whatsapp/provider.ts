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

async function sendViaMeta({ to, body, template, params }: SendMessageOptions) {
  const text = body ?? buildTemplateText(template, params ?? [])

  const response = await fetch(
    `https://graph.facebook.com/v25.0/${process.env.META_WA_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.META_WA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace('whatsapp:', ''), // limpia el prefijo si viene de Twilio
        type: 'text',
        text: { body: text },
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.error('❌ Error Meta:', data)
    throw new Error(data.error?.message || 'Error desconocido de Meta')
  }

  console.log('✅ Mensaje enviado por Meta:', data)
  return data
}

function buildTemplateText(template: string, params: string[]): string {
  return params.reduce((text, param, i) => text.replace(`{{${i + 1}}}`, param), template)
}